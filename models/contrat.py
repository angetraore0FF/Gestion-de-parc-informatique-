from odoo import models, fields, api, _
from datetime import timedelta
import logging

_logger = logging.getLogger(__name__)

class ContratService(models.Model):
    _name = 'gestion.contrat'
    _description = 'Contrat de service'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'date_debut desc'
    
    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', _('New')) == _('New'):
                vals['name'] = self.env['ir.sequence'].next_by_code('gestion.contrat.sequence') or _('New')
        return super(ContratService, self).create(vals_list)

    name = fields.Char(string="Référence du contrat", required=True, default='New', copy=False, index=True)
    client_id = fields.Many2one('res.partner', string="Client", required=True)
    equipement_ids = fields.Many2many('gestion.equipement', string="Équipements couverts")
    date_debut = fields.Date(string="Date de début", required=True)
    date_fin = fields.Date(string="Date de fin", required=True)
    statut = fields.Selection([
        ('brouillon', 'Brouillon'),
        ('actif', 'Actif'),
        ('termine', 'Terminé')
    ], default='brouillon', string="Statut", tracking=True)
    montant = fields.Float(string="Montant")
    recurrence = fields.Selection([
        ('mois', 'Mensuelle'),
        ('trimestre', 'Trimestrielle'),
        ('annee', 'Annuelle')
    ], string="Récurrence", default='mois')
    prochaine_facture = fields.Date(string="Prochaine date de facturation", default=fields.Date.today)

    def action_generer_pdf(self):
        return self.env.ref('gestion_parc_informatique.report_contrat').report_action(self)

    @api.model
    def _generer_factures_recurrentes(self):
        today = fields.Date.today()
        contrats = self.search([('prochaine_facture', '<=', today), ('statut', '=', 'actif')])

        for contrat in contrats:
            self.env['gestion.facture'].create({
                'contrat_id': contrat.id,
                'date_facture': today,
                'montant': contrat.montant,
            })

            # Mise à jour de la prochaine date
            if contrat.recurrence == 'mois':
                delta = timedelta(days=30)
            elif contrat.recurrence == 'trimestre':
                delta = timedelta(days=90)
            elif contrat.recurrence == 'annee':
                delta = timedelta(days=365)
            else:
                delta = timedelta(days=30)

            contrat.write({'prochaine_facture': today + delta})

def write(self, vals):
    res = super(ContratService, self).write(vals)
    if 'statut' in vals:
        for contrat in self:
            body = f"Le statut de votre contrat {contrat.name} a été mis à jour à {vals['statut']}"
            contrat.message_post(
                body=body,
                subject="Mise à jour de contrat",
                partner_ids=[contrat.client_id.id],
            )
    return res