export const EtatEquipement = { EnService: 0, EnPanne: 1, HorsService: 2 } as const;
export const EtatEquipementLabels: Record<number, string> = {
  0: "En service",
  1: "En panne",
  2: "Hors service",
};

export const TypeEquipement = { Ordinateur: 0, Imprimante: 1, Routeur: 2, Logiciel: 3, Autre: 4 } as const;
export const TypeEquipementLabels: Record<number, string> = {
  0: "Ordinateur",
  1: "Imprimante",
  2: "Routeur",
  3: "Licence logicielle",
  4: "Autre",
};

export const StatutContrat = { Brouillon: 0, Actif: 1, Termine: 2 } as const;
export const StatutContratLabels: Record<number, string> = {
  0: "Brouillon",
  1: "Actif",
  2: "Terminé",
};

export const RecurrenceContrat = { Mois: 0, Trimestre: 1, Annee: 2 } as const;
export const RecurrenceContratLabels: Record<number, string> = {
  0: "Mensuelle",
  1: "Trimestrielle",
  2: "Annuelle",
};

export const StatutFacture = { Brouillon: 0, Envoyee: 1, Payee: 2 } as const;
export const StatutFactureLabels: Record<number, string> = {
  0: "Brouillon",
  1: "Envoyée",
  2: "Payée",
};

export const StatutIntervention = { Nouveau: 0, EnCours: 1, Termine: 2, Annule: 3 } as const;
export const StatutInterventionLabels: Record<number, string> = {
  0: "Nouveau",
  1: "En cours",
  2: "Terminé",
  3: "Annulé",
};

export interface ClientDto {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  isParcClient: boolean;
  parcCount: number;
  equipementCount: number;
  contratCount: number;
}
export interface CreateClientDto {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  isParcClient: boolean;
}
export type UpdateClientDto = CreateClientDto;

export interface ParcDto {
  id: number;
  name: string;
  description?: string | null;
  clientId: number;
  clientName: string;
  equipementCount: number;
}
export interface CreateParcDto {
  name: string;
  description?: string | null;
  clientId: number;
}
export type UpdateParcDto = CreateParcDto;

export interface EquipementDto {
  id: number;
  name: string;
  serialNumber?: string | null;
  purchaseDate?: string | null;
  dateAcquisition?: string | null;
  garantieFin?: string | null;
  etat: number;
  typeEquipement: number;
  reference?: string | null;
  adresseMac?: string | null;
  adresseIp?: string | null;
  systemeExploitation?: string | null;
  emplacement?: string | null;
  clientId?: number | null;
  clientName?: string | null;
  parcId?: number | null;
  parcName?: string | null;
  incidentCount: number;
}
export interface CreateEquipementDto {
  name: string;
  serialNumber?: string | null;
  purchaseDate?: string | null;
  dateAcquisition?: string | null;
  garantieFin?: string | null;
  etat: number;
  typeEquipement: number;
  reference?: string | null;
  adresseMac?: string | null;
  adresseIp?: string | null;
  systemeExploitation?: string | null;
  emplacement?: string | null;
  clientId?: number | null;
  parcId?: number | null;
}
export type UpdateEquipementDto = CreateEquipementDto;

export interface GarantieAlerteDto {
  id: number;
  name: string;
  garantieFin: string;
  clientId?: number | null;
  clientName?: string | null;
}

export interface ContratDto {
  id: number;
  name: string;
  clientId: number;
  clientName: string;
  dateDebut: string;
  dateFin: string;
  statut: number;
  montant: number;
  recurrence: number;
  prochaineFacture: string;
  equipementIds: number[];
}
export interface CreateContratDto {
  clientId: number;
  dateDebut: string;
  dateFin: string;
  statut: number;
  montant: number;
  recurrence: number;
  prochaineFacture?: string | null;
  equipementIds?: number[] | null;
}
export interface UpdateContratDto {
  clientId: number;
  dateDebut: string;
  dateFin: string;
  statut: number;
  montant: number;
  recurrence: number;
  prochaineFacture: string;
  equipementIds?: number[] | null;
}

export interface FactureRecurrenteDto {
  id: number;
  contratId: number;
  contratName: string;
  clientId: number;
  clientName: string;
  dateFacture: string;
  montant: number;
  statut: number;
}
export interface UpdateFactureRecurrenteDto {
  statut: number;
}

export interface InterventionMaterielDto {
  id: number;
  produitId: number;
  produitName: string;
  description?: string | null;
  quantite: number;
  prixUnitaire: number;
  montantTotal: number;
}
export interface CreateInterventionMaterielDto {
  produitId: number;
  description?: string | null;
  quantite: number;
  prixUnitaire?: number | null;
}
export interface InterventionDto {
  id: number;
  name: string;
  clientId: number;
  clientName: string;
  equipementId: number;
  equipementName: string;
  dateIntervention: string;
  description?: string | null;
  technicienId?: number | null;
  technicienName?: string | null;
  statut: number;
  factureInterventionId?: number | null;
  contactReferent?: string | null;
  dateDebutPanne?: string | null;
  descriptionResolution?: string | null;
  intervenantResolution?: string | null;
  materiels: InterventionMaterielDto[];
}
export interface CreateInterventionDto {
  name: string;
  clientId: number;
  equipementId: number;
  dateIntervention?: string | null;
  description?: string | null;
  technicienId?: number | null;
  statut: number;
  contactReferent?: string | null;
  dateDebutPanne?: string | null;
  descriptionResolution?: string | null;
  intervenantResolution?: string | null;
  materiels?: CreateInterventionMaterielDto[] | null;
}
export interface UpdateInterventionDto {
  name: string;
  clientId: number;
  equipementId: number;
  dateIntervention: string;
  description?: string | null;
  technicienId?: number | null;
  statut: number;
  contactReferent?: string | null;
  dateDebutPanne?: string | null;
  descriptionResolution?: string | null;
  intervenantResolution?: string | null;
}
export interface FactureInterventionDto {
  id: number;
  clientId: number;
  dateFacture: string;
  montantTotal: number;
  statut: number;
  interventionId: number;
}

export interface TechnicienDto {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  isActive: boolean;
}
export interface CreateTechnicienDto {
  name: string;
  email?: string | null;
  phone?: string | null;
  isActive: boolean;
}
export type UpdateTechnicienDto = CreateTechnicienDto;

export interface ProduitDto {
  id: number;
  name: string;
  reference?: string | null;
  prixUnitaire: number;
  isActive: boolean;
}
export interface CreateProduitDto {
  name: string;
  reference?: string | null;
  prixUnitaire: number;
  isActive: boolean;
}
export type UpdateProduitDto = CreateProduitDto;

export interface RegisterDto {
  email: string;
  password: string;
  role: string;
  clientId?: number | null;
  technicienId?: number | null;
}
export interface LoginDto {
  email: string;
  password: string;
}
export interface AuthResponseDto {
  token: string;
  expiresAtUtc: string;
  email: string;
  roles: string[];
  clientId?: number | null;
  technicienId?: number | null;
}
