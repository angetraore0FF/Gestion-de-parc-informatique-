using GestionParc.Application.Interfaces;
using GestionParc.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace GestionParc.Infrastructure.Services;

public class ContratPdfService(GestionParcDbContext db, IConfiguration configuration) : IContratPdfService
{
    private static readonly string[] ConditionsGenerales =
    [
        "Le présent contrat prend effet à la date de signature.",
        "Toute intervention non couverte par ce contrat fera l'objet d'un devis séparé.",
        "Le client s'engage à fournir un accès complet aux équipements couverts.",
        "Les interventions seront effectuées dans un délai maximum de 48h ouvrées.",
        "Toute résiliation doit être notifiée par écrit 30 jours à l'avance.",
    ];

    public async Task<byte[]?> GenerateAsync(int contratId, CancellationToken ct = default)
    {
        var contrat = await db.Contrats
            .Include(c => c.Client)
            .Include(c => c.Equipements)
            .ThenInclude(ce => ce.Equipement)
            .FirstOrDefaultAsync(c => c.Id == contratId, ct);

        if (contrat is null) return null;

        var companyName = configuration["Company:Name"] ?? "Gestion Parc Informatique";
        var equipements = contrat.Equipements.Select(ce => ce.Equipement).ToList();

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Column(col =>
                {
                    col.Item().AlignCenter().Text("CONTRAT DE SERVICE MAINTENANCE").FontSize(18).Bold().FontColor("#2c3e50");
                    col.Item().AlignCenter().PaddingTop(5).Text($"Référence: {contrat.Name}").FontSize(12).Bold();
                });

                page.Content().PaddingVertical(15).Column(col =>
                {
                    col.Spacing(15);

                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("INFORMATIONS CLIENT").Bold();
                            c.Item().Text($"Nom : {contrat.Client.Name}");
                            c.Item().Text($"Adresse : {contrat.Client.Address}");
                            c.Item().Text($"Tél : {contrat.Client.Phone}");
                            c.Item().Text($"Email : {contrat.Client.Email}");
                        });

                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("DÉTAILS DU CONTRAT").Bold();
                            c.Item().Text($"Période : Du {contrat.DateDebut:dd/MM/yyyy} au {contrat.DateFin:dd/MM/yyyy}");
                            c.Item().Text($"Statut : {contrat.Statut}");
                            c.Item().Text($"Montant : {contrat.Montant:0.00} €");
                            c.Item().Text($"Fréquence : {contrat.Recurrence}");
                            c.Item().Text($"Prochaine facture : {contrat.ProchaineFacture:dd/MM/yyyy}");
                        });
                    });

                    col.Item().Column(c =>
                    {
                        c.Item().Text("ÉQUIPEMENTS COUVERTS").Bold();
                        c.Item().PaddingTop(5).Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(1);
                                columns.RelativeColumn(1);
                                columns.RelativeColumn(1);
                            });

                            table.Header(header =>
                            {
                                header.Cell().Element(HeaderCell).Text("Nom");
                                header.Cell().Element(HeaderCell).Text("Type");
                                header.Cell().Element(HeaderCell).Text("Date Acquisition");
                                header.Cell().Element(HeaderCell).Text("Garantie");

                                static IContainer HeaderCell(IContainer cellContainer)
                                    => cellContainer.DefaultTextStyle(x => x.Bold()).Padding(4).Background("#eeeeee");
                            });

                            foreach (var eq in equipements)
                            {
                                table.Cell().Element(BodyCell).Text(eq.Name);
                                table.Cell().Element(BodyCell).Text(eq.TypeEquipement.ToString());
                                table.Cell().Element(BodyCell).Text(eq.DateAcquisition?.ToString("dd/MM/yyyy") ?? "-");
                                table.Cell().Element(BodyCell).Text(eq.GarantieFin?.ToString("dd/MM/yyyy") ?? "-");

                                static IContainer BodyCell(IContainer cellContainer)
                                    => cellContainer.Padding(4).BorderBottom(0.5f).BorderColor("#dddddd");
                            }
                        });
                    });

                    col.Item().Column(c =>
                    {
                        c.Item().Text("CONDITIONS GÉNÉRALES").Bold();
                        foreach (var (condition, index) in ConditionsGenerales.Select((text, i) => (text, i + 1)))
                            c.Item().Text($"{index}. {condition}");
                    });

                    col.Item().PaddingTop(30).Row(row =>
                    {
                        row.RelativeItem().AlignCenter().Column(c =>
                        {
                            c.Item().Text("Pour le client");
                            c.Item().PaddingTop(30).Text("_________________________");
                        });
                        row.RelativeItem().AlignCenter().Column(c =>
                        {
                            c.Item().Text($"Pour {companyName}");
                            c.Item().PaddingTop(30).Text("_________________________");
                        });
                    });
                });

                page.Footer().AlignCenter().Text(
                    $"Document généré le {DateTime.UtcNow:dd/MM/yyyy} - {companyName}").FontSize(8).FontColor("#7f8c8d");
            });
        });

        return document.GeneratePdf();
    }
}
