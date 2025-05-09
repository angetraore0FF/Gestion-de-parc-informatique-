Module de Gestion de Parc Informatique
Description
Ce module Odoo permet la gestion complète d'un parc informatique pour prestataires IT, incluant la gestion des clients, contrats, équipements, interventions techniques et facturation récurrente.

Fonctionnalités principales
Gestion des entités
Clients : Fiche client complète avec historique des contrats

Contrats : Gestion des contrats de maintenance avec suivi des échéances

Équipements : Inventaire du matériel avec suivi des caractéristiques techniques

Interventions : Planification et suivi des interventions techniques

Facturation : Génération automatique des factures récurrentes

Fonctionnalités avancées
Tableau de bord centralisé

Rapports personnalisés (contrats)

Portail client pour le suivi des interventions

Alertes automatiques (maintenances préventives, échéances de contrats)

Dépendances
Base Odoo

Module Mail (notifications)

Module Portal (interface client)

Module Website

Module HR (ressources humaines)

Module Stock (gestion d'inventaire)

Module Purchase (achats)

Module Account (comptabilité)

Installation
Copier le dossier gestion_parc_informatique dans le répertoire des modules Odoo

Redémarrer le serveur Odoo

Aller dans Apps → Mettre à jour la liste des applications

Rechercher "Gestion Parc Informatique" et cliquer sur Installer

Structure technique
gestion_parc_informatique/
├── controllers/                  # Logique métier
│   ├── main.py                   # Contrôleur principal
│   └── portal.py                 # Contrôleur pour le portail client
│
├── data/                         # Configuration et données initiales
│   ├── cron_alertes.xml          # Planification des alertes
│   └── cron_facture.xml          # Planification des factures
│
├── models/                       # Modèles de données
│   ├── client.py                 # Modèle Client
│   ├── contrat.py                # Modèle Contrat
│   ├── equipement.py             # Modèle Equipement
│   ├── facture.py                # Modèle Facture
│   ├── intervention.py           # Modèle Intervention
│   └── parcs.py                  # Modèle Parc
│
├── report/                       # Système de reporting
│   ├── contrat_template.xml      # Template PDF des contrats
│   └── report_contrat.xml        # Configuration du rapport
│
├── security/                     # Sécurité et permissions
│   ├── gestion_parc_security.xml # Règles de sécurité
│   └── ir.model.access.csv       # Accès aux modèles
│
├── static/                       # Assets statiques
│   └── description/              # Description du module
│       ├── icon.png              # Icône du module
│       └── index.html            # Page de description
│
└── views/                        # Interfaces utilisateur
    ├── client_views.xml          # Vues Client
    ├── contrat_views.xml         # Vues Contrat
    ├── equipement_views.xml      # Vues Equipement
    ├── facture_views.xml         # Vues Facture
    ├── intervention_views.xml    # Vues Intervention
    ├── parc_views.xml            # Vues Parc
    └── portal_templates.xml      # Templates du portail client


Auteur
Traoré Ange