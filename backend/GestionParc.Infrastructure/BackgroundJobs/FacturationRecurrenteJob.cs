using GestionParc.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace GestionParc.Infrastructure.BackgroundJobs;

public class FacturationRecurrenteJob(IServiceScopeFactory scopeFactory, ILogger<FacturationRecurrenteJob> logger) : BackgroundService
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
            var contratService = scope.ServiceProvider.GetRequiredService<IContratService>();

            var count = await contratService.GenererFacturesRecurrentesAsync(ct);

            if (count > 0)
                logger.LogInformation("Facturation récurrente : {Count} facture(s) générée(s).", count);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Échec du job de facturation récurrente.");
        }
    }
}
