using GestionParc.Application.DTOs;
using GestionParc.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GestionParc.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto, CancellationToken ct)
    {
        try
        {
            return Ok(await authService.RegisterAsync(dto, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto, CancellationToken ct)
    {
        var result = await authService.LoginAsync(dto, ct);
        return result is null ? Unauthorized(new { message = "Email ou mot de passe invalide." }) : Ok(result);
    }
}
