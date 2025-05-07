# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from datetime import date, timedelta
from odoo.exceptions import ValidationError


class Equipement(models.Model):
    _name = 'gestion.equipement'
    _description = 'Équipement Informatique'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'name'
    _rec_name = 'name'

    name = fields.Char(string='Nom de l\'équipement', required=True)
    serial_number = fields.Char(string='Numéro de série')
    purchase_date = fields.Date(string='Date d\'achat')
    client_id = fields.Many2one('res.partner', string='Client')
    date_acquisition = fields.Date(string='Date d\'acquisition')
    garantie_fin = fields.Date(string='Fin de garantie')
    etat = fields.Selection([
        ('en_service', 'En service'),
        ('en_panne', 'En panne'),
        ('hors_service', 'Hors service')
    ], string='Etat', default='en_service')
    type_equipement = fields.Selection([
        ('ordinateur', 'Ordinateur'),
        ('imprimante', 'Imprimante'),
        ('routeur', 'Routeur'),
        ('logiciel', 'Licence Logicielle'),
        ('autre', 'Autre')
    ], string='Type d\'équipement', required=True)
    reference = fields.Char(string='Référence interne')
    image = fields.Binary(string="Photo", attachment=True)
    # Ajoutez ceci à votre classe Equipement
    parc_id = fields.Many2one('gestion.parc', string='Parc associé', ondelete='set null',
                         default=lambda self: self.env['gestion.parc'].search([], limit=1))

    def action_show_smart_button(self):
        return {
            'type': 'ir.actions.act_window',
            'name': 'Détails',
            'view_mode': 'form',
            'res_model': 'gestion.equipement',
            'res_id': self.id,
            'target': 'current',
        }

    def action_show_history(self):
        return {
            'type': 'ir.actions.act_window',
            'name': 'Historique',
            'view_mode': 'tree,form',
            'res_model': 'gestion.intervention',  # Ou le modèle d'historique approprié
            'domain': [('equipement_id', '=', self.id)],
            'target': 'current',
        }

    @api.model
    def _verifier_alertes_garanties(self):
        today = date.today()
        soon = today + timedelta(days=7)

        equipements = self.search([
            ('garantie_fin', '<=', soon),
            ('garantie_fin', '>=', today)
        ])

        for eq in equipements:
            message = f"L'équipement '{eq.name}' arrive en fin de garantie le {eq.garantie_fin}."
            eq.message_post(body=message, subject="Alerte : Fin de garantie proche")

    @api.constrains('parc_id')
    def _check_equipement_unique_parc(self):
        for equipement in self:
            if equipement.parc_id:
                existing = self.search([
                    ('id', '!=', equipement.id),
                    ('parc_id', '=', equipement.parc_id.id),
                    ('name', '=', equipement.name)
                ], limit=1)
                if existing:
                    raise ValidationError(
                        _("Cet équipement est déjà attribué au parc %s") % 
                        equipement.parc_id.name
                    )
    @api.model
    def _get_available_parcs(self):
        if self._context.get('available_parc_ids'):
            return [('id', 'in', self._context['available_parc_ids'])]
        return []
    @api.model
    def _get_available_parcs(self):
        return [('id', 'in', self.env['gestion.parc'].search([]).ids)]