using GestionParc.Domain.Enums;

namespace GestionParc.Application.DTOs;

public record InterventionMaterielDto(
    int Id,
    int ProduitId,
    string ProduitName,
    string? Description,
    decimal Quantite,
    decimal PrixUnitaire,
    decimal MontantTotal);

public record CreateInterventionMaterielDto(
    int ProduitId,
    string? Description,
    decimal Quantite,
    decimal? PrixUnitaire);

public record InterventionDto(
    int Id,
    string Name,
    int ClientId,
    string ClientName,
    int EquipementId,
    string EquipementName,
    DateTime DateIntervention,
    string? Description,
    int? TechnicienId,
    string? TechnicienName,
    StatutIntervention Statut,
    int? FactureInterventionId,
    string? ContactReferent,
    DateTime? DateDebutPanne,
    string? DescriptionResolution,
    string? IntervenantResolution,
    IReadOnlyList<InterventionMaterielDto> Materiels);

public record CreateInterventionDto(
    string Name,
    int ClientId,
    int EquipementId,
    DateTime? DateIntervention,
    string? Description,
    int? TechnicienId,
    StatutIntervention Statut,
    string? ContactReferent,
    DateTime? DateDebutPanne,
    string? DescriptionResolution,
    string? IntervenantResolution,
    IReadOnlyList<CreateInterventionMaterielDto>? Materiels);

public record UpdateInterventionDto(
    string Name,
    int ClientId,
    int EquipementId,
    DateTime DateIntervention,
    string? Description,
    int? TechnicienId,
    StatutIntervention Statut,
    string? ContactReferent,
    DateTime? DateDebutPanne,
    string? DescriptionResolution,
    string? IntervenantResolution);

public record FactureInterventionDto(
    int Id,
    int ClientId,
    DateOnly DateFacture,
    decimal MontantTotal,
    StatutFacture Statut,
    int InterventionId);
