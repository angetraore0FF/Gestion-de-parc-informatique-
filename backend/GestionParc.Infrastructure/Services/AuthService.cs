using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GestionParc.Application.DTOs;
using GestionParc.Application.Interfaces;
using GestionParc.Domain.Constants;
using GestionParc.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace GestionParc.Infrastructure.Services;

public class AuthService(
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole<int>> roleManager,
    IConfiguration configuration) : IAuthService
{
    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto, CancellationToken ct = default)
    {
        if (!Roles.All.Contains(dto.Role))
            throw new InvalidOperationException($"Rôle inconnu : {dto.Role}.");

        if (!await roleManager.RoleExistsAsync(dto.Role))
            throw new InvalidOperationException($"Le rôle {dto.Role} n'est pas initialisé.");

        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            ClientId = dto.Role == Roles.Client ? dto.ClientId : null,
            TechnicienId = dto.Role == Roles.Technicien ? dto.TechnicienId : null,
        };

        var result = await userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));

        await userManager.AddToRoleAsync(user, dto.Role);

        return await BuildAuthResponseAsync(user);
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto, CancellationToken ct = default)
    {
        var user = await userManager.FindByEmailAsync(dto.Email);
        if (user is null) return null;

        var passwordOk = await userManager.CheckPasswordAsync(user, dto.Password);
        if (!passwordOk) return null;

        return await BuildAuthResponseAsync(user);
    }

    private async Task<AuthResponseDto> BuildAuthResponseAsync(ApplicationUser user)
    {
        var roles = await userManager.GetRolesAsync(user);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email!),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
        };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));
        if (user.ClientId is not null)
            claims.Add(new Claim("clientId", user.ClientId.Value.ToString()));
        if (user.TechnicienId is not null)
            claims.Add(new Claim("technicienId", user.TechnicienId.Value.ToString()));

        var jwt = configuration.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiresMinutes = int.Parse(jwt["ExpiresMinutes"] ?? "120");
        var expires = DateTime.UtcNow.AddMinutes(expiresMinutes);

        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: creds);

        return new AuthResponseDto(
            new JwtSecurityTokenHandler().WriteToken(token),
            expires,
            user.Email!,
            roles.ToList(),
            user.ClientId,
            user.TechnicienId);
    }
}
