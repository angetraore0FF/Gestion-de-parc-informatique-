using GestionParc.Application.DTOs;
using GestionParc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionParc.Api.Controllers;

[ApiController]
[Route("api/interventions")]
[Authorize]
public class InterventionsController(IInterventionService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<InterventionDto>>> GetAll(
        [FromQuery] int? clientId, CancellationToken ct)
    {
        if (User.IsClientOnly())
        {
            var ownClientId = User.GetClientId();
            if (ownClientId is null) return Forbid();
            clientId = ownClientId;
        }

        var interventions = await service.GetAllAsync(clientId, ct);

        if (User.IsTechnicienOnly())
        {
            var ownTechnicienId = User.GetTechnicienId();
            interventions = interventions
                .Where(i => i.TechnicienId == ownTechnicienId || i.TechnicienId == null)
                .ToList();
        }

        return Ok(interventions);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<InterventionDto>> GetById(int id, CancellationToken ct)
    {
        var intervention = await service.GetByIdAsync(id, ct);
        if (intervention is null) return NotFound();
        if (User.IsClientOnly() && intervention.ClientId != User.GetClientId()) return Forbid();
        if (User.IsTechnicienOnly() && intervention.TechnicienId is not null
            && intervention.TechnicienId != User.GetTechnicienId())
            return Forbid();
        return Ok(intervention);
    }

    [HttpPost]
    public async Task<ActionResult<InterventionDto>> Create(CreateInterventionDto dto, CancellationToken ct)
    {
        if (User.IsClientOnly())
        {
            var ownClientId = User.GetClientId();
            if (ownClientId is null || dto.ClientId != ownClientId) return Forbid();
        }

        var created = await service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "Staff")]
    public async Task<ActionResult<InterventionDto>> Update(int id, UpdateInterventionDto dto, CancellationToken ct)
    {
        var updated = await service.UpdateAsync(id, dto, ct);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "Managers")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
        => await service.DeleteAsync(id, ct) ? NoContent() : NotFound();

    [HttpPost("{id:int}/generer-facture")]
    [Authorize(Policy = "Managers")]
    public async Task<ActionResult<FactureInterventionDto>> GenererFacture(int id, CancellationToken ct)
    {
        try
        {
            return Ok(await service.GenererFactureAsync(id, ct));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }
}
