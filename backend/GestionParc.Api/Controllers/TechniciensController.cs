using GestionParc.Application.DTOs;
using GestionParc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionParc.Api.Controllers;

[ApiController]
[Route("api/techniciens")]
[Authorize(Policy = "Staff")]
public class TechniciensController(ITechnicienService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TechnicienDto>>> GetAll(CancellationToken ct)
        => Ok(await service.GetAllAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TechnicienDto>> GetById(int id, CancellationToken ct)
    {
        var technicien = await service.GetByIdAsync(id, ct);
        return technicien is null ? NotFound() : Ok(technicien);
    }

    [HttpPost]
    [Authorize(Policy = "Managers")]
    public async Task<ActionResult<TechnicienDto>> Create(CreateTechnicienDto dto, CancellationToken ct)
    {
        var created = await service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "Managers")]
    public async Task<ActionResult<TechnicienDto>> Update(int id, UpdateTechnicienDto dto, CancellationToken ct)
    {
        var updated = await service.UpdateAsync(id, dto, ct);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "Managers")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
        => await service.DeleteAsync(id, ct) ? NoContent() : NotFound();
}
