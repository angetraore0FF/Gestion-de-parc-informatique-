using GestionParc.Domain.Common;
using GestionParc.Domain.Enums;

namespace GestionParc.Domain.Entities;

public class Contrat : BaseEntity
{
    public string Name { get; set; } = "New";
    public int ClientId { get; set; }
    public DateOnly DateDebut { get; set; }
    public DateOnly DateFin { get; set; }
    public StatutContrat Statut { get; set; } = StatutContrat.Brouillon;
    public decimal Montant { get; set; }
    public RecurrenceContrat Recurrence { get; set; } = RecurrenceContrat.Mois;
    public DateOnly ProchaineFacture { get; set; }

    public Client Client { get; set; } = null!;
    public ICollection<ContratEquipement> Equipements { get; set; } = [];
    public ICollection<FactureRecurrente> Factures { get; set; } = [];
}
