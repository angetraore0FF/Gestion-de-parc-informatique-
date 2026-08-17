using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionParc.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddIncidentEtEquipementFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContactReferent",
                table: "Interventions",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateDebutPanne",
                table: "Interventions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DescriptionResolution",
                table: "Interventions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IntervenantResolution",
                table: "Interventions",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AdresseIp",
                table: "Equipements",
                type: "nvarchar(45)",
                maxLength: 45,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AdresseMac",
                table: "Equipements",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Emplacement",
                table: "Equipements",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SystemeExploitation",
                table: "Equipements",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContactReferent",
                table: "Interventions");

            migrationBuilder.DropColumn(
                name: "DateDebutPanne",
                table: "Interventions");

            migrationBuilder.DropColumn(
                name: "DescriptionResolution",
                table: "Interventions");

            migrationBuilder.DropColumn(
                name: "IntervenantResolution",
                table: "Interventions");

            migrationBuilder.DropColumn(
                name: "AdresseIp",
                table: "Equipements");

            migrationBuilder.DropColumn(
                name: "AdresseMac",
                table: "Equipements");

            migrationBuilder.DropColumn(
                name: "Emplacement",
                table: "Equipements");

            migrationBuilder.DropColumn(
                name: "SystemeExploitation",
                table: "Equipements");
        }
    }
}
