using GestionParc.Application.DTOs;
using GestionParc.Application.Interfaces;
using GestionParc.Domain.Entities;
using GestionParc.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GestionParc.Infrastructure.Services;

public class ClientService(GestionParcDbContext db) : IClientService
{
    public async Task<IReadOnlyList<ClientDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await db.Clients
            .Select(c => new ClientDto(
                c.Id, c.Name, c.Email, c.Phone, c.Address, c.IsParcClient,
                c.Parcs.Count, c.Equipements.Count, c.Contrats.Count))
            .ToListAsync(ct);
    }

    public async Task<ClientDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await db.Clients
            .Where(c => c.Id == id)
            .Select(c => new ClientDto(
                c.Id, c.Name, c.Email, c.Phone, c.Address, c.IsParcClient,
                c.Parcs.Count, c.Equipements.Count, c.Contrats.Count))
            .FirstOrDefaultAsync(ct);
    }

    public async Task<ClientDto> CreateAsync(CreateClientDto dto, CancellationToken ct = default)
    {
        var client = new Client
        {
            Name = dto.Name,
            Email = dto.Email,
            Phone = dto.Phone,
            Address = dto.Address,
            IsParcClient = dto.IsParcClient,
        };

        db.Clients.Add(client);
        await db.SaveChangesAsync(ct);

        return ToDto(client);
    }

    public async Task<ClientDto?> UpdateAsync(int id, UpdateClientDto dto, CancellationToken ct = default)
    {
        var client = await db.Clients.FindAsync([id], ct);
        if (client is null) return null;

        client.Name = dto.Name;
        client.Email = dto.Email;
        client.Phone = dto.Phone;
        client.Address = dto.Address;
        client.IsParcClient = dto.IsParcClient;
        client.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        return ToDto(client);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var client = await db.Clients.FindAsync([id], ct);
        if (client is null) return false;

        db.Clients.Remove(client);
        await db.SaveChangesAsync(ct);
        return true;
    }

    private static ClientDto ToDto(Client c) => new(
        c.Id,
        c.Name,
        c.Email,
        c.Phone,
        c.Address,
        c.IsParcClient,
        c.Parcs.Count,
        c.Equipements.Count,
        c.Contrats.Count);
}
