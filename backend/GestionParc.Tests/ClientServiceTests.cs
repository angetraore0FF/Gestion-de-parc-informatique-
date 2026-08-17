using GestionParc.Domain.Entities;
using GestionParc.Domain.Enums;
using GestionParc.Infrastructure.Services;
using Xunit;

namespace GestionParc.Tests;

public class ClientServiceTests
{
    // Régression : EF Core ne traduisait pas .Count sur une collection navigation
    // quand la projection passait par une méthode helper (ToDto) — restait à 0
    // malgré des enfants réellement présents. Voir ClientService.GetAllAsync/GetByIdAsync.
    [Fact]
    public async Task GetAllAsync_CompteCorrectement_ParcsEquipementsContrats()
    {
        await using var db = TestDbContextFactory.Create();
        var client = new Client { Name = "Client A" };
        db.Clients.Add(client);
        await db.SaveChangesAsync();

        db.Parcs.Add(new Parc { Name = "Parc 1", ClientId = client.Id });
        db.Equipements.Add(new Equipement { Name = "Eq 1", ClientId = client.Id, TypeEquipement = TypeEquipement.Ordinateur });
        db.Contrats.Add(new Contrat
        {
            Name = "CTR-1", ClientId = client.Id,
            DateDebut = DateOnly.FromDateTime(DateTime.UtcNow),
            DateFin = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1)),
            ProchaineFacture = DateOnly.FromDateTime(DateTime.UtcNow),
        });
        await db.SaveChangesAsync();

        var service = new ClientService(db);
        var result = await service.GetAllAsync();

        var dto = Assert.Single(result);
        Assert.Equal(1, dto.ParcCount);
        Assert.Equal(1, dto.EquipementCount);
        Assert.Equal(1, dto.ContratCount);
    }

    [Fact]
    public async Task GetByIdAsync_RetourneNull_SiInexistant()
    {
        await using var db = TestDbContextFactory.Create();
        var service = new ClientService(db);

        Assert.Null(await service.GetByIdAsync(999));
    }
}
