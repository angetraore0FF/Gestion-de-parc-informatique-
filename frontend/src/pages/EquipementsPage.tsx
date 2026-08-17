import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientsApi, equipementsApi, parcsApi } from "../api/endpoints";
import {
  EtatEquipement,
  EtatEquipementLabels,
  TypeEquipement,
  TypeEquipementLabels,
  type CreateEquipementDto,
  type EquipementDto,
} from "../api/types";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Select } from "../components/ui/Select";
import { Table, type Column } from "../components/ui/Table";
import { StatCard } from "../components/ui/StatCard";
import {
  AlertIcon,
  DesktopIcon,
  DownloadIcon,
  PlusIcon,
  SearchIcon,
  ShieldIcon,
  TrashIcon,
  WrenchIcon,
} from "../components/ui/Icons";
import { useAuth } from "../auth/AuthContext";

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

function etatBadge(etat: number) {
  if (etat === EtatEquipement.EnPanne) return <Badge color="red">{EtatEquipementLabels[etat]}</Badge>;
  if (etat === EtatEquipement.HorsService) return <Badge color="slate">{EtatEquipementLabels[etat]}</Badge>;
  return <Badge color="green">{EtatEquipementLabels[etat]}</Badge>;
}

function openPdf(url: string) {
  fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
    .then((r) => r.blob())
    .then((blob) => window.open(URL.createObjectURL(blob), "_blank"));
}

