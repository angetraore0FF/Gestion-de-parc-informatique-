using GestionParc.Domain.Common;

namespace GestionParc.Domain.Entities;

public class Technicien : BaseEntity
{
    public string Name { get; set; } = null!;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Intervention> Interventions { get; set; } = [];
}
