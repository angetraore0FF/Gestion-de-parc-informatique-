import { api } from "./client";
import type {
  AuthResponseDto,
  ClientDto,
  ContratDto,
  CreateClientDto,
  CreateContratDto,
  CreateEquipementDto,
  CreateInterventionDto,
  CreateParcDto,
  CreateProduitDto,
  CreateTechnicienDto,
  EquipementDto,
  FactureInterventionDto,
  FactureRecurrenteDto,
  GarantieAlerteDto,
  InterventionDto,
  LoginDto,
  ParcDto,
  ProduitDto,
  RegisterDto,
  TechnicienDto,
  UpdateClientDto,
  UpdateContratDto,
  UpdateEquipementDto,
  UpdateFactureRecurrenteDto,
  UpdateInterventionDto,
  UpdateParcDto,
  UpdateProduitDto,
  UpdateTechnicienDto,
} from "./types";

export const authApi = {
  login: (dto: LoginDto) => api.post<AuthResponseDto>("/auth/login", dto).then((r) => r.data),
  register: (dto: RegisterDto) => api.post<AuthResponseDto>("/auth/register", dto).then((r) => r.data),
};

export const clientsApi = {
  getAll: () => api.get<ClientDto[]>("/clients").then((r) => r.data),
  getById: (id: number) => api.get<ClientDto>(`/clients/${id}`).then((r) => r.data),
  create: (dto: CreateClientDto) => api.post<ClientDto>("/clients", dto).then((r) => r.data),
  update: (id: number, dto: UpdateClientDto) => api.put<ClientDto>(`/clients/${id}`, dto).then((r) => r.data),
  delete: (id: number) => api.delete(`/clients/${id}`),
};

export const parcsApi = {
  getAll: (clientId?: number) =>
    api.get<ParcDto[]>("/parcs", { params: { clientId } }).then((r) => r.data),
  getById: (id: number) => api.get<ParcDto>(`/parcs/${id}`).then((r) => r.data),
  create: (dto: CreateParcDto) => api.post<ParcDto>("/parcs", dto).then((r) => r.data),
  update: (id: number, dto: UpdateParcDto) => api.put<ParcDto>(`/parcs/${id}`, dto).then((r) => r.data),
  delete: (id: number) => api.delete(`/parcs/${id}`),
};

export const equipementsApi = {
  getAll: (clientId?: number, parcId?: number) =>
    api.get<EquipementDto[]>("/equipements", { params: { clientId, parcId } }).then((r) => r.data),
  getById: (id: number) => api.get<EquipementDto>(`/equipements/${id}`).then((r) => r.data),
  create: (dto: CreateEquipementDto) => api.post<EquipementDto>("/equipements", dto).then((r) => r.data),
  update: (id: number, dto: UpdateEquipementDto) =>
    api.put<EquipementDto>(`/equipements/${id}`, dto).then((r) => r.data),
  delete: (id: number) => api.delete(`/equipements/${id}`),
  garantieAlertes: (joursAvance = 7) =>
    api.get<GarantieAlerteDto[]>("/equipements/garantie-alertes", { params: { joursAvance } }).then((r) => r.data),
  rapportPannesUrl: (id: number) => `${api.defaults.baseURL}/equipements/${id}/rapport-pannes/pdf`,
};

export const contratsApi = {
  getAll: (clientId?: number) => api.get<ContratDto[]>("/contrats", { params: { clientId } }).then((r) => r.data),
  getById: (id: number) => api.get<ContratDto>(`/contrats/${id}`).then((r) => r.data),
  create: (dto: CreateContratDto) => api.post<ContratDto>("/contrats", dto).then((r) => r.data),
  update: (id: number, dto: UpdateContratDto) => api.put<ContratDto>(`/contrats/${id}`, dto).then((r) => r.data),
  delete: (id: number) => api.delete(`/contrats/${id}`),
  genererFactures: () => api.post<{ facturesGenerees: number }>("/contrats/generer-factures").then((r) => r.data),
  pdfUrl: (id: number) => `${api.defaults.baseURL}/contrats/${id}/pdf`,
};

export const facturesRecurrentesApi = {
  getAll: (contratId?: number) =>
    api.get<FactureRecurrenteDto[]>("/factures-recurrentes", { params: { contratId } }).then((r) => r.data),
  getById: (id: number) => api.get<FactureRecurrenteDto>(`/factures-recurrentes/${id}`).then((r) => r.data),
  updateStatut: (id: number, dto: UpdateFactureRecurrenteDto) =>
    api.patch<FactureRecurrenteDto>(`/factures-recurrentes/${id}/statut`, dto).then((r) => r.data),
};

export const interventionsApi = {
  getAll: (clientId?: number) =>
    api.get<InterventionDto[]>("/interventions", { params: { clientId } }).then((r) => r.data),
  getById: (id: number) => api.get<InterventionDto>(`/interventions/${id}`).then((r) => r.data),
  create: (dto: CreateInterventionDto) => api.post<InterventionDto>("/interventions", dto).then((r) => r.data),
  update: (id: number, dto: UpdateInterventionDto) =>
    api.put<InterventionDto>(`/interventions/${id}`, dto).then((r) => r.data),
  delete: (id: number) => api.delete(`/interventions/${id}`),
  genererFacture: (id: number) =>
    api.post<FactureInterventionDto>(`/interventions/${id}/generer-facture`).then((r) => r.data),
};

export const techniciensApi = {
  getAll: () => api.get<TechnicienDto[]>("/techniciens").then((r) => r.data),
  getById: (id: number) => api.get<TechnicienDto>(`/techniciens/${id}`).then((r) => r.data),
  create: (dto: CreateTechnicienDto) => api.post<TechnicienDto>("/techniciens", dto).then((r) => r.data),
  update: (id: number, dto: UpdateTechnicienDto) =>
    api.put<TechnicienDto>(`/techniciens/${id}`, dto).then((r) => r.data),
  delete: (id: number) => api.delete(`/techniciens/${id}`),
};

export const produitsApi = {
  getAll: () => api.get<ProduitDto[]>("/produits").then((r) => r.data),
  getById: (id: number) => api.get<ProduitDto>(`/produits/${id}`).then((r) => r.data),
  create: (dto: CreateProduitDto) => api.post<ProduitDto>("/produits", dto).then((r) => r.data),
  update: (id: number, dto: UpdateProduitDto) => api.put<ProduitDto>(`/produits/${id}`, dto).then((r) => r.data),
  delete: (id: number) => api.delete(`/produits/${id}`),
};
