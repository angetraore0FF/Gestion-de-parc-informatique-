using GestionParc.Domain.Common;
using GestionParc.Domain.Enums;

namespace GestionParc.Domain.Entities;

public class FactureRecurrente : BaseEntity
{
    public int ContratId { get; set; }
    public int ClientId { get; set; }
    public DateOnly DateFacture { get; set; }
    public decimal Montant { get; set; }
    public StatutFacture Statut { get; set; } = StatutFacture.Brouillon;

    public Contrat Contrat { get; set; } = null!;
    public Client Client { get; set; } = null!;
}
