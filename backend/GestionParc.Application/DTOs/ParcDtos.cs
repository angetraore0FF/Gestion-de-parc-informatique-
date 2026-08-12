namespace GestionParc.Application.DTOs;

public record ParcDto(
    int Id,
    string Name,
    string? Description,
    int ClientId,
    string ClientName,
    int EquipementCount);

public record CreateParcDto(
    string Name,
    string? Description,
    int ClientId);

public record UpdateParcDto(
    string Name,
    string? Description,
    int ClientId);
