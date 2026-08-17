using GestionParc.Application.DTOs;
using GestionParc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionParc.Api.Controllers;

[ApiController]
[Route("api/parcs")]
[Authorize]
public class ParcsController(IParcService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ParcDto>>> GetAll([FromQuery] int? clientId, CancellationToken ct)
    {
        if (User.IsClientOnly())
        {
            var ownClientId = User.GetClientId();
            if (ownClientId is null) return Forbid();
            clientId = ownClientId;
        }

        return Ok(await service.GetAllAsync(clientId, ct));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ParcDto>> GetById(int id, CancellationToken ct)
    {
        var parc = await service.GetByIdAsync(id, ct);
        if (parc is null) return NotFound();
        if (User.IsClientOnly() && parc.ClientId != User.GetClientId()) return Forbid();
        return Ok(parc);
    }

    [HttpPost]
    [Authorize(Policy = "Managers")]
    public async Task<ActionResult<ParcDto>> Create(CreateParcDto dto, CancellationToken ct)
    {
        var created = await service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "Managers")]
    public async Task<ActionResult<ParcDto>> Update(int id, UpdateParcDto dto, CancellationToken ct)
    {
        var updated = await service.UpdateAsync(id, dto, ct);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "Managers")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
        => await service.DeleteAsync(id, ct) ? NoContent() : NotFound();
}
