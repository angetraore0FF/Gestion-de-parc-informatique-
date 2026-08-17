using GestionParc.Application.DTOs;
using GestionParc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionParc.Api.Controllers;

[ApiController]
[Route("api/contrats")]
[Authorize]
public class ContratsController(IContratService service, IContratPdfService pdfService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ContratDto>>> GetAll([FromQuery] int? clientId, CancellationToken ct)
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
    public async Task<ActionResult<ContratDto>> GetById(int id, CancellationToken ct)
    {
        var contrat = await service.GetByIdAsync(id, ct);
        if (contrat is null) return NotFound();
        if (User.IsClientOnly() && contrat.ClientId != User.GetClientId()) return Forbid();
        return Ok(contrat);
    }

    [HttpPost]
    [Authorize(Policy = "Managers")]
    public async Task<ActionResult<ContratDto>> Create(CreateContratDto dto, CancellationToken ct)
    {
        var created = await service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "Managers")]
    public async Task<ActionResult<ContratDto>> Update(int id, UpdateContratDto dto, CancellationToken ct)
    {
        var updated = await service.UpdateAsync(id, dto, ct);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "Managers")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
        => await service.DeleteAsync(id, ct) ? NoContent() : NotFound();

    [HttpGet("{id:int}/pdf")]
    public async Task<IActionResult> GetPdf(int id, CancellationToken ct)
    {
        var contrat = await service.GetByIdAsync(id, ct);
        if (contrat is null) return NotFound();
        if (User.IsClientOnly() && contrat.ClientId != User.GetClientId()) return Forbid();

        var pdf = await pdfService.GenerateAsync(id, ct);
        if (pdf is null) return NotFound();

        return File(pdf, "application/pdf", $"{contrat.Name}.pdf");
    }

    [HttpPost("generer-factures")]
    [Authorize(Policy = "Managers")]
    public async Task<ActionResult<int>> GenererFacturesRecurrentes(CancellationToken ct)
        => Ok(new { facturesGenerees = await service.GenererFacturesRecurrentesAsync(ct) });
}
