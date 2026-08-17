using GestionParc.Application.Interfaces;
using GestionParc.Infrastructure.BackgroundJobs;
using GestionParc.Infrastructure.Identity;
using GestionParc.Infrastructure.Persistence;
using GestionParc.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using QuestPDF.Infrastructure;

namespace GestionParc.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Server=(localdb)\\mssqllocaldb;Database=GestionParcDb;Trusted_Connection=True;TrustServerCertificate=True";

        services.AddDbContext<GestionParcDbContext>(options =>
            options.UseSqlServer(connectionString));

        services.AddIdentityCore<ApplicationUser>(options =>
            {
                options.Password.RequiredLength = 8;
                options.Password.RequireNonAlphanumeric = false;
                options.User.RequireUniqueEmail = true;
            })
            .AddRoles<IdentityRole<int>>()
            .AddEntityFrameworkStores<GestionParcDbContext>();

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IClientService, ClientService>();
        services.AddScoped<IParcService, ParcService>();
        services.AddScoped<IEquipementService, EquipementService>();
        services.AddScoped<IContratService, ContratService>();
        services.AddScoped<IFactureRecurrenteService, FactureRecurrenteService>();
        services.AddScoped<IInterventionService, InterventionService>();
        services.AddScoped<ITechnicienService, TechnicienService>();
        services.AddScoped<IProduitService, ProduitService>();
        services.AddScoped<IContratPdfService, ContratPdfService>();
        services.AddScoped<IEquipementRapportService, EquipementRapportService>();

        services.AddHostedService<GarantieAlerteJob>();
        services.AddHostedService<FacturationRecurrenteJob>();

        return services;
    }
}
