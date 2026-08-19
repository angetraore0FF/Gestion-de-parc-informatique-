import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientsApi, parcsApi } from "../api/endpoints";
import type { CreateParcDto, ParcDto } from "../api/types";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import { Select } from "../components/ui/Select";
import { Table, type Column } from "../components/ui/Table";
import { EditIcon, PlusIcon, TrashIcon } from "../components/ui/Icons";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";

export function ParcsPage() {
  const { hasRole } = useAuth();
  const { t } = useI18n();
  const canManage = hasRole("Admin", "GestionnaireParc");
  const qc = useQueryClient();
  const { data: parcs = [], isLoading } = useQuery({ queryKey: ["parcs"], queryFn: () => parcsApi.getAll() });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: clientsApi.getAll, enabled: canManage });

  const [editing, setEditing] = useState<ParcDto | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateParcDto>({ name: "", description: "", clientId: 0 });

  const createMutation = useMutation({
    mutationFn: parcsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["parcs"] });
      closeForm();
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: CreateParcDto }) => parcsApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["parcs"] });
      closeForm();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: parcsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["parcs"] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", clientId: clients[0]?.id ?? 0 });
    setShowForm(true);
  };
  const openEdit = (parc: ParcDto) => {
    setEditing(parc);
    setForm({ name: parc.name, description: parc.description, clientId: parc.clientId });
    setShowForm(true);
  };
  const closeForm = () => setShowForm(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, dto: form });
    else createMutation.mutate(form);
  };

  const columns: Column<ParcDto>[] = [
    { header: t("parcs.col.name"), render: (p) => p.name },
    { header: t("parcs.col.client"), render: (p) => p.clientName },
    { header: t("parcs.col.description"), render: (p) => p.description ?? t("common.none") },
    { header: t("parcs.col.equipements"), render: (p) => p.equipementCount },
  ];

  return (
    <div className="space-y-6" data-testid="parcs-page">
      <PageHeader title={t("parcs.title")} subtitle={t("parcs.subtitle")}>
        {canManage && (
          <Button onClick={openCreate} data-testid="new-parc-button">
            <PlusIcon /> {t("parcs.new")}
          </Button>
        )}
      </PageHeader>

      <Table
        columns={columns}
        rows={parcs}
        isLoading={isLoading}
        emptyMessage={t("parcs.empty")}
        onRowClick={canManage ? openEdit : undefined}
        actions={
          canManage
            ? (p) => (
                <div className="flex justify-end gap-1.5">
                  <Button variant="ghost" onClick={() => openEdit(p)} aria-label={t("parcs.edit")}>
                    <EditIcon />
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (confirm(t("common.confirmDelete", { name: p.name }))) deleteMutation.mutate(p.id);
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
        <Modal title={editing ? t("parcs.edit") : t("parcs.new")} onClose={closeForm}>
          <form onSubmit={onSubmit} className="space-y-4" data-testid="parc-form">
            <FormField label={t("parcs.f.name")}>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </FormField>
            <FormField label={t("parcs.f.client")}>
              <Select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: Number(e.target.value) })} required>
                <option value={0} disabled>
                  {t("parcs.f.selectClient")}
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label={t("parcs.f.description")}>
              <Input value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </FormField>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="secondary" onClick={closeForm}>
                {t("action.cancel")}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="parc-save-button">
                {t("action.save")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
