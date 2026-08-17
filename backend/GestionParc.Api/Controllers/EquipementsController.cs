using GestionParc.Application.DTOs;
using GestionParc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionParc.Api.Controllers;

[ApiController]
[Route("api/equipements")]
[Authorize]
public class EquipementsController(IEquipementService service, IEquipementRapportService rapportService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EquipementDto>>> GetAll(
        [FromQuery] int? clientId, [FromQuery] int? parcId, CancellationToken ct)
    {
        if (User.IsClientOnly())
        {
            var ownClientId = User.GetClientId();
            if (ownClientId is null) return Forbid();
            clientId = ownClientId;
        }

        return Ok(await service.GetAllAsync(clientId, parcId, ct));
    }

    [HttpGet("garantie-alertes")]
    [Authorize(Policy = "Staff")]
    public async Task<ActionResult<IReadOnlyList<GarantieAlerteDto>>> GetGarantieAlertes(
        [FromQuery] int joursAvance = 7, CancellationToken ct = default)
        => Ok(await service.GetGarantieAlertesAsync(joursAvance, ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EquipementDto>> GetById(int id, CancellationToken ct)
    {
        var equipement = await service.GetByIdAsync(id, ct);
        if (equipement is null) return NotFound();
        if (User.IsClientOnly() && equipement.ClientId != User.GetClientId()) return Forbid();
        return Ok(equipement);
    }

    [HttpPost]
    [Authorize(Policy = "Staff")]
    public async Task<ActionResult<EquipementDto>> Create(CreateEquipementDto dto, CancellationToken ct)
    {
        try
        {
            var created = await service.CreateAsync(dto, ct);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "Staff")]
    public async Task<ActionResult<EquipementDto>> Update(int id, UpdateEquipementDto dto, CancellationToken ct)
    {
        try
        {
            var updated = await service.UpdateAsync(id, dto, ct);
            return updated is null ? NotFound() : Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "Managers")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
        => await service.DeleteAsync(id, ct) ? NoContent() : NotFound();

    [HttpGet("{id:int}/rapport-pannes/pdf")]
    public async Task<IActionResult> GetRapportPannes(int id, CancellationToken ct)
    {
        var equipement = await service.GetByIdAsync(id, ct);
        if (equipement is null) return NotFound();
        if (User.IsClientOnly() && equipement.ClientId != User.GetClientId()) return Forbid();

        var pdf = await rapportService.GenerateHistoriquePannesAsync(id, ct);
        if (pdf is null) return NotFound();

        return File(pdf, "application/pdf", $"historique-pannes-{equipement.Name}.pdf");
    }
}
