using GestionParc.Application.DTOs;
using GestionParc.Application.Interfaces;
using GestionParc.Domain.Entities;
using GestionParc.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GestionParc.Infrastructure.Services;

public class TechnicienService(GestionParcDbContext db) : ITechnicienService
{
    public async Task<IReadOnlyList<TechnicienDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await db.Techniciens.Select(t => ToDto(t)).ToListAsync(ct);
    }

    public async Task<TechnicienDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await db.Techniciens
            .Where(t => t.Id == id)
            .Select(t => ToDto(t))
            .FirstOrDefaultAsync(ct);
    }

    public async Task<TechnicienDto> CreateAsync(CreateTechnicienDto dto, CancellationToken ct = default)
    {
        var technicien = new Technicien
        {
            Name = dto.Name,
            Email = dto.Email,
            Phone = dto.Phone,
            IsActive = dto.IsActive,
        };

        db.Techniciens.Add(technicien);
        await db.SaveChangesAsync(ct);

        return ToDto(technicien);
    }

    public async Task<TechnicienDto?> UpdateAsync(int id, UpdateTechnicienDto dto, CancellationToken ct = default)
    {
        var technicien = await db.Techniciens.FindAsync([id], ct);
        if (technicien is null) return null;

        technicien.Name = dto.Name;
        technicien.Email = dto.Email;
        technicien.Phone = dto.Phone;
        technicien.IsActive = dto.IsActive;
        technicien.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        return ToDto(technicien);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var technicien = await db.Techniciens.FindAsync([id], ct);
        if (technicien is null) return false;

        db.Techniciens.Remove(technicien);
        await db.SaveChangesAsync(ct);
        return true;
    }

    private static TechnicienDto ToDto(Technicien t) => new(t.Id, t.Name, t.Email, t.Phone, t.IsActive);
}
