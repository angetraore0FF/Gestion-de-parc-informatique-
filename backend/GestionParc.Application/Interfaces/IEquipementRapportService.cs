namespace GestionParc.Application.Interfaces;

public interface IEquipementRapportService
{
    Task<byte[]?> GenerateHistoriquePannesAsync(int equipementId, CancellationToken ct = default);
}
