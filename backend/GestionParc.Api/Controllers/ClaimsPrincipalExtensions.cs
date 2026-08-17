using System.Security.Claims;
using GestionParc.Domain.Constants;

namespace GestionParc.Api.Controllers;

public static class ClaimsPrincipalExtensions
{
    public static int? GetClientId(this ClaimsPrincipal user)
        => int.TryParse(user.FindFirstValue("clientId"), out var v) ? v : null;

    public static int? GetTechnicienId(this ClaimsPrincipal user)
        => int.TryParse(user.FindFirstValue("technicienId"), out var v) ? v : null;

    public static bool IsClientOnly(this ClaimsPrincipal user)
        => user.IsInRole(Roles.Client) && !user.IsInRole(Roles.Admin) && !user.IsInRole(Roles.GestionnaireParc)
           && !user.IsInRole(Roles.GestionnaireIntervention) && !user.IsInRole(Roles.Technicien);

    public static bool IsTechnicienOnly(this ClaimsPrincipal user)
        => user.IsInRole(Roles.Technicien) && !user.IsInRole(Roles.Admin) && !user.IsInRole(Roles.GestionnaireParc)
           && !user.IsInRole(Roles.GestionnaireIntervention);
}
