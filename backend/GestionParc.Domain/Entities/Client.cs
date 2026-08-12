using GestionParc.Domain.Common;

namespace GestionParc.Domain.Entities;

public class Client : BaseEntity
{
    public string Name { get; set; } = null!;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public bool IsParcClient { get; set; }

    public ICollection<Parc> Parcs { get; set; } = [];
    public ICollection<Equipement> Equipements { get; set; } = [];
    public ICollection<Contrat> Contrats { get; set; } = [];
    public ICollection<Intervention> Interventions { get; set; } = [];
    public ICollection<FactureRecurrente> FacturesRecurrentes { get; set; } = [];
    public ICollection<FactureIntervention> FacturesIntervention { get; set; } = [];
}
