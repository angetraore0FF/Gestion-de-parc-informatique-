using Microsoft.AspNetCore.Identity;

namespace GestionParc.Infrastructure.Identity;

public class ApplicationUser : IdentityUser<int>
{
    public int? ClientId { get; set; }
    public int? TechnicienId { get; set; }
}
