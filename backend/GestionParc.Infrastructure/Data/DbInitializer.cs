using GestionParc.Domain.Entities;
using GestionParc.Domain.Enums;
using GestionParc.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace GestionParc.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        await using var scope = serviceProvider.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<GestionParcDbContext>();

        await context.Database.MigrateAsync();

        if (await context.Clients.AnyAsync())
            return;

        var client = new Client
        {
            Name = "Demo IT Corp",
            Email = "contact@demo-it.fr",
            Phone = "01 23 45 67 89",
            Address = "10 rue de la Tech, Paris",
            IsParcClient = true
        };

        var technicien = new Technicien
        {
            Name = "Jean Dupont",
            Email = "j.dupont@demo-it.fr",
            Phone = "06 12 34 56 78"
        };

        var produit = new Produit
        {
            Name = "Câble réseau RJ45",
            Reference = "CAB-RJ45-2M",
            PrixUnitaire = 12.50m
        };

        context.Clients.Add(client);
        context.Techniciens.Add(technicien);
        context.Produits.Add(produit);
        await context.SaveChangesAsync();

        var parc = new Parc
        {
            Name = "Parc principal",
            Description = "Parc informatique du siège",
            ClientId = client.Id
        };
        context.Parcs.Add(parc);
        await context.SaveChangesAsync();

        var equipement = new Equipement
        {
            Name = "PC Bureau RH",
            SerialNumber = "SN-2024-001",
            TypeEquipement = TypeEquipement.Ordinateur,
            Etat = EtatEquipement.EnService,
            ClientId = client.Id,
            ParcId = parc.Id,
            GarantieFin = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(6))
        };
        context.Equipements.Add(equipement);
        await context.SaveChangesAsync();

        var contrat = new Contrat
        {
            Name = "CTR00001",
            ClientId = client.Id,
            DateDebut = DateOnly.FromDateTime(DateTime.UtcNow),
            DateFin = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1)),
            Statut = StatutContrat.Actif,
            Montant = 150m,
            Recurrence = RecurrenceContrat.Mois,
            ProchaineFacture = DateOnly.FromDateTime(DateTime.UtcNow)
        };
        context.Contrats.Add(contrat);
        await context.SaveChangesAsync();

        context.ContratEquipements.Add(new ContratEquipement
        {
            ContratId = contrat.Id,
            EquipementId = equipement.Id
        });
        await context.SaveChangesAsync();
    }
}
