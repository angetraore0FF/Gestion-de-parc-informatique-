namespace GestionParc.Domain.Entities;

public class ContratEquipement
{
    public int ContratId { get; set; }
    public int EquipementId { get; set; }

    public Contrat Contrat { get; set; } = null!;
    public Equipement Equipement { get; set; } = null!;
}
