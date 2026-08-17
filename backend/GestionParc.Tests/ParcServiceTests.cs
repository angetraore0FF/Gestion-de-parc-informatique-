using GestionParc.Domain.Entities;
using GestionParc.Domain.Enums;
using GestionParc.Infrastructure.Services;
using Xunit;

namespace GestionParc.Tests;

public class ParcServiceTests
{
    // Régression : même bug de traduction EF que ClientServiceTests, sur EquipementCount.
    [Fact]
    public async Task GetAllAsync_CompteEquipementsCorrectement()
    {
        await using var db = TestDbContextFactory.Create();
        var client = new Client { Name = "Client A" };
        db.Clients.Add(client);
        await db.SaveChangesAsync();

        var parc = new Parc { Name = "Parc 1", ClientId = client.Id };
        db.Parcs.Add(parc);
        await db.SaveChangesAsync();

        db.Equipements.Add(new Equipement { Name = "Eq 1", ClientId = client.Id, ParcId = parc.Id, TypeEquipement = TypeEquipement.Ordinateur });
        db.Equipements.Add(new Equipement { Name = "Eq 2", ClientId = client.Id, ParcId = parc.Id, TypeEquipement = TypeEquipement.Imprimante });
        await db.SaveChangesAsync();

        var service = new ParcService(db);
        var result = await service.GetAllAsync();

        var dto = Assert.Single(result);
        Assert.Equal(2, dto.EquipementCount);
        Assert.Equal("Client A", dto.ClientName);
    }

    [Fact]
    public async Task GetAllAsync_FiltreParClientId()
    {
        await using var db = TestDbContextFactory.Create();
        var clientA = new Client { Name = "Client A" };
        var clientB = new Client { Name = "Client B" };
        db.Clients.AddRange(clientA, clientB);
        await db.SaveChangesAsync();

        db.Parcs.Add(new Parc { Name = "Parc A", ClientId = clientA.Id });
        db.Parcs.Add(new Parc { Name = "Parc B", ClientId = clientB.Id });
        await db.SaveChangesAsync();

        var service = new ParcService(db);
        var result = await service.GetAllAsync(clientA.Id);

        var dto = Assert.Single(result);
        Assert.Equal("Parc A", dto.Name);
    }
}
