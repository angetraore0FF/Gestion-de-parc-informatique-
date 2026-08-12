using GestionParc.Domain.Common;

namespace GestionParc.Domain.Entities;

public class InterventionMateriel : BaseEntity
{
    public int InterventionId { get; set; }
    public int ProduitId { get; set; }
    public string? Description { get; set; }
    public decimal Quantite { get; set; } = 1m;
    public decimal PrixUnitaire { get; set; }
    public decimal MontantTotal { get; set; }

    public Intervention Intervention { get; set; } = null!;
    public Produit Produit { get; set; } = null!;
}
