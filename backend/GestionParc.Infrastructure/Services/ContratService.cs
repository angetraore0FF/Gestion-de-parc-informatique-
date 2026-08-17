using GestionParc.Application.DTOs;
using GestionParc.Application.Interfaces;
using GestionParc.Domain.Entities;
using GestionParc.Domain.Enums;
using GestionParc.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GestionParc.Infrastructure.Services;

public class ContratService(GestionParcDbContext db) : IContratService
{
    public async Task<IReadOnlyList<ContratDto>> GetAllAsync(int? clientId = null, CancellationToken ct = default)
    {
        var query = db.Contrats
            .Include(c => c.Client)
            .Include(c => c.Equipements)
            .AsQueryable();

        if (clientId is not null)
            query = query.Where(c => c.ClientId == clientId);

        var contrats = await query.OrderByDescending(c => c.DateDebut).ToListAsync(ct);
        return contrats.Select(ToDto).ToList();
    }

    public async Task<ContratDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var contrat = await db.Contrats
            .Include(c => c.Client)
            .Include(c => c.Equipements)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

        return contrat is null ? null : ToDto(contrat);
    }

    public async Task<ContratDto> CreateAsync(CreateContratDto dto, CancellationToken ct = default)
    {
        var contrat = new Contrat
        {
            Name = "New",
            ClientId = dto.ClientId,
            DateDebut = dto.DateDebut,
            DateFin = dto.DateFin,
            Statut = dto.Statut,
            Montant = dto.Montant,
            Recurrence = dto.Recurrence,
            ProchaineFacture = dto.ProchaineFacture ?? DateOnly.FromDateTime(DateTime.UtcNow),
        };

        db.Contrats.Add(contrat);
        await db.SaveChangesAsync(ct);

        contrat.Name = $"CTR-{contrat.Id:D6}";

        if (dto.EquipementIds is { Count: > 0 })
        {
            foreach (var equipementId in dto.EquipementIds)
                contrat.Equipements.Add(new ContratEquipement { ContratId = contrat.Id, EquipementId = equipementId });
        }

        await db.SaveChangesAsync(ct);
        await db.Entry(contrat).Reference(c => c.Client).LoadAsync(ct);

        return ToDto(contrat);
    }

    public async Task<ContratDto?> UpdateAsync(int id, UpdateContratDto dto, CancellationToken ct = default)
    {
        var contrat = await db.Contrats
            .Include(c => c.Client)
            .Include(c => c.Equipements)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

        if (contrat is null) return null;

        var statutChange = contrat.Statut != dto.Statut;

        contrat.ClientId = dto.ClientId;
        contrat.DateDebut = dto.DateDebut;
        contrat.DateFin = dto.DateFin;
        contrat.Statut = dto.Statut;
        contrat.Montant = dto.Montant;
        contrat.Recurrence = dto.Recurrence;
        contrat.ProchaineFacture = dto.ProchaineFacture;
        contrat.UpdatedAt = DateTime.UtcNow;

        if (dto.EquipementIds is not null)
        {
            contrat.Equipements.Clear();
            foreach (var equipementId in dto.EquipementIds)
                contrat.Equipements.Add(new ContratEquipement { ContratId = contrat.Id, EquipementId = equipementId });
        }

        await db.SaveChangesAsync(ct);

        // Placeholder for status-change notification (Odoo message_post equivalent).
        _ = statutChange;

        return ToDto(contrat);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var contrat = await db.Contrats.FindAsync([id], ct);
        if (contrat is null) return false;

        db.Contrats.Remove(contrat);
        await db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<int> GenererFacturesRecurrentesAsync(CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var contrats = await db.Contrats
            .Where(c => c.ProchaineFacture <= today && c.Statut == StatutContrat.Actif)
            .ToListAsync(ct);

        foreach (var contrat in contrats)
        {
            db.FacturesRecurrentes.Add(new FactureRecurrente
            {
                ContratId = contrat.Id,
                ClientId = contrat.ClientId,
                DateFacture = today,
                Montant = contrat.Montant,
                Statut = StatutFacture.Brouillon,
            });

            var delta = contrat.Recurrence switch
            {
                RecurrenceContrat.Mois => 30,
                RecurrenceContrat.Trimestre => 90,
                RecurrenceContrat.Annee => 365,
                _ => 30,
            };

            contrat.ProchaineFacture = today.AddDays(delta);
        }

        await db.SaveChangesAsync(ct);
        return contrats.Count;
    }

    private static ContratDto ToDto(Contrat c) => new(
        c.Id,
        c.Name,
        c.ClientId,
        c.Client.Name,
        c.DateDebut,
        c.DateFin,
        c.Statut,
        c.Montant,
        c.Recurrence,
        c.ProchaineFacture,
        c.Equipements.Select(e => e.EquipementId).ToList());
}
