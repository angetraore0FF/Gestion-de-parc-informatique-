using GestionParc.Application.Interfaces;
using GestionParc.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace GestionParc.Infrastructure.Services;

public class EquipementRapportService(GestionParcDbContext db, IConfiguration configuration) : IEquipementRapportService
{
    public async Task<byte[]?> GenerateHistoriquePannesAsync(int equipementId, CancellationToken ct = default)
    {
        var equipement = await db.Equipements
            .Include(e => e.Client)
            .FirstOrDefaultAsync(e => e.Id == equipementId, ct);

        if (equipement is null) return null;

        var interventions = await db.Interventions
            .Include(i => i.Technicien)
            .Where(i => i.EquipementId == equipementId)
            .OrderByDescending(i => i.DateIntervention)
            .ToListAsync(ct);

        var companyName = configuration["Company:Name"] ?? "Gestion Parc Informatique";

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Column(col =>
                {
                    col.Item().AlignCenter().Text("HISTORIQUE DES PANNES").FontSize(18).Bold().FontColor("#2c3e50");
                    col.Item().AlignCenter().PaddingTop(5).Text($"Équipement : {equipement.Name}").FontSize(12).Bold();
                    if (equipement.Client is not null)
                        col.Item().AlignCenter().Text($"Client : {equipement.Client.Name}").FontSize(10);
                });

                page.Content().PaddingVertical(15).Column(col =>
                {
                    col.Spacing(10);

                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Text($"Nombre total de pannes : {interventions.Count}").Bold();
                    });

                    if (interventions.Count == 0)
                    {
                        col.Item().Text("Aucune panne enregistrée pour cet équipement.");
                    }

                    foreach (var i in interventions)
                    {
                        col.Item().Border(0.5f).BorderColor("#dddddd").Padding(8).Column(c =>
                        {
                            c.Item().Text($"{i.DateIntervention:dd/MM/yyyy HH:mm} — {i.Name}").Bold();
                            if (i.DateDebutPanne is not null)
                                c.Item().Text($"Début de la panne : {i.DateDebutPanne:dd/MM/yyyy HH:mm}");
                            c.Item().Text($"Statut : {i.Statut}");
                            if (!string.IsNullOrWhiteSpace(i.ContactReferent))
                                c.Item().Text($"Contact référent : {i.ContactReferent}");
                            if (!string.IsNullOrWhiteSpace(i.Description))
                                c.Item().Text($"Problème constaté : {i.Description}");
                            if (!string.IsNullOrWhiteSpace(i.DescriptionResolution))
                                c.Item().Text($"Résolution : {i.DescriptionResolution}");
                            var intervenant = i.IntervenantResolution ?? i.Technicien?.Name;
                            if (!string.IsNullOrWhiteSpace(intervenant))
                                c.Item().Text($"Intervenant : {intervenant}");
                        });
                    }
                });

                page.Footer().AlignCenter().Text(
                    $"Document généré le {DateTime.UtcNow:dd/MM/yyyy} - {companyName}").FontSize(8).FontColor("#7f8c8d");
            });
        });

        return document.GeneratePdf();
    }
}
