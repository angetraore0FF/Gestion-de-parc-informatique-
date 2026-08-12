using GestionParc.Domain.Enums;

namespace GestionParc.Application.DTOs;

public record FactureRecurrenteDto(
    int Id,
    int ContratId,
    string ContratName,
    int ClientId,
    string ClientName,
    DateOnly DateFacture,
    decimal Montant,
    StatutFacture Statut);

public record UpdateFactureRecurrenteDto(StatutFacture Statut);
