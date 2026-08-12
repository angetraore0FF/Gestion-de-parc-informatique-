namespace GestionParc.Application.DTOs;

public record TechnicienDto(
    int Id,
    string Name,
    string? Email,
    string? Phone,
    bool IsActive);

public record CreateTechnicienDto(
    string Name,
    string? Email,
    string? Phone,
    bool IsActive = true);

public record UpdateTechnicienDto(
    string Name,
    string? Email,
    string? Phone,
    bool IsActive);
