using GestionParc.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GestionParc.Tests;

public static class TestDbContextFactory
{
    public static GestionParcDbContext Create()
    {
        var options = new DbContextOptionsBuilder<GestionParcDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new GestionParcDbContext(options);
    }
}
