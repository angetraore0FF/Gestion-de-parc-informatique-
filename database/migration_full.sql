IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE TABLE [Clients] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(200) NOT NULL,
        [Email] nvarchar(450) NULL,
        [Phone] nvarchar(max) NULL,
        [Address] nvarchar(max) NULL,
        [IsParcClient] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [CreatedBy] nvarchar(max) NULL,
        [UpdatedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_Clients] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE TABLE [Produits] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(200) NOT NULL,
        [Reference] nvarchar(max) NULL,
        [PrixUnitaire] decimal(18,2) NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [CreatedBy] nvarchar(max) NULL,
        [UpdatedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_Produits] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE TABLE [Techniciens] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(200) NOT NULL,
        [Email] nvarchar(max) NULL,
        [Phone] nvarchar(max) NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [CreatedBy] nvarchar(max) NULL,
        [UpdatedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_Techniciens] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE TABLE [Contrats] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(50) NOT NULL,
        [ClientId] int NOT NULL,
        [DateDebut] date NOT NULL,
        [DateFin] date NOT NULL,
        [Statut] nvarchar(50) NOT NULL,
        [Montant] decimal(18,2) NOT NULL,
        [Recurrence] nvarchar(50) NOT NULL,
        [ProchaineFacture] date NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [CreatedBy] nvarchar(max) NULL,
        [UpdatedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_Contrats] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Contrats_Clients_ClientId] FOREIGN KEY ([ClientId]) REFERENCES [Clients] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE TABLE [FacturesIntervention] (
        [Id] int NOT NULL IDENTITY,
        [ClientId] int NOT NULL,
        [DateFacture] date NOT NULL,
        [MontantTotal] decimal(18,2) NOT NULL,
        [Statut] nvarchar(50) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [CreatedBy] nvarchar(max) NULL,
        [UpdatedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_FacturesIntervention] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_FacturesIntervention_Clients_ClientId] FOREIGN KEY ([ClientId]) REFERENCES [Clients] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE TABLE [Parcs] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(200) NOT NULL,
        [Description] nvarchar(max) NULL,
        [ClientId] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [CreatedBy] nvarchar(max) NULL,
        [UpdatedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_Parcs] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Parcs_Clients_ClientId] FOREIGN KEY ([ClientId]) REFERENCES [Clients] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE TABLE [FacturesRecurrentes] (
        [Id] int NOT NULL IDENTITY,
        [ContratId] int NOT NULL,
        [ClientId] int NOT NULL,
        [DateFacture] date NOT NULL,
        [Montant] decimal(18,2) NOT NULL,
        [Statut] nvarchar(50) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [CreatedBy] nvarchar(max) NULL,
        [UpdatedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_FacturesRecurrentes] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_FacturesRecurrentes_Clients_ClientId] FOREIGN KEY ([ClientId]) REFERENCES [Clients] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_FacturesRecurrentes_Contrats_ContratId] FOREIGN KEY ([ContratId]) REFERENCES [Contrats] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE TABLE [FacturesInterventionLignes] (
        [Id] int NOT NULL IDENTITY,
        [FactureInterventionId] int NOT NULL,
        [ProduitId] int NOT NULL,
        [Description] nvarchar(500) NOT NULL,
        [Quantite] decimal(18,4) NOT NULL,
        [PrixUnitaire] decimal(18,2) NOT NULL,
        [MontantTotal] decimal(18,2) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [CreatedBy] nvarchar(max) NULL,
        [UpdatedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_FacturesInterventionLignes] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_FacturesInterventionLignes_FacturesIntervention_FactureInterventionId] FOREIGN KEY ([FactureInterventionId]) REFERENCES [FacturesIntervention] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_FacturesInterventionLignes_Produits_ProduitId] FOREIGN KEY ([ProduitId]) REFERENCES [Produits] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE TABLE [Equipements] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(200) NOT NULL,
        [SerialNumber] nvarchar(450) NULL,
        [PurchaseDate] date NULL,
        [DateAcquisition] date NULL,
        [GarantieFin] date NULL,
        [Etat] nvarchar(50) NOT NULL,
        [TypeEquipement] nvarchar(50) NOT NULL,
        [Reference] nvarchar(max) NULL,
        [Image] varbinary(max) NULL,
        [ClientId] int NULL,
        [ParcId] int NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [CreatedBy] nvarchar(max) NULL,
        [UpdatedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_Equipements] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Equipements_Clients_ClientId] FOREIGN KEY ([ClientId]) REFERENCES [Clients] ([Id]) ON DELETE SET NULL,
        CONSTRAINT [FK_Equipements_Parcs_ParcId] FOREIGN KEY ([ParcId]) REFERENCES [Parcs] ([Id]) ON DELETE SET NULL
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE TABLE [ContratEquipements] (
        [ContratId] int NOT NULL,
        [EquipementId] int NOT NULL,
        CONSTRAINT [PK_ContratEquipements] PRIMARY KEY ([ContratId], [EquipementId]),
        CONSTRAINT [FK_ContratEquipements_Contrats_ContratId] FOREIGN KEY ([ContratId]) REFERENCES [Contrats] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_ContratEquipements_Equipements_EquipementId] FOREIGN KEY ([EquipementId]) REFERENCES [Equipements] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE TABLE [Interventions] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(200) NOT NULL,
        [ClientId] int NOT NULL,
        [EquipementId] int NOT NULL,
        [DateIntervention] datetime2 NOT NULL,
        [Description] nvarchar(max) NULL,
        [TechnicienId] int NULL,
        [Statut] nvarchar(50) NOT NULL,
        [FactureInterventionId] int NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [CreatedBy] nvarchar(max) NULL,
        [UpdatedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_Interventions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Interventions_Clients_ClientId] FOREIGN KEY ([ClientId]) REFERENCES [Clients] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Interventions_Equipements_EquipementId] FOREIGN KEY ([EquipementId]) REFERENCES [Equipements] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Interventions_FacturesIntervention_FactureInterventionId] FOREIGN KEY ([FactureInterventionId]) REFERENCES [FacturesIntervention] ([Id]),
        CONSTRAINT [FK_Interventions_Techniciens_TechnicienId] FOREIGN KEY ([TechnicienId]) REFERENCES [Techniciens] ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE TABLE [InterventionsMateriel] (
        [Id] int NOT NULL IDENTITY,
        [InterventionId] int NOT NULL,
        [ProduitId] int NOT NULL,
        [Description] nvarchar(max) NULL,
        [Quantite] decimal(18,4) NOT NULL,
        [PrixUnitaire] decimal(18,2) NOT NULL,
        [MontantTotal] decimal(18,2) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [CreatedBy] nvarchar(max) NULL,
        [UpdatedBy] nvarchar(max) NULL,
        CONSTRAINT [PK_InterventionsMateriel] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_InterventionsMateriel_Interventions_InterventionId] FOREIGN KEY ([InterventionId]) REFERENCES [Interventions] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_InterventionsMateriel_Produits_ProduitId] FOREIGN KEY ([ProduitId]) REFERENCES [Produits] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_Clients_Email] ON [Clients] ([Email]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_ContratEquipements_EquipementId] ON [ContratEquipements] ([EquipementId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_Contrats_ClientId] ON [Contrats] ([ClientId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Contrats_Name] ON [Contrats] ([Name]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_Equipements_ClientId] ON [Equipements] ([ClientId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_Equipements_ParcId] ON [Equipements] ([ParcId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_Equipements_SerialNumber] ON [Equipements] ([SerialNumber]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_FacturesIntervention_ClientId] ON [FacturesIntervention] ([ClientId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_FacturesInterventionLignes_FactureInterventionId] ON [FacturesInterventionLignes] ([FactureInterventionId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_FacturesInterventionLignes_ProduitId] ON [FacturesInterventionLignes] ([ProduitId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_FacturesRecurrentes_ClientId] ON [FacturesRecurrentes] ([ClientId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_FacturesRecurrentes_ContratId] ON [FacturesRecurrentes] ([ContratId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_Interventions_ClientId] ON [Interventions] ([ClientId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_Interventions_EquipementId] ON [Interventions] ([EquipementId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_Interventions_FactureInterventionId] ON [Interventions] ([FactureInterventionId]) WHERE [FactureInterventionId] IS NOT NULL');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_Interventions_TechnicienId] ON [Interventions] ([TechnicienId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_InterventionsMateriel_InterventionId] ON [InterventionsMateriel] ([InterventionId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_InterventionsMateriel_ProduitId] ON [InterventionsMateriel] ([ProduitId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    CREATE INDEX [IX_Parcs_ClientId] ON [Parcs] ([ClientId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233506_InitialMigration'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260812233506_InitialMigration', N'8.0.11');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815140024_AddIdentity'
)
BEGIN
    CREATE TABLE [AspNetRoles] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(256) NULL,
        [NormalizedName] nvarchar(256) NULL,
        [ConcurrencyStamp] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetRoles] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815140024_AddIdentity'
)
BEGIN
    CREATE TABLE [AspNetUsers] (
        [Id] int NOT NULL IDENTITY,
        [ClientId] int NULL,
        [TechnicienId] int NULL,
        [UserName] nvarchar(256) NULL,
        [NormalizedUserName] nvarchar(256) NULL,
        [Email] nvarchar(256) NULL,
        [NormalizedEmail] nvarchar(256) NULL,
        [EmailConfirmed] bit NOT NULL,
        [PasswordHash] nvarchar(max) NULL,
        [SecurityStamp] nvarchar(max) NULL,
        [ConcurrencyStamp] nvarchar(max) NULL,
        [PhoneNumber] nvarchar(max) NULL,
        [PhoneNumberConfirmed] bit NOT NULL,
        [TwoFactorEnabled] bit NOT NULL,
        [LockoutEnd] datetimeoffset NULL,
        [LockoutEnabled] bit NOT NULL,
        [AccessFailedCount] int NOT NULL,
        CONSTRAINT [PK_AspNetUsers] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AspNetUsers_Clients_ClientId] FOREIGN KEY ([ClientId]) REFERENCES [Clients] ([Id]) ON DELETE SET NULL,
        CONSTRAINT [FK_AspNetUsers_Techniciens_TechnicienId] FOREIGN KEY ([TechnicienId]) REFERENCES [Techniciens] ([Id]) ON DELETE SET NULL
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815140024_AddIdentity'
)
BEGIN
    CREATE TABLE [AspNetRoleClaims] (
        [Id] int NOT NULL IDENTITY,
        [RoleId] int NOT NULL,
        [ClaimType] nvarchar(max) NULL,
        [ClaimValue] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815140024_AddIdentity'
)
BEGIN
    CREATE TABLE [AspNetUserClaims] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [ClaimType] nvarchar(max) NULL,
        [ClaimValue] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815140024_AddIdentity'
)
BEGIN
    CREATE TABLE [AspNetUserLogins] (
        [LoginProvider] nvarchar(450) NOT NULL,
        [ProviderKey] nvarchar(450) NOT NULL,
        [ProviderDisplayName] nvarchar(max) NULL,
        [UserId] int NOT NULL,
        CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY ([LoginProvider], [ProviderKey]),
        CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815140024_AddIdentity'
)
BEGIN
    CREATE TABLE [AspNetUserRoles] (
        [UserId] int NOT NULL,
        [RoleId] int NOT NULL,
        CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY ([UserId], [RoleId]),
        CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815140024_AddIdentity'
)
BEGIN
    CREATE TABLE [AspNetUserTokens] (
        [UserId] int NOT NULL,
        [LoginProvider] nvarchar(450) NOT NULL,
        [Name] nvarchar(450) NOT NULL,
        [Value] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name]),
        CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815140024_AddIdentity'
)
BEGIN
    CREATE INDEX [IX_AspNetRoleClaims_RoleId] ON [AspNetRoleClaims] ([RoleId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815140024_AddIdentity'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [RoleNameIndex] ON [AspNetRoles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815140024_AddIdentity'
)
BEGIN
    CREATE INDEX [IX_AspNetUserClaims_UserId] ON [AspNetUserClaims] ([UserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815140024_AddIdentity'
)
BEGIN
    CREATE INDEX [IX_AspNetUserLogins_UserId] ON [AspNetUserLogins] ([UserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815140024_AddIdentity'
)
BEGIN
    CREATE INDEX [IX_AspNetUserRoles_RoleId] ON [AspNetUserRoles] ([RoleId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815140024_AddIdentity'
)
BEGIN
    CREATE INDEX [EmailIndex] ON [AspNetUsers] ([NormalizedEmail]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815140024_AddIdentity'
)
BEGIN
    CREATE INDEX [IX_AspNetUsers_ClientId] ON [AspNetUsers] ([ClientId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815140024_AddIdentity'
)
BEGIN
    CREATE INDEX [IX_AspNetUsers_TechnicienId] ON [AspNetUsers] ([TechnicienId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815140024_AddIdentity'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [UserNameIndex] ON [AspNetUsers] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815140024_AddIdentity'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260815140024_AddIdentity', N'8.0.11');
END;
GO

COMMIT;
GO

