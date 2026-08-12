using GestionParc.Domain.Common;

namespace GestionParc.Domain.Entities;

public class FactureInterventionLigne : BaseEntity
{
    public int FactureInterventionId { get; set; }
    public int ProduitId { get; set; }
    public string Description { get; set; } = null!;
    public decimal Quantite { get; set; }
    public decimal PrixUnitaire { get; set; }
    public decimal MontantTotal { get; set; }

    public FactureIntervention Facture { get; set; } = null!;
    public Produit Produit { get; set; } = null!;
}
