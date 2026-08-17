using GestionParc.Application.DTOs;
using GestionParc.Application.Interfaces;
using GestionParc.Domain.Entities;
using GestionParc.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GestionParc.Infrastructure.Services;

public class ProduitService(GestionParcDbContext db) : IProduitService
{
    public async Task<IReadOnlyList<ProduitDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await db.Produits.Select(p => ToDto(p)).ToListAsync(ct);
    }

    public async Task<ProduitDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await db.Produits
            .Where(p => p.Id == id)
            .Select(p => ToDto(p))
            .FirstOrDefaultAsync(ct);
    }

    public async Task<ProduitDto> CreateAsync(CreateProduitDto dto, CancellationToken ct = default)
    {
        var produit = new Produit
        {
            Name = dto.Name,
            Reference = dto.Reference,
            PrixUnitaire = dto.PrixUnitaire,
            IsActive = dto.IsActive,
        };

        db.Produits.Add(produit);
        await db.SaveChangesAsync(ct);

        return ToDto(produit);
    }

    public async Task<ProduitDto?> UpdateAsync(int id, UpdateProduitDto dto, CancellationToken ct = default)
    {
        var produit = await db.Produits.FindAsync([id], ct);
        if (produit is null) return null;

        produit.Name = dto.Name;
        produit.Reference = dto.Reference;
        produit.PrixUnitaire = dto.PrixUnitaire;
        produit.IsActive = dto.IsActive;
        produit.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        return ToDto(produit);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var produit = await db.Produits.FindAsync([id], ct);
        if (produit is null) return false;

        db.Produits.Remove(produit);
        await db.SaveChangesAsync(ct);
        return true;
    }

    private static ProduitDto ToDto(Produit p) => new(p.Id, p.Name, p.Reference, p.PrixUnitaire, p.IsActive);
}
