using GestionParc.Domain.Enums;

namespace GestionParc.Application.DTOs;

public record ContratDto(
    int Id,
    string Name,
    int ClientId,
    string ClientName,
    DateOnly DateDebut,
    DateOnly DateFin,
    StatutContrat Statut,
    decimal Montant,
    RecurrenceContrat Recurrence,
    DateOnly ProchaineFacture,
    IReadOnlyList<int> EquipementIds);

public record CreateContratDto(
    int ClientId,
    DateOnly DateDebut,
    DateOnly DateFin,
    StatutContrat Statut,
    decimal Montant,
    RecurrenceContrat Recurrence,
    DateOnly? ProchaineFacture,
    IReadOnlyList<int>? EquipementIds);

public record UpdateContratDto(
    int ClientId,
    DateOnly DateDebut,
    DateOnly DateFin,
    StatutContrat Statut,
    decimal Montant,
    RecurrenceContrat Recurrence,
    DateOnly ProchaineFacture,
    IReadOnlyList<int>? EquipementIds);
