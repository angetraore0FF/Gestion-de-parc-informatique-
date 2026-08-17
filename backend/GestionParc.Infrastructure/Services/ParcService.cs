using GestionParc.Application.DTOs;
using GestionParc.Application.Interfaces;
using GestionParc.Domain.Entities;
using GestionParc.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GestionParc.Infrastructure.Services;

public class ParcService(GestionParcDbContext db) : IParcService
{
    public async Task<IReadOnlyList<ParcDto>> GetAllAsync(int? clientId = null, CancellationToken ct = default)
    {
        var query = db.Parcs.Include(p => p.Client).AsQueryable();
        if (clientId is not null)
            query = query.Where(p => p.ClientId == clientId);

        return await query
            .Select(p => new ParcDto(p.Id, p.Name, p.Description, p.ClientId, p.Client.Name, p.Equipements.Count))
            .ToListAsync(ct);
    }

    public async Task<ParcDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await db.Parcs
            .Where(p => p.Id == id)
            .Select(p => new ParcDto(p.Id, p.Name, p.Description, p.ClientId, p.Client.Name, p.Equipements.Count))
            .FirstOrDefaultAsync(ct);
    }

    public async Task<ParcDto> CreateAsync(CreateParcDto dto, CancellationToken ct = default)
    {
        var parc = new Parc
        {
            Name = dto.Name,
            Description = dto.Description,
            ClientId = dto.ClientId,
        };

        db.Parcs.Add(parc);
        await db.SaveChangesAsync(ct);
        await db.Entry(parc).Reference(p => p.Client).LoadAsync(ct);

        return ToDto(parc);
    }

    public async Task<ParcDto?> UpdateAsync(int id, UpdateParcDto dto, CancellationToken ct = default)
    {
        var parc = await db.Parcs.Include(p => p.Client).FirstOrDefaultAsync(p => p.Id == id, ct);
        if (parc is null) return null;

        parc.Name = dto.Name;
        parc.Description = dto.Description;
        parc.ClientId = dto.ClientId;
        parc.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);
        await db.Entry(parc).Reference(p => p.Client).LoadAsync(ct);

        return ToDto(parc);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var parc = await db.Parcs.FindAsync([id], ct);
        if (parc is null) return false;

        db.Parcs.Remove(parc);
        await db.SaveChangesAsync(ct);
        return true;
    }

    private static ParcDto ToDto(Parc p) => new(
        p.Id,
        p.Name,
        p.Description,
        p.ClientId,
        p.Client.Name,
        p.Equipements.Count);
}
