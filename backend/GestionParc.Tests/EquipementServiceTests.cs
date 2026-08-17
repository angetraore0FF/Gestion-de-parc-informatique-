using GestionParc.Application.DTOs;
using GestionParc.Domain.Entities;
using GestionParc.Domain.Enums;
using GestionParc.Infrastructure.Services;
using Xunit;

namespace GestionParc.Tests;

public class EquipementServiceTests
{
    [Fact]
    public async Task CreateAsync_RejetteNomDuplique_DansMemeParc()
    {
        await using var db = TestDbContextFactory.Create();
        var client = new Client { Name = "Client A" };
        db.Clients.Add(client);
        await db.SaveChangesAsync();

        var parc = new Parc { Name = "Parc principal", ClientId = client.Id };
        db.Parcs.Add(parc);
        await db.SaveChangesAsync();

        var service = new EquipementService(db);
        var dto = new CreateEquipementDto(
            "PC-01", null, null, null, null, EtatEquipement.EnService, TypeEquipement.Ordinateur, null,
            null, null, null, null, client.Id, parc.Id);

        await service.CreateAsync(dto);

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.CreateAsync(dto));
    }

    [Fact]
    public async Task GetGarantieAlertesAsync_RetourneEquipementsProchesExpiration()
    {
        await using var db = TestDbContextFactory.Create();
        var client = new Client { Name = "Client A" };
        db.Clients.Add(client);
        await db.SaveChangesAsync();

        db.Equipements.AddRange(
            new Equipement
            {
                Name = "Bientôt expiré", ClientId = client.Id, TypeEquipement = TypeEquipement.Ordinateur,
                GarantieFin = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(3)),
            },
            new Equipement
            {
                Name = "Loin", ClientId = client.Id, TypeEquipement = TypeEquipement.Ordinateur,
                GarantieFin = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(60)),
            },
            new Equipement
            {
                Name = "Déjà expiré", ClientId = client.Id, TypeEquipement = TypeEquipement.Ordinateur,
                GarantieFin = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)),
            });
        await db.SaveChangesAsync();

        var service = new EquipementService(db);
        var alertes = await service.GetGarantieAlertesAsync(joursAvance: 7);

        var alerte = Assert.Single(alertes);
        Assert.Equal("Bientôt expiré", alerte.Name);
    }
}
