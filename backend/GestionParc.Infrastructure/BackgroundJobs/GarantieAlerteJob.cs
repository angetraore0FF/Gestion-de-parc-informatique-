using GestionParc.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace GestionParc.Infrastructure.BackgroundJobs;

public class GarantieAlerteJob(IServiceScopeFactory scopeFactory, ILogger<GarantieAlerteJob> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromDays(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(Interval);

        do
        {
            await RunOnceAsync(stoppingToken);
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task RunOnceAsync(CancellationToken ct)
    {
        try
        {
            using var scope = scopeFactory.CreateScope();
            var equipementService = scope.ServiceProvider.GetRequiredService<IEquipementService>();

            var alertes = await equipementService.GetGarantieAlertesAsync(joursAvance: 7, ct);

            foreach (var alerte in alertes)
            {
                logger.LogWarning(
                    "Alerte fin de garantie : équipement {EquipementName} (client {ClientName}) arrive en fin de garantie le {GarantieFin}.",
                    alerte.Name, alerte.ClientName, alerte.GarantieFin);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Échec du job d'alerte de fin de garantie.");
        }
    }
}
