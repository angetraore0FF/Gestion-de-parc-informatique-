using GestionParc.Domain.Entities;
using GestionParc.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace GestionParc.Infrastructure.Persistence;

public class GestionParcDbContext : IdentityDbContext<ApplicationUser, IdentityRole<int>, int>
{
    public GestionParcDbContext(DbContextOptions<GestionParcDbContext> options)
        : base(options)
    {
    }

    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Parc> Parcs => Set<Parc>();
    public DbSet<Equipement> Equipements => Set<Equipement>();
    public DbSet<Contrat> Contrats => Set<Contrat>();
    public DbSet<ContratEquipement> ContratEquipements => Set<ContratEquipement>();
    public DbSet<FactureRecurrente> FacturesRecurrentes => Set<FactureRecurrente>();
    public DbSet<Intervention> Interventions => Set<Intervention>();
    public DbSet<InterventionMateriel> InterventionsMateriel => Set<InterventionMateriel>();
    public DbSet<Technicien> Techniciens => Set<Technicien>();
    public DbSet<Produit> Produits => Set<Produit>();
    public DbSet<FactureIntervention> FacturesIntervention => Set<FactureIntervention>();
    public DbSet<FactureInterventionLigne> FacturesInterventionLignes => Set<FactureInterventionLigne>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ApplicationUser>(e =>
        {
            e.HasOne<Client>().WithMany().HasForeignKey(u => u.ClientId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne<Technicien>().WithMany().HasForeignKey(u => u.TechnicienId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Client>(e =>
        {
            e.HasIndex(c => c.Email);
            e.Property(c => c.Name).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<Parc>(e =>
        {
            e.Property(p => p.Name).HasMaxLength(200).IsRequired();
            e.HasOne(p => p.Client)
                .WithMany(c => c.Parcs)
                .HasForeignKey(p => p.ClientId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Equipement>(e =>
        {
            e.Property(eq => eq.Name).HasMaxLength(200).IsRequired();
            e.HasOne(eq => eq.Client)
                .WithMany(c => c.Equipements)
                .HasForeignKey(eq => eq.ClientId)
                .OnDelete(DeleteBehavior.SetNull);
            e.HasOne(eq => eq.Parc)
                .WithMany(p => p.Equipements)
                .HasForeignKey(eq => eq.ParcId)
                .OnDelete(DeleteBehavior.SetNull);
            e.HasIndex(eq => eq.SerialNumber);
            e.Property(eq => eq.Etat).HasConversion<string>().HasMaxLength(50);
            e.Property(eq => eq.TypeEquipement).HasConversion<string>().HasMaxLength(50);
            e.Property(eq => eq.AdresseMac).HasMaxLength(50);
            e.Property(eq => eq.AdresseIp).HasMaxLength(45);
            e.Property(eq => eq.SystemeExploitation).HasMaxLength(100);
            e.Property(eq => eq.Emplacement).HasMaxLength(200);
        });

        modelBuilder.Entity<ContratEquipement>(e =>
        {
            e.HasKey(ce => new { ce.ContratId, ce.EquipementId });
            e.HasOne(ce => ce.Contrat)
                .WithMany(c => c.Equipements)
                .HasForeignKey(ce => ce.ContratId);
            e.HasOne(ce => ce.Equipement)
                .WithMany(eq => eq.Contrats)
                .HasForeignKey(ce => ce.EquipementId);
        });

        modelBuilder.Entity<Contrat>(e =>
        {
            e.HasIndex(c => c.Name).IsUnique();
            e.Property(c => c.Name).HasMaxLength(50).IsRequired();
            e.Property(c => c.Montant).HasPrecision(18, 2);
            e.Property(c => c.Statut).HasConversion<string>().HasMaxLength(50);
            e.Property(c => c.Recurrence).HasConversion<string>().HasMaxLength(50);
            e.HasOne(c => c.Client)
                .WithMany(cl => cl.Contrats)
                .HasForeignKey(c => c.ClientId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<FactureRecurrente>(e =>
        {
            e.Property(f => f.Montant).HasPrecision(18, 2);
            e.Property(f => f.Statut).HasConversion<string>().HasMaxLength(50);
            e.HasOne(f => f.Contrat)
                .WithMany(c => c.Factures)
                .HasForeignKey(f => f.ContratId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(f => f.Client)
                .WithMany(c => c.FacturesRecurrentes)
                .HasForeignKey(f => f.ClientId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Intervention>(e =>
        {
            e.Property(i => i.Name).HasMaxLength(200).IsRequired();
            e.Property(i => i.Statut).HasConversion<string>().HasMaxLength(50);
            e.Property(i => i.ContactReferent).HasMaxLength(200);
            e.Property(i => i.IntervenantResolution).HasMaxLength(200);
            e.HasOne(i => i.Client)
                .WithMany(c => c.Interventions)
                .HasForeignKey(i => i.ClientId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(i => i.Equipement)
                .WithMany(eq => eq.Interventions)
                .HasForeignKey(i => i.EquipementId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(i => i.Technicien)
                .WithMany(t => t.Interventions)
                .HasForeignKey(i => i.TechnicienId)
                .IsRequired(false);
            e.HasOne(i => i.FactureIntervention)
                .WithOne(f => f.Intervention)
                .HasForeignKey<Intervention>(i => i.FactureInterventionId)
                .IsRequired(false);
        });

        modelBuilder.Entity<InterventionMateriel>(e =>
        {
            e.Property(m => m.Quantite).HasPrecision(18, 4);
            e.Property(m => m.PrixUnitaire).HasPrecision(18, 2);
            e.Property(m => m.MontantTotal).HasPrecision(18, 2);
            e.HasOne(m => m.Intervention)
                .WithMany(i => i.Materiels)
                .HasForeignKey(m => m.InterventionId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(m => m.Produit)
                .WithMany(p => p.LignesMateriel)
                .HasForeignKey(m => m.ProduitId);
        });

        modelBuilder.Entity<Produit>(e =>
        {
            e.Property(p => p.Name).HasMaxLength(200).IsRequired();
            e.Property(p => p.PrixUnitaire).HasPrecision(18, 2);
        });

        modelBuilder.Entity<Technicien>(e =>
        {
            e.Property(t => t.Name).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<FactureIntervention>(e =>
        {
            e.Property(f => f.MontantTotal).HasPrecision(18, 2);
            e.Property(f => f.Statut).HasConversion<string>().HasMaxLength(50);
            e.HasOne(f => f.Client)
                .WithMany(c => c.FacturesIntervention)
                .HasForeignKey(f => f.ClientId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<FactureInterventionLigne>(e =>
        {
            e.Property(l => l.Description).HasMaxLength(500).IsRequired();
            e.Property(l => l.Quantite).HasPrecision(18, 4);
            e.Property(l => l.PrixUnitaire).HasPrecision(18, 2);
            e.Property(l => l.MontantTotal).HasPrecision(18, 2);
            e.HasOne(l => l.Facture)
                .WithMany(f => f.Lignes)
                .HasForeignKey(l => l.FactureInterventionId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(l => l.Produit)
                .WithMany()
                .HasForeignKey(l => l.ProduitId);
        });
    }
}
