import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import {
  BoxIcon,
  DesktopIcon,
  FileTextIcon,
  GlobeIcon,
  IdCardIcon,
  InvoiceIcon,
  LayersIcon,
  LogoutIcon,
  MenuIcon,
  UsersIcon,
  WrenchIcon,
} from "../components/ui/Icons";

const navItems = [
  { to: "/", key: "clients", Icon: UsersIcon, roles: [] },
  { to: "/parcs", key: "parcs", Icon: LayersIcon, roles: [] },
  { to: "/equipements", key: "equipements", Icon: DesktopIcon, roles: [] },
  { to: "/contrats", key: "contrats", Icon: FileTextIcon, roles: [] },
  { to: "/factures-recurrentes", key: "factures", Icon: InvoiceIcon, roles: [] },
  { to: "/interventions", key: "interventions", Icon: WrenchIcon, roles: [] },
  { to: "/techniciens", key: "techniciens", Icon: IdCardIcon, roles: ["Admin", "GestionnaireParc", "GestionnaireIntervention", "Technicien"] },
  { to: "/produits", key: "produits", Icon: BoxIcon, roles: ["Admin", "GestionnaireParc", "GestionnaireIntervention", "Technicien"] },
] as const;

export function AppLayout() {
  const { auth, logout, hasRole } = useAuth();
  const { t, lang, toggleLang } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const initials = (auth?.email?.[0] ?? "U").toUpperCase();

  const sidebar = (
    <div className="flex h-full flex-col mesh-brand text-slate-200">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime font-heading text-sm font-extrabold text-brand-darker shadow-lg shadow-black/20">
          GP
        </span>
        <div className="leading-tight">
          <div className="font-heading text-sm font-bold text-white">{t("app.name")}</div>
          <div className="text-[11px] text-slate-400">{t("app.tagline")}</div>
        </div>
      </div>

      <div className="px-5 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-widest text-white/40">
        {t("nav.section")}
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label={t("nav.section")}>
        {navItems
          .filter((item) => item.roles.length === 0 || hasRole(...item.roles))
          .map(({ to, key, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime/70 ${
                  isActive
                    ? "bg-white/10 font-semibold text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-lime transition-all duration-200 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                    aria-hidden="true"
                  />
                  <Icon className={`h-[18px] w-[18px] transition-colors ${isActive ? "text-lime" : "text-slate-400 group-hover:text-lime"}`} />
                  {t(`nav.${key}`)}
                </>
              )}
            </NavLink>
          ))}
      </nav>

      <div className="m-3 rounded-xl bg-black/20 p-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand font-heading text-sm font-bold text-white ring-1 ring-white/15">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-white">{auth?.email}</div>
            <div className="truncate text-[11px] text-slate-400">{auth?.roles.join(", ")}</div>
          </div>
        </div>
        <button
          onClick={logout}
          data-testid="logout-button"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-red-500/20 hover:text-red-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          <LogoutIcon className="h-4 w-4" />
          {t("action.logout")}
        </button>
      </div>
    </div>
  );

  const currentNav = navItems.find((n) => n.to === location.pathname);

  return (
    <div className="min-h-screen bg-surface lg:flex">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:shadow-lg"
      >
        {t("nav.section")}
      </a>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 w-64">{sidebar}</div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-brand-darker/50 backdrop-blur-sm animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 animate-fade-in">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200/70 bg-surface/85 px-4 py-3 backdrop-blur-md sm:px-6">
          <button
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-200/60 lg:hidden cursor-pointer"
            aria-label="Menu"
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <div className="font-heading text-sm font-semibold text-slate-700">
            {currentNav ? t(`nav.${currentNav.key}`) : t("app.name")}
          </div>
          <div className="ml-auto">
            <button
              onClick={toggleLang}
              data-testid="language-toggle"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-brand/40 hover:text-brand cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              aria-label="Language"
            >
              <GlobeIcon className="h-4 w-4" />
              <span className={lang === "fr" ? "text-brand" : ""}>FR</span>
              <span className="text-slate-300">/</span>
              <span className={lang === "en" ? "text-brand" : ""}>EN</span>
            </button>
          </div>
        </header>

        <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl animate-fade-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
