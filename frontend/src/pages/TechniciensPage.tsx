import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { techniciensApi } from "../api/endpoints";
import type { CreateTechnicienDto, TechnicienDto } from "../api/types";
import { Badge } from "../components/ui/Badge";
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

const emptyForm: CreateTechnicienDto = { name: "", email: "", phone: "", isActive: true };

export function TechniciensPage() {
  const { hasRole } = useAuth();
  const { t } = useI18n();
  const canManage = hasRole("Admin", "GestionnaireParc");
  const qc = useQueryClient();
  const { data: techniciens = [], isLoading } = useQuery({ queryKey: ["techniciens"], queryFn: techniciensApi.getAll });

  const [editing, setEditing] = useState<TechnicienDto | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateTechnicienDto>(emptyForm);

  const createMutation = useMutation({
    mutationFn: techniciensApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["techniciens"] });
      closeForm();
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: CreateTechnicienDto }) => techniciensApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["techniciens"] });
      closeForm();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: techniciensApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["techniciens"] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };
  const openEdit = (tech: TechnicienDto) => {
    setEditing(tech);
    setForm({ name: tech.name, email: tech.email, phone: tech.phone, isActive: tech.isActive });
    setShowForm(true);
  };
  const closeForm = () => setShowForm(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, dto: form });
    else createMutation.mutate(form);
  };

  const columns: Column<TechnicienDto>[] = [
    { header: t("techniciens.col.name"), render: (tc) => tc.name },
    { header: t("techniciens.col.email"), render: (tc) => tc.email ?? t("common.none") },
    { header: t("techniciens.col.phone"), render: (tc) => tc.phone ?? t("common.none") },
    {
      header: t("techniciens.col.statut"),
      render: (tc) => <Badge color={tc.isActive ? "green" : "slate"}>{tc.isActive ? t("common.active") : t("common.inactive")}</Badge>,
    },
  ];

  return (
    <div className="space-y-6" data-testid="techniciens-page">
      <PageHeader title={t("techniciens.title")} subtitle={t("techniciens.subtitle")}>
        <Button
          variant="secondary"
          data-testid="export-techniciens"
          onClick={() =>
            downloadCsv(
              "techniciens",
              [t("techniciens.col.name"), t("techniciens.col.email"), t("techniciens.col.phone"), t("techniciens.col.statut")],
              techniciens.map((tc) => [tc.name, tc.email ?? "", tc.phone ?? "", tc.isActive ? t("common.active") : t("common.inactive")])
            )
          }
        >
          <DownloadIcon /> {t("action.exportCsv")}
        </Button>
        {canManage && (
          <Button onClick={openCreate} data-testid="new-technicien-button">
            <PlusIcon /> {t("techniciens.new")}
          </Button>
        )}
      </PageHeader>

      <Table
        columns={columns}
        rows={techniciens}
        isLoading={isLoading}
        emptyMessage={t("techniciens.empty")}
        onRowClick={canManage ? openEdit : undefined}
        actions={
          canManage
            ? (tc) => (
                <div className="flex justify-end gap-1.5">
                  <Button variant="ghost" onClick={() => openEdit(tc)} aria-label={t("techniciens.edit")}>
                    <EditIcon />
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (confirm(t("common.confirmDelete", { name: tc.name }))) deleteMutation.mutate(tc.id);
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
        <Modal title={editing ? t("techniciens.edit") : t("techniciens.new")} onClose={closeForm}>
          <form onSubmit={onSubmit} className="space-y-4" data-testid="technicien-form">
            <FormField label={t("techniciens.f.name")}>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </FormField>
            <FormField label={t("techniciens.f.email")}>
              <Input type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </FormField>
            <FormField label={t("techniciens.f.phone")}>
              <Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </FormField>
            <label className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4 accent-brand cursor-pointer"
              />
              {t("techniciens.f.active")}
            </label>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="secondary" onClick={closeForm}>
                {t("action.cancel")}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="technicien-save-button">
                {t("action.save")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
