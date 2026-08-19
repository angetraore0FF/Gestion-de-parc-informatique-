import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { clientsApi, equipementsApi, interventionsApi } from "../../api/endpoints";
import { useI18n } from "../../i18n/I18nContext";
import { DesktopIcon, SearchIcon, UsersIcon, WrenchIcon } from "./Icons";

interface Result {
  id: string;
  label: string;
  sub: string;
  to: string;
  group: "clients" | "equipements" | "interventions";
}

export function GlobalSearch() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: clientsApi.getAll });
  const { data: equipements = [] } = useQuery({ queryKey: ["equipements"], queryFn: () => equipementsApi.getAll() });
  const { data: interventions = [] } = useQuery({ queryKey: ["interventions"], queryFn: () => interventionsApi.getAll() });

  const results = useMemo<Result[]>(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    const out: Result[] = [];
    for (const c of clients) {
      if ([c.name, c.email, c.phone].some((v) => v?.toLowerCase().includes(s))) {
        out.push({ id: `c${c.id}`, label: c.name, sub: c.email ?? "", to: "/clients", group: "clients" });
      }
      if (out.filter((r) => r.group === "clients").length >= 5) break;
    }
    for (const e of equipements) {
      if ([e.name, e.serialNumber, e.clientName, e.adresseIp, e.emplacement].some((v) => v?.toLowerCase().includes(s))) {
        out.push({ id: `e${e.id}`, label: e.name, sub: e.clientName ?? "", to: "/equipements", group: "equipements" });
      }
      if (out.filter((r) => r.group === "equipements").length >= 5) break;
    }
    for (const i of interventions) {
      if ([i.name, i.clientName, i.equipementName].some((v) => v?.toLowerCase().includes(s))) {
        out.push({ id: `i${i.id}`, label: i.name, sub: `${i.clientName} · ${i.equipementName}`, to: "/interventions", group: "interventions" });
      }
      if (out.filter((r) => r.group === "interventions").length >= 5) break;
    }
    return out;
  }, [q, clients, equipements, interventions]);

  const go = (r: Result) => {
    navigate(r.to);
    setQ("");
    setOpen(false);
  };

  const groupIcon = (g: Result["group"]) =>
    g === "clients" ? <UsersIcon className="h-4 w-4" /> : g === "equipements" ? <DesktopIcon className="h-4 w-4" /> : <WrenchIcon className="h-4 w-4" />;

  const grouped: Array<[Result["group"], Result[]]> = [
    ["clients", results.filter((r) => r.group === "clients")],
    ["equipements", results.filter((r) => r.group === "equipements")],
    ["interventions", results.filter((r) => r.group === "interventions")],
  ];

  const flat = results;

  return (
    <div className="relative hidden md:block md:w-72 lg:w-96">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={q}
        placeholder={t("search.placeholder")}
        aria-label={t("search.hint")}
        data-testid="global-search-input"
        className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, flat.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
          else if (e.key === "Enter" && flat[active]) { go(flat[active]); }
          else if (e.key === "Escape") { setOpen(false); }
        }}
      />

      {open && q.trim() !== "" && (
        <div
          className="absolute left-0 right-0 top-11 z-40 max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-brand-darker/10 dark:border-slate-700 dark:bg-slate-900"
          onMouseDown={() => blurTimer.current && clearTimeout(blurTimer.current)}
          data-testid="global-search-results"
        >
          {flat.length === 0 ? (
            <div className="px-3 py-4 text-sm text-slate-400 dark:text-slate-500">
              {t("search.noResults")} « {q} »
            </div>
          ) : (
            grouped.map(([g, items]) =>
              items.length === 0 ? null : (
                <div key={g} className="mb-1">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {t(`search.groups.${g}`)}
                  </div>
                  {items.map((r) => {
                    const idx = flat.indexOf(r);
                    return (
                      <button
                        key={r.id}
                        onClick={() => go(r)}
                        onMouseEnter={() => setActive(idx)}
                        className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors ${
                          idx === active ? "bg-brand-light dark:bg-slate-800" : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand dark:bg-slate-800 dark:text-lime">
                          {groupIcon(g)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">{r.label}</span>
                          {r.sub && <span className="block truncate text-xs text-slate-400 dark:text-slate-500">{r.sub}</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )
            )
          )}
        </div>
      )}
    </div>
  );
}
