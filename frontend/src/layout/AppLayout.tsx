import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const navItems = [
  { to: "/", label: "Clients", roles: ["Admin", "GestionnaireParc", "GestionnaireIntervention", "Technicien"] },
  { to: "/parcs", label: "Parcs", roles: [] },
  { to: "/equipements", label: "Équipements", roles: [] },
  { to: "/contrats", label: "Contrats", roles: [] },
  { to: "/factures-recurrentes", label: "Factures", roles: [] },
  { to: "/interventions", label: "Interventions", roles: [] },
  { to: "/techniciens", label: "Techniciens", roles: ["Admin", "GestionnaireParc", "GestionnaireIntervention", "Technicien"] },
  { to: "/produits", label: "Produits", roles: ["Admin", "GestionnaireParc", "GestionnaireIntervention", "Technicien"] },
];

export function AppLayout() {
  const { auth, logout, hasRole } = useAuth();

  return (
    <div className="min-h-screen flex bg-slate-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:bg-white focus:rounded-md focus:shadow-lg"
      >
        Aller au contenu
      </a>

      <aside className="w-56 bg-slate-900 text-slate-200 flex flex-col">
        <div className="px-4 py-4 font-heading font-semibold text-white border-b border-slate-700 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" aria-hidden="true" />
          Gestion Parc IT
        </div>
        <nav className="flex-1 py-2" aria-label="Navigation principale">
          {navItems
            .filter((item) => item.roles.length === 0 || hasRole(...item.roles))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-2 border-l-2 px-4 py-2.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:bg-slate-800 ${
                    isActive
                      ? "border-[var(--color-primary)] bg-slate-800 text-white font-medium"
                      : "border-transparent hover:bg-slate-800/60"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
        </nav>
        <div className="px-4 py-3 border-t border-slate-700 text-xs">
          <div className="mb-1 truncate">{auth?.email}</div>
          <div className="mb-2 text-slate-400">{auth?.roles.join(", ")}</div>
          <button
            onClick={logout}
            className="text-red-300 hover:text-red-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
          >
            Déconnexion
          </button>
        </div>
      </aside>
      <main id="main-content" className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
