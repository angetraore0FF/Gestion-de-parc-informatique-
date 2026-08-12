using GestionParc.Domain.Enums;

namespace GestionParc.Application.DTOs;

public record EquipementDto(
    int Id,
    string Name,
    string? SerialNumber,
    DateOnly? PurchaseDate,
    DateOnly? DateAcquisition,
    DateOnly? GarantieFin,
    EtatEquipement Etat,
    TypeEquipement TypeEquipement,
    string? Reference,
    int? ClientId,
    string? ClientName,
    int? ParcId,
    string? ParcName);

public record CreateEquipementDto(
    string Name,
    string? SerialNumber,
    DateOnly? PurchaseDate,
    DateOnly? DateAcquisition,
    DateOnly? GarantieFin,
    EtatEquipement Etat,
    TypeEquipement TypeEquipement,
    string? Reference,
    int? ClientId,
    int? ParcId);

public record UpdateEquipementDto(
    string Name,
    string? SerialNumber,
    DateOnly? PurchaseDate,
    DateOnly? DateAcquisition,
    DateOnly? GarantieFin,
    EtatEquipement Etat,
    TypeEquipement TypeEquipement,
    string? Reference,
    int? ClientId,
    int? ParcId);

public record GarantieAlerteDto(
    int Id,
    string Name,
    DateOnly GarantieFin,
    int? ClientId,
    string? ClientName);
