using GestionParc.Domain.Common;

namespace GestionParc.Domain.Entities;

public class Parc : BaseEntity
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int ClientId { get; set; }

    public Client Client { get; set; } = null!;
    public ICollection<Equipement> Equipements { get; set; } = [];
}
