using GestionParc.Domain.Common;
using GestionParc.Domain.Enums;

namespace GestionParc.Domain.Entities;

public class Equipement : BaseEntity
{
    public string Name { get; set; } = null!;
    public string? SerialNumber { get; set; }
    public DateOnly? PurchaseDate { get; set; }
    public DateOnly? DateAcquisition { get; set; }
    public DateOnly? GarantieFin { get; set; }
    public EtatEquipement Etat { get; set; } = EtatEquipement.EnService;
    public TypeEquipement TypeEquipement { get; set; }
    public string? Reference { get; set; }
    public byte[]? Image { get; set; }
    public string? AdresseMac { get; set; }
    public string? AdresseIp { get; set; }
    public string? SystemeExploitation { get; set; }
    public string? Emplacement { get; set; }
    public int? ClientId { get; set; }
    public int? ParcId { get; set; }

    public Client? Client { get; set; }
    public Parc? Parc { get; set; }
    public ICollection<Intervention> Interventions { get; set; } = [];
    public ICollection<ContratEquipement> Contrats { get; set; } = [];
}
