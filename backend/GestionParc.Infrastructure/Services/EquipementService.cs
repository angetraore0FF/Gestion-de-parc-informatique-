using GestionParc.Application.DTOs;
using GestionParc.Application.Interfaces;
using GestionParc.Domain.Entities;
using GestionParc.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GestionParc.Infrastructure.Services;

public class EquipementService(GestionParcDbContext db) : IEquipementService
{
    public async Task<IReadOnlyList<EquipementDto>> GetAllAsync(int? clientId = null, int? parcId = null, CancellationToken ct = default)
    {
        var query = db.Equipements.AsQueryable();

        if (clientId is not null)
            query = query.Where(e => e.ClientId == clientId);
        if (parcId is not null)
            query = query.Where(e => e.ParcId == parcId);

        return await query.Select(Projection).ToListAsync(ct);
    }

    public async Task<EquipementDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await db.Equipements
            .Where(e => e.Id == id)
            .Select(Projection)
            .FirstOrDefaultAsync(ct);
    }

    // Doit être un Expression<Func<>> passé TEL QUEL à .Select() (pas via un lambda
    // qui l'invoque) : sinon EF Core l'exécute côté client sur une entité pas
    // chargée avec Include et .Count / navigations optionnelles restent vides/null.
    private static readonly System.Linq.Expressions.Expression<Func<Equipement, EquipementDto>> Projection = e => new EquipementDto(
        e.Id,
        e.Name,
        e.SerialNumber,
        e.PurchaseDate,
        e.DateAcquisition,
        e.GarantieFin,
        e.Etat,
        e.TypeEquipement,
        e.Reference,
        e.AdresseMac,
        e.AdresseIp,
        e.SystemeExploitation,
        e.Emplacement,
        e.ClientId,
        e.Client != null ? e.Client.Name : null,
        e.ParcId,
        e.Parc != null ? e.Parc.Name : null,
        e.Interventions.Count);

    public async Task<EquipementDto> CreateAsync(CreateEquipementDto dto, CancellationToken ct = default)
    {
        await EnsureUniqueDansParc(dto.ParcId, dto.Name, null, ct);

        var equipement = new Equipement
        {
            Name = dto.Name,
            SerialNumber = dto.SerialNumber,
            PurchaseDate = dto.PurchaseDate,
            DateAcquisition = dto.DateAcquisition,
            GarantieFin = dto.GarantieFin,
            Etat = dto.Etat,
            TypeEquipement = dto.TypeEquipement,
            Reference = dto.Reference,
            AdresseMac = dto.AdresseMac,
            AdresseIp = dto.AdresseIp,
            SystemeExploitation = dto.SystemeExploitation,
            Emplacement = dto.Emplacement,
            ClientId = dto.ClientId,
            ParcId = dto.ParcId,
        };

        db.Equipements.Add(equipement);
        await db.SaveChangesAsync(ct);

        return await GetByIdAsync(equipement.Id, ct) ?? throw new InvalidOperationException("Équipement introuvable après création.");
    }

    public async Task<EquipementDto?> UpdateAsync(int id, UpdateEquipementDto dto, CancellationToken ct = default)
    {
        var equipement = await db.Equipements.FirstOrDefaultAsync(e => e.Id == id, ct);
        if (equipement is null) return null;

        await EnsureUniqueDansParc(dto.ParcId, dto.Name, id, ct);

        equipement.Name = dto.Name;
        equipement.SerialNumber = dto.SerialNumber;
        equipement.PurchaseDate = dto.PurchaseDate;
        equipement.DateAcquisition = dto.DateAcquisition;
        equipement.GarantieFin = dto.GarantieFin;
        equipement.Etat = dto.Etat;
        equipement.TypeEquipement = dto.TypeEquipement;
        equipement.Reference = dto.Reference;
        equipement.AdresseMac = dto.AdresseMac;
        equipement.AdresseIp = dto.AdresseIp;
        equipement.SystemeExploitation = dto.SystemeExploitation;
        equipement.Emplacement = dto.Emplacement;
        equipement.ClientId = dto.ClientId;
        equipement.ParcId = dto.ParcId;
        equipement.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        return await GetByIdAsync(id, ct);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var equipement = await db.Equipements.FindAsync([id], ct);
        if (equipement is null) return false;

        db.Equipements.Remove(equipement);
        await db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<IReadOnlyList<GarantieAlerteDto>> GetGarantieAlertesAsync(int joursAvance = 7, CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var soon = today.AddDays(joursAvance);

        return await db.Equipements
            .Include(e => e.Client)
            .Where(e => e.GarantieFin != null && e.GarantieFin >= today && e.GarantieFin <= soon)
            .Select(e => new GarantieAlerteDto(e.Id, e.Name, e.GarantieFin!.Value, e.ClientId, e.Client != null ? e.Client.Name : null))
            .ToListAsync(ct);
    }

    private async Task EnsureUniqueDansParc(int? parcId, string name, int? excludeId, CancellationToken ct)
    {
        if (parcId is null) return;

        var existe = await db.Equipements.AnyAsync(e =>
            e.ParcId == parcId && e.Name == name && (excludeId == null || e.Id != excludeId), ct);

        if (existe)
            throw new InvalidOperationException($"Cet équipement est déjà attribué au parc {parcId}.");
    }
}
