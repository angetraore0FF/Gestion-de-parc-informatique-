namespace GestionParc.Application.DTOs;

public record ClientDto(
    int Id,
    string Name,
    string? Email,
    string? Phone,
    string? Address,
    bool IsParcClient,
    int ParcCount,
    int EquipementCount,
    int ContratCount);

public record CreateClientDto(
    string Name,
    string? Email,
    string? Phone,
    string? Address,
    bool IsParcClient = true);

public record UpdateClientDto(
    string Name,
    string? Email,
    string? Phone,
    string? Address,
    bool IsParcClient);
