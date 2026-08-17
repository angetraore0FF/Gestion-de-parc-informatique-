namespace GestionParc.Application.DTOs;

public record RegisterDto(
    string Email,
    string Password,
    string Role,
    int? ClientId,
    int? TechnicienId);

public record LoginDto(string Email, string Password);

public record AuthResponseDto(
    string Token,
    DateTime ExpiresAtUtc,
    string Email,
    IReadOnlyList<string> Roles,
    int? ClientId,
    int? TechnicienId);
