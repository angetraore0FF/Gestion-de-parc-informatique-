using GestionParc.Application.Interfaces;
using GestionParc.Infrastructure.Persistence;
using GestionParc.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace GestionParc.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Server=(localdb)\\mssqllocaldb;Database=GestionParcDb;Trusted_Connection=True;TrustServerCertificate=True";

        services.AddDbContext<GestionParcDbContext>(options =>
            options.UseSqlServer(connectionString));

        services.AddScoped<IClientService, ClientService>();
        services.AddScoped<IParcService, ParcService>();
        services.AddScoped<IEquipementService, EquipementService>();
        services.AddScoped<IContratService, ContratService>();
        services.AddScoped<IFactureRecurrenteService, FactureRecurrenteService>();
        services.AddScoped<IInterventionService, InterventionService>();
        services.AddScoped<ITechnicienService, TechnicienService>();
        services.AddScoped<IProduitService, ProduitService>();

        return services;
    }
}
