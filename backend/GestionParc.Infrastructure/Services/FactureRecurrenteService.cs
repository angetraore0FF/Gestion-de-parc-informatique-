using GestionParc.Application.DTOs;
using GestionParc.Application.Interfaces;
using GestionParc.Domain.Entities;
using GestionParc.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GestionParc.Infrastructure.Services;

public class FactureRecurrenteService(GestionParcDbContext db) : IFactureRecurrenteService
{
    public async Task<IReadOnlyList<FactureRecurrenteDto>> GetAllAsync(int? contratId = null, CancellationToken ct = default)
    {
        var query = db.FacturesRecurrentes
            .Include(f => f.Contrat)
            .Include(f => f.Client)
            .AsQueryable();

        if (contratId is not null)
            query = query.Where(f => f.ContratId == contratId);

        return await query
            .OrderByDescending(f => f.DateFacture)
            .Select(f => ToDto(f))
            .ToListAsync(ct);
    }

    public async Task<FactureRecurrenteDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await db.FacturesRecurrentes
            .Include(f => f.Contrat)
            .Include(f => f.Client)
            .Where(f => f.Id == id)
            .Select(f => ToDto(f))
            .FirstOrDefaultAsync(ct);
    }

    public async Task<FactureRecurrenteDto?> UpdateStatutAsync(int id, UpdateFactureRecurrenteDto dto, CancellationToken ct = default)
    {
        var facture = await db.FacturesRecurrentes
            .Include(f => f.Contrat)
            .Include(f => f.Client)
            .FirstOrDefaultAsync(f => f.Id == id, ct);

        if (facture is null) return null;

        facture.Statut = dto.Statut;
        facture.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        return ToDto(facture);
    }

    private static FactureRecurrenteDto ToDto(FactureRecurrente f) => new(
        f.Id,
        f.ContratId,
        f.Contrat.Name,
        f.ClientId,
        f.Client.Name,
        f.DateFacture,
        f.Montant,
        f.Statut);
}
