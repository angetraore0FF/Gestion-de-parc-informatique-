import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientsApi } from "../api/endpoints";
import type { ClientDto, CreateClientDto } from "../api/types";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import { Table, type Column } from "../components/ui/Table";
import { DownloadIcon, EditIcon, PlusIcon, TrashIcon } from "../components/ui/Icons";
import { downloadCsv } from "../lib/csv";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";

const emptyForm: CreateClientDto = { name: "", email: "", phone: "", address: "", isParcClient: true };

export function ClientsPage() {
  const { hasRole } = useAuth();
  const { t } = useI18n();
  const canManage = hasRole("Admin", "GestionnaireParc");
  const qc = useQueryClient();
  const { data: clients = [], isLoading } = useQuery({ queryKey: ["clients"], queryFn: clientsApi.getAll });

  const [editing, setEditing] = useState<ClientDto | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateClientDto>(emptyForm);

  const createMutation = useMutation({
    mutationFn: clientsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      closeForm();
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: CreateClientDto }) => clientsApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      closeForm();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: clientsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };
  const openEdit = (client: ClientDto) => {
    setEditing(client);
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      isParcClient: client.isParcClient,
    });
    setShowForm(true);
  };
  const closeForm = () => setShowForm(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, dto: form });
    else createMutation.mutate(form);
  };

  const columns: Column<ClientDto>[] = [
    { header: t("clients.col.name"), render: (c) => c.name },
    { header: t("clients.col.email"), render: (c) => c.email ?? t("common.none") },
    { header: t("clients.col.phone"), render: (c) => c.phone ?? t("common.none") },
    { header: t("clients.col.parcs"), render: (c) => c.parcCount },
    { header: t("clients.col.equipements"), render: (c) => c.equipementCount },
    { header: t("clients.col.contrats"), render: (c) => c.contratCount },
  ];

  return (
    <div className="space-y-6" data-testid="clients-page">
      <PageHeader title={t("clients.title")} subtitle={t("clients.subtitle")}>
        <Button
          variant="secondary"
          data-testid="export-clients"
          onClick={() =>
            downloadCsv(
              "clients",
              [t("clients.col.name"), t("clients.col.email"), t("clients.col.phone"), t("clients.col.parcs"), t("clients.col.equipements"), t("clients.col.contrats")],
              clients.map((c) => [c.name, c.email ?? "", c.phone ?? "", c.parcCount, c.equipementCount, c.contratCount])
            )
          }
        >
          <DownloadIcon /> {t("action.exportCsv")}
        </Button>
        {canManage && (
          <Button onClick={openCreate} data-testid="new-client-button">
            <PlusIcon /> {t("clients.new")}
          </Button>
        )}
      </PageHeader>

      <Table
        columns={columns}
        rows={clients}
        isLoading={isLoading}
        emptyMessage={t("clients.empty")}
        onRowClick={canManage ? openEdit : undefined}
        actions={
          canManage
            ? (c) => (
                <div className="flex justify-end gap-1.5">
                  <Button variant="ghost" onClick={() => openEdit(c)} aria-label={t("clients.edit")}>
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
                </div>
              )
            : undefined
        }
      />

      {showForm && (
        <Modal title={editing ? t("clients.edit") : t("clients.new")} onClose={closeForm}>
          <form onSubmit={onSubmit} className="space-y-4" data-testid="client-form">
            <FormField label={t("clients.f.name")}>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </FormField>
            <FormField label={t("clients.f.email")}>
              <Input type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </FormField>
            <FormField label={t("clients.f.phone")}>
              <Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </FormField>
            <FormField label={t("clients.f.address")}>
              <Input value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </FormField>
            <label className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
              <input
                type="checkbox"
                checked={form.isParcClient}
                onChange={(e) => setForm({ ...form, isParcClient: e.target.checked })}
                className="h-4 w-4 accent-brand cursor-pointer"
              />
              {t("clients.f.isParc")}
            </label>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="secondary" onClick={closeForm}>
                {t("action.cancel")}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="client-save-button">
                {t("action.save")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
