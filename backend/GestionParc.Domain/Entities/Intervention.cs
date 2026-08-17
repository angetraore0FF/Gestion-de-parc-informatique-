using GestionParc.Domain.Common;
using GestionParc.Domain.Enums;

namespace GestionParc.Domain.Entities;

public class Intervention : BaseEntity
{
    public string Name { get; set; } = null!;
    public int ClientId { get; set; }
    public int EquipementId { get; set; }
    public DateTime DateIntervention { get; set; } = DateTime.UtcNow;
    public string? Description { get; set; }
    public int? TechnicienId { get; set; }
    public StatutIntervention Statut { get; set; } = StatutIntervention.Nouveau;
    public int? FactureInterventionId { get; set; }
    public string? ContactReferent { get; set; }
    public DateTime? DateDebutPanne { get; set; }
    public string? DescriptionResolution { get; set; }
    public string? IntervenantResolution { get; set; }

    public Client Client { get; set; } = null!;
    public Equipement Equipement { get; set; } = null!;
    public Technicien? Technicien { get; set; }
    public FactureIntervention? FactureIntervention { get; set; }
    public ICollection<InterventionMateriel> Materiels { get; set; } = [];
}
