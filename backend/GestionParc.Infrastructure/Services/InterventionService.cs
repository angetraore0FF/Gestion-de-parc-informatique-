using GestionParc.Application.DTOs;
using GestionParc.Application.Interfaces;
using GestionParc.Domain.Entities;
using GestionParc.Domain.Enums;
using GestionParc.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GestionParc.Infrastructure.Services;

public class InterventionService(GestionParcDbContext db) : IInterventionService
{
    public async Task<IReadOnlyList<InterventionDto>> GetAllAsync(int? clientId = null, CancellationToken ct = default)
    {
        var query = BaseQuery();
        if (clientId is not null)
            query = query.Where(i => i.ClientId == clientId);

        var interventions = await query.OrderByDescending(i => i.DateIntervention).ToListAsync(ct);
        return interventions.Select(ToDto).ToList();
    }

    public async Task<InterventionDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var intervention = await BaseQuery().FirstOrDefaultAsync(i => i.Id == id, ct);
        return intervention is null ? null : ToDto(intervention);
    }

    public async Task<InterventionDto> CreateAsync(CreateInterventionDto dto, CancellationToken ct = default)
    {
        var intervention = new Intervention
        {
            Name = dto.Name,
            ClientId = dto.ClientId,
            EquipementId = dto.EquipementId,
            DateIntervention = dto.DateIntervention ?? DateTime.UtcNow,
            Description = dto.Description,
            TechnicienId = dto.TechnicienId,
            Statut = dto.Statut,
            ContactReferent = dto.ContactReferent,
            DateDebutPanne = dto.DateDebutPanne,
            DescriptionResolution = dto.DescriptionResolution,
            IntervenantResolution = dto.IntervenantResolution,
        };

        if (dto.Materiels is { Count: > 0 })
        {
            foreach (var m in dto.Materiels)
            {
                var prixUnitaire = m.PrixUnitaire ?? await db.Produits
                    .Where(p => p.Id == m.ProduitId)
                    .Select(p => p.PrixUnitaire)
                    .FirstAsync(ct);

                intervention.Materiels.Add(new InterventionMateriel
                {
                    ProduitId = m.ProduitId,
                    Description = m.Description,
                    Quantite = m.Quantite,
                    PrixUnitaire = prixUnitaire,
                    MontantTotal = m.Quantite * prixUnitaire,
                });
            }
        }

        db.Interventions.Add(intervention);
        await db.SaveChangesAsync(ct);

        var saved = await BaseQuery().FirstAsync(i => i.Id == intervention.Id, ct);
        return ToDto(saved);
    }

    public async Task<InterventionDto?> UpdateAsync(int id, UpdateInterventionDto dto, CancellationToken ct = default)
    {
        var intervention = await db.Interventions.FirstOrDefaultAsync(i => i.Id == id, ct);
        if (intervention is null) return null;

        intervention.Name = dto.Name;
        intervention.ClientId = dto.ClientId;
        intervention.EquipementId = dto.EquipementId;
        intervention.DateIntervention = dto.DateIntervention;
        intervention.Description = dto.Description;
        intervention.TechnicienId = dto.TechnicienId;
        intervention.Statut = dto.Statut;
        intervention.ContactReferent = dto.ContactReferent;
        intervention.DateDebutPanne = dto.DateDebutPanne;
        intervention.DescriptionResolution = dto.DescriptionResolution;
        intervention.IntervenantResolution = dto.IntervenantResolution;
        intervention.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        var saved = await BaseQuery().FirstAsync(i => i.Id == id, ct);
        return ToDto(saved);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var intervention = await db.Interventions.FindAsync([id], ct);
        if (intervention is null) return false;

        db.Interventions.Remove(intervention);
        await db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<FactureInterventionDto> GenererFactureAsync(int id, CancellationToken ct = default)
    {
        var intervention = await db.Interventions
            .Include(i => i.Materiels)
            .ThenInclude(m => m.Produit)
            .FirstOrDefaultAsync(i => i.Id == id, ct)
            ?? throw new KeyNotFoundException("Intervention introuvable.");

        if (intervention.FactureInterventionId is not null)
            throw new InvalidOperationException("Une facture a déjà été générée pour cette intervention.");

        if (intervention.Materiels.Count == 0)
            throw new InvalidOperationException("Aucun matériel n'est lié à l'intervention.");

        var facture = new FactureIntervention
        {
            ClientId = intervention.ClientId,
            DateFacture = DateOnly.FromDateTime(DateTime.UtcNow),
            Statut = StatutFacture.Brouillon,
            MontantTotal = intervention.Materiels.Sum(m => m.MontantTotal),
        };

        foreach (var m in intervention.Materiels)
        {
            facture.Lignes.Add(new FactureInterventionLigne
            {
                ProduitId = m.ProduitId,
                Description = m.Description ?? m.Produit.Name,
                Quantite = m.Quantite,
                PrixUnitaire = m.PrixUnitaire,
                MontantTotal = m.MontantTotal,
            });
        }

        db.FacturesIntervention.Add(facture);
        await db.SaveChangesAsync(ct);

        intervention.FactureInterventionId = facture.Id;
        await db.SaveChangesAsync(ct);

        return new FactureInterventionDto(facture.Id, facture.ClientId, facture.DateFacture, facture.MontantTotal, facture.Statut, intervention.Id);
    }

    private IQueryable<Intervention> BaseQuery() => db.Interventions
        .Include(i => i.Client)
        .Include(i => i.Equipement)
        .Include(i => i.Technicien)
        .Include(i => i.Materiels)
        .ThenInclude(m => m.Produit);

    private static InterventionDto ToDto(Intervention i) => new(
        i.Id,
        i.Name,
        i.ClientId,
        i.Client.Name,
        i.EquipementId,
        i.Equipement.Name,
        i.DateIntervention,
        i.Description,
        i.TechnicienId,
        i.Technicien?.Name,
        i.Statut,
        i.FactureInterventionId,
        i.ContactReferent,
        i.DateDebutPanne,
        i.DescriptionResolution,
        i.IntervenantResolution,
        i.Materiels.Select(m => new InterventionMaterielDto(
            m.Id, m.ProduitId, m.Produit.Name, m.Description, m.Quantite, m.PrixUnitaire, m.MontantTotal)).ToList());
}
