using GestionParc.Domain.Common;
using GestionParc.Domain.Enums;

namespace GestionParc.Domain.Entities;

public class FactureIntervention : BaseEntity
{
    public int ClientId { get; set; }
    public DateOnly DateFacture { get; set; }
    public decimal MontantTotal { get; set; }
    public StatutFacture Statut { get; set; } = StatutFacture.Brouillon;

    public Client Client { get; set; } = null!;
    public Intervention? Intervention { get; set; }
    public ICollection<FactureInterventionLigne> Lignes { get; set; } = [];
}
