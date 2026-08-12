using GestionParc.Application.DTOs;

namespace GestionParc.Application.Interfaces;

public interface IClientService
{
    Task<IReadOnlyList<ClientDto>> GetAllAsync(CancellationToken ct = default);
    Task<ClientDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<ClientDto> CreateAsync(CreateClientDto dto, CancellationToken ct = default);
    Task<ClientDto?> UpdateAsync(int id, UpdateClientDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}

public interface IParcService
{
    Task<IReadOnlyList<ParcDto>> GetAllAsync(int? clientId = null, CancellationToken ct = default);
    Task<ParcDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<ParcDto> CreateAsync(CreateParcDto dto, CancellationToken ct = default);
    Task<ParcDto?> UpdateAsync(int id, UpdateParcDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}

public interface IEquipementService
{
    Task<IReadOnlyList<EquipementDto>> GetAllAsync(int? clientId = null, int? parcId = null, CancellationToken ct = default);
    Task<EquipementDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<EquipementDto> CreateAsync(CreateEquipementDto dto, CancellationToken ct = default);
    Task<EquipementDto?> UpdateAsync(int id, UpdateEquipementDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<GarantieAlerteDto>> GetGarantieAlertesAsync(int joursAvance = 7, CancellationToken ct = default);
}

public interface IContratService
{
    Task<IReadOnlyList<ContratDto>> GetAllAsync(int? clientId = null, CancellationToken ct = default);
    Task<ContratDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<ContratDto> CreateAsync(CreateContratDto dto, CancellationToken ct = default);
    Task<ContratDto?> UpdateAsync(int id, UpdateContratDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
    Task<int> GenererFacturesRecurrentesAsync(CancellationToken ct = default);
}

public interface IFactureRecurrenteService
{
    Task<IReadOnlyList<FactureRecurrenteDto>> GetAllAsync(int? contratId = null, CancellationToken ct = default);
    Task<FactureRecurrenteDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<FactureRecurrenteDto?> UpdateStatutAsync(int id, UpdateFactureRecurrenteDto dto, CancellationToken ct = default);
}

public interface IInterventionService
{
    Task<IReadOnlyList<InterventionDto>> GetAllAsync(int? clientId = null, CancellationToken ct = default);
    Task<InterventionDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<InterventionDto> CreateAsync(CreateInterventionDto dto, CancellationToken ct = default);
    Task<InterventionDto?> UpdateAsync(int id, UpdateInterventionDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
    Task<FactureInterventionDto> GenererFactureAsync(int id, CancellationToken ct = default);
}

public interface ITechnicienService
{
    Task<IReadOnlyList<TechnicienDto>> GetAllAsync(CancellationToken ct = default);
    Task<TechnicienDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<TechnicienDto> CreateAsync(CreateTechnicienDto dto, CancellationToken ct = default);
    Task<TechnicienDto?> UpdateAsync(int id, UpdateTechnicienDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}

public interface IProduitService
{
    Task<IReadOnlyList<ProduitDto>> GetAllAsync(CancellationToken ct = default);
    Task<ProduitDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<ProduitDto> CreateAsync(CreateProduitDto dto, CancellationToken ct = default);
    Task<ProduitDto?> UpdateAsync(int id, UpdateProduitDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}
