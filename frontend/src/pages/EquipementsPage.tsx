import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientsApi, equipementsApi, parcsApi } from "../api/endpoints";
import { EtatEquipement, TypeEquipement, type CreateEquipementDto, type EquipementDto } from "../api/types";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import { Select } from "../components/ui/Select";
import { Table, type Column } from "../components/ui/Table";
import { StatCard } from "../components/ui/StatCard";
import { AlertIcon, DesktopIcon, DownloadIcon, EditIcon, PlusIcon, SearchIcon, ShieldIcon, TrashIcon, WrenchIcon } from "../components/ui/Icons";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";

const emptyForm: CreateEquipementDto = {
  name: "",
  serialNumber: "",
  purchaseDate: null,
  dateAcquisition: null,
  garantieFin: null,
  etat: EtatEquipement.EnService,
  typeEquipement: TypeEquipement.Ordinateur,
  reference: "",
  adresseMac: "",
  adresseIp: "",
  systemeExploitation: "",
  emplacement: "",
  clientId: null,
  parcId: null,
};

function openPdf(url: string) {
  fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
    .then((r) => r.blob())
    .then((blob) => window.open(URL.createObjectURL(blob), "_blank"));
}

export function EquipementsPage() {
  const { hasRole, isClientOnly } = useAuth();
  const { t, el, elEntries } = useI18n();
  const canManage = hasRole("Admin", "GestionnaireParc", "GestionnaireIntervention", "Technicien");
  const qc = useQueryClient();
  const { data: equipements = [], isLoading } = useQuery({ queryKey: ["equipements"], queryFn: () => equipementsApi.getAll() });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: clientsApi.getAll, enabled: !isClientOnly });
  const { data: parcs = [] } = useQuery({ queryKey: ["parcs"], queryFn: () => parcsApi.getAll() });

  const [editing, setEditing] = useState<EquipementDto | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateEquipementDto>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filtreEtat, setFiltreEtat] = useState<number | "">("");
  const [filtreType, setFiltreType] = useState<number | "">("");

  const etatBadge = (etat: number) => {
    if (etat === EtatEquipement.EnPanne) return <Badge color="red">{el("etat", etat)}</Badge>;
    if (etat === EtatEquipement.HorsService) return <Badge color="slate">{el("etat", etat)}</Badge>;
    return <Badge color="green">{el("etat", etat)}</Badge>;
  };

  const stats = useMemo(() => {
    const today = new Date();
    const dans30j = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return {
      total: equipements.length,
      enPanne: equipements.filter((e) => e.etat === EtatEquipement.EnPanne).length,
      garantieBientot: equipements.filter(
        (e) => e.garantieFin && new Date(e.garantieFin) >= today && new Date(e.garantieFin) <= dans30j
      ).length,
      incidents: equipements.reduce((sum, e) => sum + e.incidentCount, 0),
    };
  }, [equipements]);

  const equipementsFiltres = useMemo(() => {
    const q = search.trim().toLowerCase();
    return equipements.filter((e) => {
      if (filtreEtat !== "" && e.etat !== filtreEtat) return false;
      if (filtreType !== "" && e.typeEquipement !== filtreType) return false;
      if (!q) return true;
      return [e.name, e.serialNumber, e.clientName, e.parcName, e.emplacement, e.adresseIp].some((v) =>
        v?.toLowerCase().includes(q)
      );
    });
  }, [equipements, search, filtreEtat, filtreType]);

  const filtresActifs = search.trim() !== "" || filtreEtat !== "" || filtreType !== "";
  const resetFiltres = () => {
    setSearch("");
    setFiltreEtat("");
    setFiltreType("");
  };

  const createMutation = useMutation({
    mutationFn: equipementsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["equipements"] });
      closeForm();
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? t("equipements.error")),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: CreateEquipementDto }) => equipementsApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["equipements"] });
      closeForm();
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? t("equipements.error")),
  });
  const deleteMutation = useMutation({
    mutationFn: equipementsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["equipements"] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  };
  const openEdit = (eq: EquipementDto) => {
    setEditing(eq);
    setForm({
      name: eq.name,
      serialNumber: eq.serialNumber,
      purchaseDate: eq.purchaseDate,
      dateAcquisition: eq.dateAcquisition,
      garantieFin: eq.garantieFin,
      etat: eq.etat,
      typeEquipement: eq.typeEquipement,
      reference: eq.reference,
      adresseMac: eq.adresseMac,
      adresseIp: eq.adresseIp,
      systemeExploitation: eq.systemeExploitation,
      emplacement: eq.emplacement,
      clientId: eq.clientId,
      parcId: eq.parcId,
    });
    setError(null);
    setShowForm(true);
  };
  const closeForm = () => setShowForm(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, dto: form });
    else createMutation.mutate(form);
  };

  const columns: Column<EquipementDto>[] = [
    { header: t("equipements.col.name"), render: (e) => e.name },
    { header: t("equipements.col.type"), render: (e) => el("type", e.typeEquipement) },
    { header: t("equipements.col.client"), render: (e) => e.clientName ?? t("common.none") },
    { header: t("equipements.col.etat"), render: (e) => etatBadge(e.etat) },
    { header: t("equipements.col.garantie"), render: (e) => e.garantieFin ?? t("common.none") },
    { header: t("equipements.col.parc"), render: (e) => e.parcName ?? t("common.none") },
    { header: t("equipements.col.emplacement"), render: (e) => e.emplacement ?? t("common.none") },
    {
      header: t("equipements.col.incidents"),
      render: (e) =>
        e.incidentCount > 0 ? (
          <button
            type="button"
            onClick={(ev) => {
              ev.stopPropagation();
              openPdf(equipementsApi.rapportPannesUrl(e.id));
            }}
            className="inline-flex items-center gap-1 rounded font-semibold text-brand hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label={`${e.incidentCount} — ${e.name}`}
          >
            {e.incidentCount} <DownloadIcon className="h-3.5 w-3.5" />
          </button>
        ) : (
          <span className="text-slate-400">0</span>
        ),
    },
  ];

  return (
    <div className="space-y-6" data-testid="equipements-page">
      <PageHeader title={t("equipements.title")} subtitle={t("equipements.subtitle")}>
        {canManage && (
          <Button onClick={openCreate} data-testid="new-equipement-button">
            <PlusIcon /> {t("equipements.new")}
          </Button>
        )}
      </PageHeader>

      <section aria-label={t("equipements.title")} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("equipements.stat.total")} value={stats.total} icon={<DesktopIcon className="h-5 w-5" />} />
        <StatCard label={t("equipements.stat.enPanne")} value={stats.enPanne} status="critical" icon={<AlertIcon className="h-5 w-5" />} />
        <StatCard label={t("equipements.stat.garantie")} value={stats.garantieBientot} status="warning" icon={<ShieldIcon className="h-5 w-5" />} />
        <StatCard label={t("equipements.stat.incidents")} value={stats.incidents} status="serious" icon={<WrenchIcon className="h-5 w-5" />} />
      </section>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200/80 bg-white p-4">
        <div className="min-w-56 flex-1">
          <label htmlFor="recherche-equipement" className="mb-1.5 block text-[13px] font-semibold text-slate-700">
            {t("action.search")}
          </label>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="recherche-equipement"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("equipements.searchPlaceholder")}
              className="pl-9"
              data-testid="equipement-search"
            />
          </div>
        </div>
        <div className="w-40">
          <label htmlFor="filtre-etat" className="mb-1.5 block text-[13px] font-semibold text-slate-700">
            {t("equipements.filterEtat")}
          </label>
          <Select id="filtre-etat" value={filtreEtat} onChange={(e) => setFiltreEtat(e.target.value === "" ? "" : Number(e.target.value))}>
            <option value="">{t("common.all")}</option>
            {elEntries("etat").map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-44">
          <label htmlFor="filtre-type" className="mb-1.5 block text-[13px] font-semibold text-slate-700">
            {t("equipements.filterType")}
          </label>
          <Select id="filtre-type" value={filtreType} onChange={(e) => setFiltreType(e.target.value === "" ? "" : Number(e.target.value))}>
            <option value="">{t("common.all")}</option>
            {elEntries("type").map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </div>
        {filtresActifs && (
          <Button variant="ghost" onClick={resetFiltres}>
            {t("action.reset")}
          </Button>
        )}
      </div>

      <p className="text-sm text-slate-500" aria-live="polite">
        {equipementsFiltres.length > 1
          ? t("equipements.countPlural", { n: equipementsFiltres.length })
          : t("equipements.countSingular", { n: equipementsFiltres.length })}
        {filtresActifs ? ` ${t("equipements.countOf", { total: equipements.length })}` : ""}
      </p>

      <Table
        columns={columns}
        rows={equipementsFiltres}
        isLoading={isLoading}
        emptyMessage={filtresActifs ? t("equipements.emptyFiltered") : t("equipements.empty")}
        onRowClick={canManage ? openEdit : undefined}
        actions={
          canManage
            ? (e) => (
                <div className="flex justify-end gap-1.5">
                  <Button variant="ghost" onClick={() => openEdit(e)} aria-label={t("equipements.edit")}>
                    <EditIcon />
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (confirm(t("common.confirmDelete", { name: e.name }))) deleteMutation.mutate(e.id);
                    }}
                  >
                    <TrashIcon /> {t("action.delete")}
                  </Button>
                </div>
              )
            : undefined
        }
      />

      {showForm && (
        <Modal title={editing ? t("equipements.edit") : t("equipements.new")} onClose={closeForm}>
          <form onSubmit={onSubmit} className="space-y-4" data-testid="equipement-form">
            <FormField label={t("equipements.f.name")}>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label={t("equipements.f.type")}>
                <Select value={form.typeEquipement} onChange={(e) => setForm({ ...form, typeEquipement: Number(e.target.value) })}>
                  {elEntries("type").map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label={t("equipements.f.etat")}>
                <Select value={form.etat} onChange={(e) => setForm({ ...form, etat: Number(e.target.value) })}>
                  {elEntries("etat").map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label={t("equipements.f.client")}>
                <Select value={form.clientId ?? ""} onChange={(e) => setForm({ ...form, clientId: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">{t("common.none")}</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label={t("equipements.f.parc")}>
                <Select value={form.parcId ?? ""} onChange={(e) => setForm({ ...form, parcId: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">{t("common.none")}</option>
                  {parcs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
            <FormField label={t("equipements.f.serial")}>
              <Input value={form.serialNumber ?? ""} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label={t("equipements.f.mac")}>
                <Input placeholder="00:1B:44:11:3A:B7" value={form.adresseMac ?? ""} onChange={(e) => setForm({ ...form, adresseMac: e.target.value })} />
              </FormField>
              <FormField label={t("equipements.f.ip")}>
                <Input placeholder="192.168.1.42" value={form.adresseIp ?? ""} onChange={(e) => setForm({ ...form, adresseIp: e.target.value })} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label={t("equipements.f.os")} hint={t("equipements.f.osHint")}>
                <Input value={form.systemeExploitation ?? ""} onChange={(e) => setForm({ ...form, systemeExploitation: e.target.value })} />
              </FormField>
              <FormField label={t("equipements.f.emplacement")}>
                <Input placeholder={t("equipements.f.empPlaceholder")} value={form.emplacement ?? ""} onChange={(e) => setForm({ ...form, emplacement: e.target.value })} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label={t("equipements.f.dateAcq")}>
                <Input type="date" value={form.dateAcquisition ?? ""} onChange={(e) => setForm({ ...form, dateAcquisition: e.target.value || null })} />
              </FormField>
              <FormField label={t("equipements.f.garantie")}>
                <Input type="date" value={form.garantieFin ?? ""} onChange={(e) => setForm({ ...form, garantieFin: e.target.value || null })} />
              </FormField>
            </div>
            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="secondary" onClick={closeForm}>
                {t("action.cancel")}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="equipement-save-button">
                {t("action.save")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
