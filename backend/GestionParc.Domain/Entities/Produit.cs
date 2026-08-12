using GestionParc.Domain.Common;

namespace GestionParc.Domain.Entities;

public class Produit : BaseEntity
{
    public string Name { get; set; } = null!;
    public string? Reference { get; set; }
    public decimal PrixUnitaire { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<InterventionMateriel> LignesMateriel { get; set; } = [];
}
