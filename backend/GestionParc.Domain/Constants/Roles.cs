namespace GestionParc.Domain.Constants;

public static class Roles
{
    public const string Admin = "Admin";
    public const string GestionnaireParc = "GestionnaireParc";
    public const string GestionnaireIntervention = "GestionnaireIntervention";
    public const string Technicien = "Technicien";
    public const string Client = "Client";

    public static readonly string[] All =
    [
        Admin, GestionnaireParc, GestionnaireIntervention, Technicien, Client
    ];

    public const string Staff = $"{Admin},{GestionnaireParc},{GestionnaireIntervention},{Technicien}";
    public const string Managers = $"{Admin},{GestionnaireParc}";
}
