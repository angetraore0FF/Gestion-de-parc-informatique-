import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientsApi, contratsApi, equipementsApi } from "../api/endpoints";
import { RecurrenceContrat, StatutContrat, type ContratDto, type CreateContratDto } from "../api/types";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import { Select } from "../components/ui/Select";
import { Table, type Column } from "../components/ui/Table";
import { DownloadIcon, EditIcon, InvoiceIcon, PlusIcon, PrinterIcon, TrashIcon } from "../components/ui/Icons";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { usePrint } from "../components/ui/PrintReport";

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm: CreateContratDto = {
  clientId: 0,
  dateDebut: today(),
  dateFin: today(),
  statut: StatutContrat.Brouillon,
  montant: 0,
  recurrence: RecurrenceContrat.Mois,
  prochaineFacture: today(),
  equipementIds: [],
};

export function ContratsPage() {
  const { hasRole } = useAuth();
  const { t, el, elEntries } = useI18n();
  const { printReport } = usePrint();
  const canManage = hasRole("Admin", "GestionnaireParc");
  const qc = useQueryClient();
  const { data: contrats = [], isLoading } = useQuery({ queryKey: ["contrats"], queryFn: () => contratsApi.getAll() });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: clientsApi.getAll, enabled: canManage });
  const { data: equipements = [] } = useQuery({ queryKey: ["equipements"], queryFn: () => equipementsApi.getAll(), enabled: canManage });

  const [editing, setEditing] = useState<ContratDto | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateContratDto>(emptyForm);

  const statutBadge = (statut: number) => {
    if (statut === StatutContrat.Actif) return <Badge color="green">{el("statutContrat", statut)}</Badge>;
    if (statut === StatutContrat.Termine) return <Badge color="slate">{el("statutContrat", statut)}</Badge>;
    return <Badge color="amber">{el("statutContrat", statut)}</Badge>;
  };

  const createMutation = useMutation({
    mutationFn: contratsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contrats"] });
      closeForm();
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: CreateContratDto }) =>
      contratsApi.update(id, { ...dto, prochaineFacture: dto.prochaineFacture ?? today() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contrats"] });
      closeForm();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: contratsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contrats"] }),
  });
  const genererFacturesMutation = useMutation({
    mutationFn: contratsApi.genererFactures,
    onSuccess: (r) => {
      alert(t("contrats.generated", { n: r.facturesGenerees }));
      qc.invalidateQueries({ queryKey: ["contrats"] });
      qc.invalidateQueries({ queryKey: ["factures-recurrentes"] });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, clientId: clients[0]?.id ?? 0 });
    setShowForm(true);
  };
  const openEdit = (contrat: ContratDto) => {
    setEditing(contrat);
    setForm({
      clientId: contrat.clientId,
      dateDebut: contrat.dateDebut,
      dateFin: contrat.dateFin,
      statut: contrat.statut,
      montant: contrat.montant,
      recurrence: contrat.recurrence,
      prochaineFacture: contrat.prochaineFacture,
      equipementIds: contrat.equipementIds,
    });
    setShowForm(true);
  };
  const closeForm = () => setShowForm(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, dto: form });
    else createMutation.mutate(form);
  };

  const toggleEquipement = (id: number) => {
    const ids = form.equipementIds ?? [];
    setForm({ ...form, equipementIds: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id] });
  };

  const downloadPdf = (c: ContratDto) => {
    fetch(contratsApi.pdfUrl(c.id), { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      .then((r) => r.blob())
      .then((blob) => window.open(URL.createObjectURL(blob), "_blank"));
  };

  const printContrat = (c: ContratDto) => {
    printReport({
      title: t("report.contratTitle"),
      reference: c.name,
      meta: [
        { label: t("contrats.col.client"), value: c.clientName },
        { label: t("contrats.col.statut"), value: el("statutContrat", c.statut) },
      ],
      sections: [
        {
          heading: t("report.report"),
          fields: [
            { label: t("contrats.f.dateDebut"), value: c.dateDebut },
            { label: t("contrats.f.dateFin"), value: c.dateFin },
            { label: t("contrats.col.montant"), value: `${c.montant.toFixed(2)} €` },
            { label: t("contrats.f.recurrence"), value: el("recurrence", c.recurrence) },
            { label: t("contrats.f.prochaine"), value: c.prochaineFacture },
          ],
        },
        {
          heading: t("contrats.f.equipements"),
          items: (c.equipementIds ?? []).map((id) => equipements.find((e) => e.id === id)?.name ?? `#${id}`),
        },
      ],
    });
  };

  const columns: Column<ContratDto>[] = [
    { header: t("contrats.col.ref"), render: (c) => c.name },
    { header: t("contrats.col.client"), render: (c) => c.clientName },
    { header: t("contrats.col.periode"), render: (c) => `${c.dateDebut} → ${c.dateFin}` },
    { header: t("contrats.col.statut"), render: (c) => statutBadge(c.statut) },
    { header: t("contrats.col.montant"), render: (c) => `${c.montant.toFixed(2)} €` },
    { header: t("contrats.col.recurrence"), render: (c) => el("recurrence", c.recurrence) },
  ];

  return (
    <div className="space-y-6" data-testid="contrats-page">
      <PageHeader title={t("contrats.title")} subtitle={t("contrats.subtitle")}>
        {canManage && (
          <>
            <Button variant="secondary" onClick={() => genererFacturesMutation.mutate()} data-testid="generer-factures-button">
              <InvoiceIcon /> {t("contrats.generer")}
            </Button>
            <Button onClick={openCreate} data-testid="new-contrat-button">
              <PlusIcon /> {t("contrats.new")}
            </Button>
          </>
        )}
      </PageHeader>

      <Table
        columns={columns}
        rows={contrats}
        isLoading={isLoading}
        emptyMessage={t("contrats.empty")}
        onRowClick={canManage ? openEdit : undefined}
        actions={(c) => (
          <div className="flex justify-end gap-1.5">
            <Button variant="ghost" onClick={() => printContrat(c)} aria-label={`${t("report.print")} — ${c.name}`}>
              <PrinterIcon /> {t("report.print")}
            </Button>
            <Button variant="ghost" onClick={() => downloadPdf(c)} aria-label={`${t("action.pdf")} — ${c.name}`}>
              <DownloadIcon /> {t("action.pdf")}
            </Button>
            {canManage && (
              <>
                <Button variant="ghost" onClick={() => openEdit(c)} aria-label={t("contrats.edit")}>
                  <EditIcon />
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    if (confirm(t("common.confirmDelete", { name: c.name }))) deleteMutation.mutate(c.id);
                  }}
                >
                  <TrashIcon /> {t("action.delete")}
                </Button>
              </>
            )}
          </div>
        )}
      />

      {showForm && (
        <Modal title={editing ? t("contrats.edit") : t("contrats.new")} onClose={closeForm}>
          <form onSubmit={onSubmit} className="space-y-4" data-testid="contrat-form">
            <FormField label={t("contrats.f.client")}>
              <Select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: Number(e.target.value) })} required>
                <option value={0} disabled>
                  {t("contrats.f.selectClient")}
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label={t("contrats.f.dateDebut")}>
                <Input type="date" value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} required />
              </FormField>
              <FormField label={t("contrats.f.dateFin")}>
                <Input type="date" value={form.dateFin} onChange={(e) => setForm({ ...form, dateFin: e.target.value })} required />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label={t("contrats.f.statut")}>
                <Select value={form.statut} onChange={(e) => setForm({ ...form, statut: Number(e.target.value) })}>
                  {elEntries("statutContrat").map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label={t("contrats.f.recurrence")}>
                <Select value={form.recurrence} onChange={(e) => setForm({ ...form, recurrence: Number(e.target.value) })}>
                  {elEntries("recurrence").map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label={t("contrats.f.montant")}>
                <Input type="number" step="0.01" value={form.montant} onChange={(e) => setForm({ ...form, montant: Number(e.target.value) })} required />
              </FormField>
              <FormField label={t("contrats.f.prochaine")}>
                <Input type="date" value={form.prochaineFacture ?? ""} onChange={(e) => setForm({ ...form, prochaineFacture: e.target.value })} />
              </FormField>
            </div>
            <fieldset className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <legend className="px-1 text-[13px] font-semibold text-slate-700 dark:text-slate-300">{t("contrats.f.equipements")}</legend>
              <div className="max-h-36 space-y-1 overflow-y-auto">
                {equipements.map((eq) => (
                  <label key={eq.id} className="flex items-center gap-2 rounded-md px-1 py-1 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
                    <input
                      type="checkbox"
                      checked={form.equipementIds?.includes(eq.id) ?? false}
                      onChange={() => toggleEquipement(eq.id)}
                      className="h-4 w-4 accent-brand cursor-pointer"
                    />
                    {eq.name}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="secondary" onClick={closeForm}>
                {t("action.cancel")}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="contrat-save-button">
                {t("action.save")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
