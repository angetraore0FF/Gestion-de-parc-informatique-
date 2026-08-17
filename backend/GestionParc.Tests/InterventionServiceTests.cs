using GestionParc.Domain.Entities;
using GestionParc.Domain.Enums;
using GestionParc.Infrastructure.Services;
using Xunit;

namespace GestionParc.Tests;

public class InterventionServiceTests
{
    private static async Task<(Client client, Equipement equipement, Produit produit)> SeedBaseAsync(
        Infrastructure.Persistence.GestionParcDbContext db)
    {
        var client = new Client { Name = "Client A" };
        db.Clients.Add(client);
        await db.SaveChangesAsync();

        var equipement = new Equipement
        {
            Name = "PC-01", ClientId = client.Id, TypeEquipement = TypeEquipement.Ordinateur,
        };
        db.Equipements.Add(equipement);

        var produit = new Produit { Name = "Câble RJ45", PrixUnitaire = 10m };
        db.Produits.Add(produit);
        await db.SaveChangesAsync();

        return (client, equipement, produit);
    }

    [Fact]
    public async Task GenererFactureAsync_CalculeMontantTotal()
    {
        await using var db = TestDbContextFactory.Create();
        var (client, equipement, produit) = await SeedBaseAsync(db);

        var intervention = new Intervention
        {
            Name = "Panne", ClientId = client.Id, EquipementId = equipement.Id, Statut = StatutIntervention.Nouveau,
        };
        intervention.Materiels.Add(new InterventionMateriel
        {
            ProduitId = produit.Id, Quantite = 3, PrixUnitaire = 10m, MontantTotal = 30m,
        });
        db.Interventions.Add(intervention);
        await db.SaveChangesAsync();

        var service = new InterventionService(db);
        var facture = await service.GenererFactureAsync(intervention.Id);

        Assert.Equal(30m, facture.MontantTotal);
        Assert.Equal(client.Id, facture.ClientId);

        var updated = await db.Interventions.FindAsync(intervention.Id);
        Assert.Equal(facture.Id, updated!.FactureInterventionId);
    }

    [Fact]
    public async Task GenererFactureAsync_RejetteSiDejaFacturee()
    {
        await using var db = TestDbContextFactory.Create();
        var (client, equipement, produit) = await SeedBaseAsync(db);

        var intervention = new Intervention
        {
            Name = "Panne", ClientId = client.Id, EquipementId = equipement.Id, Statut = StatutIntervention.Nouveau,
        };
        intervention.Materiels.Add(new InterventionMateriel { ProduitId = produit.Id, Quantite = 1, PrixUnitaire = 10m, MontantTotal = 10m });
        db.Interventions.Add(intervention);
        await db.SaveChangesAsync();

        var service = new InterventionService(db);
        await service.GenererFactureAsync(intervention.Id);

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.GenererFactureAsync(intervention.Id));
    }

    [Fact]
    public async Task GenererFactureAsync_RejetteSiAucunMateriel()
    {
        await using var db = TestDbContextFactory.Create();
        var (client, equipement, _) = await SeedBaseAsync(db);

        var intervention = new Intervention
        {
            Name = "Panne", ClientId = client.Id, EquipementId = equipement.Id, Statut = StatutIntervention.Nouveau,
        };
        db.Interventions.Add(intervention);
        await db.SaveChangesAsync();

        var service = new InterventionService(db);
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.GenererFactureAsync(intervention.Id));
    }

    [Fact]
    public async Task GenererFactureAsync_LanceKeyNotFound_SiInterventionInexistante()
    {
        await using var db = TestDbContextFactory.Create();
        var service = new InterventionService(db);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => service.GenererFactureAsync(999));
    }
}