export function EquipementsPage() {
  const { hasRole, isClientOnly } = useAuth();
  const canManage = hasRole("Admin", "GestionnaireParc", "GestionnaireIntervention", "Technicien");
  const qc = useQueryClient();
  const { data: equipements = [], isLoading } = useQuery({
    queryKey: ["equipements"],
    queryFn: () => equipementsApi.getAll(),
  });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: clientsApi.getAll, enabled: !isClientOnly });
  const { data: parcs = [] } = useQuery({ queryKey: ["parcs"], queryFn: () => parcsApi.getAll() });

  const [editing, setEditing] = useState<EquipementDto | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateEquipementDto>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filtreEtat, setFiltreEtat] = useState<number | "">("");
  const [filtreType, setFiltreType] = useState<number | "">("");

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
      return [e.name, e.serialNumber, e.clientName, e.parcName, e.emplacement, e.adresseIp]
        .some((v) => v?.toLowerCase().includes(q));
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
    onError: (e: any) => setError(e?.response?.data?.message ?? "Erreur lors de l'enregistrement."),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: CreateEquipementDto }) => equipementsApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["equipements"] });
      closeForm();
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? "Erreur lors de l'enregistrement."),
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
    { header: "Nom", render: (e) => e.name },
    { header: "Type", render: (e) => TypeEquipementLabels[e.typeEquipement] },
    { header: "Client", render: (e) => e.clientName ?? "-" },
    { header: "État", render: (e) => etatBadge(e.etat) },
    { header: "Fin garantie", render: (e) => e.garantieFin ?? "-" },
    { header: "Parc", render: (e) => e.parcName ?? "-" },
    { header: "Emplacement", render: (e) => e.emplacement ?? "-" },
    {
      header: "Incidents",
      render: (e) =>
        e.incidentCount > 0 ? (
          <button
            type="button"
            onClick={(ev) => {
              ev.stopPropagation();
              openPdf(equipementsApi.rapportPannesUrl(e.id));
            }}
            className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded"
            aria-label={`${e.incidentCount} incident(s) — télécharger le rapport de ${e.name}`}
          >
            {e.incidentCount} <DownloadIcon className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="text-slate-400">0</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-lg font-semibold text-slate-800">Équipements</h1>
        {canManage && (
          <Button onClick={openCreate}>
            <PlusIcon /> Nouvel équipement
          </Button>
        )}
      </div>

      <section aria-label="Indicateurs du parc" className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Équipements" value={stats.total} icon={<DesktopIcon className="w-5 h-5" />} />
        <StatCard
          label="En panne"
          value={stats.enPanne}
          status="critical"
          icon={<AlertIcon className="w-5 h-5" />}
        />
        <StatCard
          label="Garantie < 30 jours"
          value={stats.garantieBientot}
          status="warning"
          icon={<ShieldIcon className="w-5 h-5" />}
        />
        <StatCard
          label="Incidents enregistrés"
          value={stats.incidents}
          status="serious"
          icon={<WrenchIcon className="w-5 h-5" />}
        />
      </section>

      <div className="flex flex-wrap items-end gap-3 bg-white border border-slate-200 rounded-lg p-3">
        <div className="flex-1 min-w-56">
          <label htmlFor="recherche-equipement" className="text-sm font-medium text-slate-700 block mb-1">
            Rechercher
          </label>
          <div className="relative">
            <SearchIcon className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              id="recherche-equipement"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom, n° de série, client, emplacement, IP…"
              className="w-full pl-8"
            />
          </div>
        </div>
        <div>
          <label htmlFor="filtre-etat" className="text-sm font-medium text-slate-700 block mb-1">
            État
          </label>
          <Select
            id="filtre-etat"
            value={filtreEtat}
            onChange={(e) => setFiltreEtat(e.target.value === "" ? "" : Number(e.target.value))}
          >
            <option value="">Tous</option>
            {Object.entries(EtatEquipementLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="filtre-type" className="text-sm font-medium text-slate-700 block mb-1">
            Type
          </label>
          <Select
            id="filtre-type"
            value={filtreType}
            onChange={(e) => setFiltreType(e.target.value === "" ? "" : Number(e.target.value))}
          >
            <option value="">Tous</option>
            {Object.entries(TypeEquipementLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </div>
        {filtresActifs && (
          <Button variant="ghost" onClick={resetFiltres}>
            Réinitialiser
          </Button>
        )}
      </div>

      <p className="text-sm text-slate-500" aria-live="polite">
        {equipementsFiltres.length} équipement{equipementsFiltres.length > 1 ? "s" : ""}
        {filtresActifs ? ` sur ${equipements.length}` : ""}
      </p>

      <Table
        columns={columns}
        rows={equipementsFiltres}
        isLoading={isLoading}
        emptyMessage={
          filtresActifs
            ? "Aucun équipement ne correspond à ces critères. Essayez d'élargir la recherche ou de réinitialiser les filtres."
            : "Aucun équipement pour le moment."
        }
        onRowClick={canManage ? openEdit : undefined}
        actions={
          canManage
            ? (e) => (
                <Button
                  variant="danger"
                  onClick={() => {
                    if (confirm(`Supprimer ${e.name} ?`)) deleteMutation.mutate(e.id);
                  }}
                >
                  <TrashIcon /> Suppr.
                </Button>
              )
            : undefined
        }
      />

      {showForm && (
        <Modal title={editing ? "Modifier l'équipement" : "Nouvel équipement"} onClose={closeForm}>
          <form onSubmit={onSubmit} className="space-y-3">
            <FormField label="Nom">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Type">
                <Select
                  value={form.typeEquipement}
                  onChange={(e) => setForm({ ...form, typeEquipement: Number(e.target.value) })}
                >
                  {Object.entries(TypeEquipementLabels).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="État">
                <Select value={form.etat} onChange={(e) => setForm({ ...form, etat: Number(e.target.value) })}>
                  {Object.entries(EtatEquipementLabels).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Client">
                <Select
                  value={form.clientId ?? ""}
                  onChange={(e) => setForm({ ...form, clientId: e.target.value ? Number(e.target.value) : null })}
                >
                  <option value="">-</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Parc">
                <Select
                  value={form.parcId ?? ""}
                  onChange={(e) => setForm({ ...form, parcId: e.target.value ? Number(e.target.value) : null })}
                >
                  <option value="">-</option>
                  {parcs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
            <FormField label="Numéro de série">
              <Input
                value={form.serialNumber ?? ""}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Adresse MAC">
                <Input
                  placeholder="00:1B:44:11:3A:B7"
                  value={form.adresseMac ?? ""}
                  onChange={(e) => setForm({ ...form, adresseMac: e.target.value })}
                />
              </FormField>
              <FormField label="Adresse IP">
                <Input
                  placeholder="192.168.1.42"
                  value={form.adresseIp ?? ""}
                  onChange={(e) => setForm({ ...form, adresseIp: e.target.value })}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Système d'exploitation" hint="Laisser vide si non applicable">
                <Input
                  value={form.systemeExploitation ?? ""}
                  onChange={(e) => setForm({ ...form, systemeExploitation: e.target.value })}
                />
              </FormField>
              <FormField label="Emplacement">
                <Input
                  placeholder="Site - Bureau"
                  value={form.emplacement ?? ""}
                  onChange={(e) => setForm({ ...form, emplacement: e.target.value })}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Date d'acquisition">
                <Input
                  type="date"
                  value={form.dateAcquisition ?? ""}
                  onChange={(e) => setForm({ ...form, dateAcquisition: e.target.value || null })}
                />
              </FormField>
              <FormField label="Fin de garantie">
                <Input
                  type="date"
                  value={form.garantieFin ?? ""}
                  onChange={(e) => setForm({ ...form, garantieFin: e.target.value || null })}
                />
              </FormField>
            </div>
            {error && (
              <div role="alert" className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                <AlertIcon className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={closeForm}>
                Annuler
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                Enregistrer
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
