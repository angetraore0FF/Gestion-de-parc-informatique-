namespace GestionParc.Application.Interfaces;

public interface IContratPdfService
{
    Task<byte[]?> GenerateAsync(int contratId, CancellationToken ct = default);
}
