using GestionParc.Application.DTOs;
using GestionParc.Domain.Entities;
using GestionParc.Domain.Enums;
using GestionParc.Infrastructure.Services;
using Xunit;

namespace GestionParc.Tests;

public class ContratServiceTests
{
    [Fact]
    public async Task GenererFacturesRecurrentesAsync_GenereFacture_PourContratActifEcheance()
    {
        await using var db = TestDbContextFactory.Create();
        var client = new Client { Name = "Client A" };
        db.Clients.Add(client);
        await db.SaveChangesAsync();

        var contrat = new Contrat
        {
            Name = "CTR-000001",
            ClientId = client.Id,
            DateDebut = DateOnly.FromDateTime(DateTime.UtcNow),
            DateFin = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1)),
            Statut = StatutContrat.Actif,
            Montant = 100m,
            Recurrence = RecurrenceContrat.Mois,
            ProchaineFacture = DateOnly.FromDateTime(DateTime.UtcNow),
        };
        db.Contrats.Add(contrat);
        await db.SaveChangesAsync();

        var service = new ContratService(db);
        var count = await service.GenererFacturesRecurrentesAsync();

        Assert.Equal(1, count);
        var facture = Assert.Single(db.FacturesRecurrentes);
        Assert.Equal(contrat.Id, facture.ContratId);
        Assert.Equal(100m, facture.Montant);

        var updated = await db.Contrats.FindAsync(contrat.Id);
        Assert.Equal(DateOnly.FromDateTime(DateTime.UtcNow).AddDays(30), updated!.ProchaineFacture);
    }

    [Fact]
    public async Task GenererFacturesRecurrentesAsync_IgnoreContratBrouillon()
    {
        await using var db = TestDbContextFactory.Create();
        var client = new Client { Name = "Client A" };
        db.Clients.Add(client);
        await db.SaveChangesAsync();

        db.Contrats.Add(new Contrat
        {
            Name = "CTR-000002",
            ClientId = client.Id,
            DateDebut = DateOnly.FromDateTime(DateTime.UtcNow),
            DateFin = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1)),
            Statut = StatutContrat.Brouillon,
            Montant = 50m,
            Recurrence = RecurrenceContrat.Mois,
            ProchaineFacture = DateOnly.FromDateTime(DateTime.UtcNow),
        });
        await db.SaveChangesAsync();

        var service = new ContratService(db);
        var count = await service.GenererFacturesRecurrentesAsync();

        Assert.Equal(0, count);
        Assert.Empty(db.FacturesRecurrentes);
    }

    [Fact]
    public async Task CreateAsync_GenereReferenceApresInsertion()
    {
        await using var db = TestDbContextFactory.Create();
        var client = new Client { Name = "Client A" };
        db.Clients.Add(client);
        await db.SaveChangesAsync();

        var service = new ContratService(db);
        var dto = new CreateContratDto(
            client.Id,
            DateOnly.FromDateTime(DateTime.UtcNow),
            DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1)),
            StatutContrat.Brouillon,
            200m,
            RecurrenceContrat.Trimestre,
            null,
            null);

        var created = await service.CreateAsync(dto);

        Assert.StartsWith("CTR-", created.Name);
        Assert.Equal(client.Id, created.ClientId);
    }
}
