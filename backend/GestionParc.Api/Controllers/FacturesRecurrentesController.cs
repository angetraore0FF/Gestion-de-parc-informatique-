using GestionParc.Application.DTOs;
using GestionParc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionParc.Api.Controllers;

[ApiController]
[Route("api/factures-recurrentes")]
[Authorize]
public class FacturesRecurrentesController(IFactureRecurrenteService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<FactureRecurrenteDto>>> GetAll(
        [FromQuery] int? contratId, CancellationToken ct)
    {
        var factures = await service.GetAllAsync(contratId, ct);

        if (User.IsClientOnly())
        {
            var ownClientId = User.GetClientId();
            if (ownClientId is null) return Forbid();
            factures = factures.Where(f => f.ClientId == ownClientId).ToList();
        }

        return Ok(factures);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<FactureRecurrenteDto>> GetById(int id, CancellationToken ct)
    {
        var facture = await service.GetByIdAsync(id, ct);
        if (facture is null) return NotFound();
        if (User.IsClientOnly() && facture.ClientId != User.GetClientId()) return Forbid();
        return Ok(facture);
    }

    [HttpPatch("{id:int}/statut")]
    [Authorize(Policy = "Staff")]
    public async Task<ActionResult<FactureRecurrenteDto>> UpdateStatut(
        int id, UpdateFactureRecurrenteDto dto, CancellationToken ct)
    {
        var updated = await service.UpdateStatutAsync(id, dto, ct);
        return updated is null ? NotFound() : Ok(updated);
    }
}
