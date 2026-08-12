namespace GestionParc.Application.DTOs;

public record ProduitDto(
    int Id,
    string Name,
    string? Reference,
    decimal PrixUnitaire,
    bool IsActive);

public record CreateProduitDto(
    string Name,
    string? Reference,
    decimal PrixUnitaire,
    bool IsActive = true);

public record UpdateProduitDto(
    string Name,
    string? Reference,
    decimal PrixUnitaire,
    bool IsActive);
