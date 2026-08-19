# PRD — Gestion de Parc Informatique (Refonte UI/UX)

## Problème initial
"Refais moi l'interface de ce projet Gestion-de-parc-informatique — le dossier frontend contient le frontend du projet."

## Stack
- **Frontend**: React 19 + TypeScript + Vite 8 + Tailwind CSS v4 (dossier `/app/frontend`)
- **Backend**: .NET (C#, Clean Architecture) dans `/app/backend` — NON MODIFIÉ. Non exécutable dans ce pod (dotnet absent). API consommée via `VITE_API_URL` (défaut `http://localhost:5080/api`).
- Données: React Query + Axios (couche `src/api` inchangée).

## Choix utilisateur (ask_human)
- Style: Moderne & épuré
- Portée: Refonte complète avec nouveaux composants
- Backend: ne pas toucher (conservé tel quel)
- Charte: bleu **#00597D** + vert lime **#B4D333**, logo texte "Gestion Parc IT"
- Langue: **Bilingue FR/EN**

## Réalisé (2026-06)
- **Design system** (`index.css`): palette de marque (brand blue + lime), typographies Sora (titres) + Plus Jakarta Sans (corps), animations (fade-up, scale-in), fond mesh de marque, scrollbars custom, respect prefers-reduced-motion.
- **i18n FR/EN** maison (`src/i18n/`): provider + `t()` + libellés d'enums traduits, persistance `localStorage`, sélecteur de langue (topbar + login).
- **Composants UI redesignés**: Button (5 variantes), Input, Select (chevron custom), FormField, Modal (blur + focus trap), Badge, StatCard (tuiles), Table (skeleton, empty state, hover), PageHeader (nouveau), Icons (jeu étendu).
- **Layout** (`AppLayout`): sidebar sombre de marque avec icônes + indicateur actif lime, carte compte + déconnexion, topbar sticky avec titre de page et bascule FR/EN, **responsive** (drawer mobile).
- **LoginPage**: écran split (panneau de marque + formulaire), bilingue.
- **8 pages** retravaillées et traduites: Clients, Parcs, Équipements (stats + filtres + recherche), Contrats, Factures récurrentes, Interventions (multi-sections), Techniciens, Produits.
- **data-testid** ajoutés sur les éléments interactifs clés.
- Infra: ajout du script `start` (Vite) pour supervisor, `vite.config.ts` (host/allowedHosts/HMR wss).

## Vérification
- `yarn build` (tsc -b + vite build) **OK, 0 erreur TypeScript** sur tout le code refondu.
- Page de login rendue et validée visuellement (bascule FR/EN OK).
- Pages authentifiées non capturables ici (backend .NET non exécutable → 401/redirect login). Logique et types validés par le build.

## Backlog / Next
- P1: Écran Tableau de bord (KPIs globaux: équipements, pannes ouvertes, factures impayées).
- P1: Vue détail équipement (historique pannes) au clic.
- P2: Thème sombre optionnel.
- P2: Export/impression stylée des rapports.

## Notes
- Aucun compte d'auth créé/modifié par la refonte (auth gérée côté backend .NET). Identifiant par défaut affiché sur le login: `admin@gestionparc.local` (seed backend).
