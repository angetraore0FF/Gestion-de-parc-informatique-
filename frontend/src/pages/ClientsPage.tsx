import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientsApi } from "../api/endpoints";
import type { ClientDto, CreateClientDto } from "../api/types";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Table, type Column } from "../components/ui/Table";
import { PlusIcon, TrashIcon } from "../components/ui/Icons";
import { useAuth } from "../auth/AuthContext";

const emptyForm: CreateClientDto = { name: "", email: "", phone: "", address: "", isParcClient: true };

export function ClientsPage() {
  const { hasRole } = useAuth();
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
    { header: "Nom", render: (c) => c.name },
    { header: "Email", render: (c) => c.email ?? "-" },
    { header: "Téléphone", render: (c) => c.phone ?? "-" },
    { header: "Parcs", render: (c) => c.parcCount },
    { header: "Équipements", render: (c) => c.equipementCount },
    { header: "Contrats", render: (c) => c.contratCount },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-lg font-semibold text-slate-800">Clients</h1>
        {canManage && (
          <Button onClick={openCreate}>
            <PlusIcon /> Nouveau client
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        rows={clients}
        isLoading={isLoading}
        emptyMessage="Aucun client pour le moment. Créez-en un pour commencer."
        onRowClick={canManage ? openEdit : undefined}
        actions={
          canManage
            ? (c) => (
                <Button
                  variant="danger"
                  onClick={() => {
                    if (confirm(`Supprimer ${c.name} ?`)) deleteMutation.mutate(c.id);
                  }}
                >
                  <TrashIcon /> Suppr.
                </Button>
              )
            : undefined
        }
      />

      {showForm && (
        <Modal title={editing ? "Modifier le client" : "Nouveau client"} onClose={closeForm}>
          <form onSubmit={onSubmit} className="space-y-3">
            <FormField label="Nom">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </FormField>
            <FormField label="Email">
              <Input
                type="email"
                value={form.email ?? ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </FormField>
            <FormField label="Téléphone">
              <Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </FormField>
            <FormField label="Adresse">
              <Input value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </FormField>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.isParcClient}
                onChange={(e) => setForm({ ...form, isParcClient: e.target.checked })}
                className="w-4 h-4 accent-[var(--color-primary)] cursor-pointer"
              />
              Client du parc informatique
            </label>
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
