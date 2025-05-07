from odoo import models, fields, api

class Parc(models.Model):
    _name = 'gestion.parc'
    _description = 'Parc Informatique'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string='Nom du parc', required=True, tracking=True)
    description = fields.Text(string='Description', tracking=True)
    client_id = fields.Many2one('res.partner', string='Client concerné', required=True, tracking=True)
    equipement_ids = fields.One2many('gestion.equipement', 'parc_id', string='Équipements')
    equipement_count = fields.Integer(string='Nombre d\'équipements', compute='_compute_equipement_count', store=True)
    
    @api.depends('equipement_ids')
    def _compute_equipement_count(self):
        for parc in self:
            parc.equipement_count = len(parc.equipement_ids)
    
    def action_ajouter_equipement(self):
        available_equipments = self.env['gestion.equipement'].search([
            ('parc_id', '=', False),
            ('client_id', '=', self.client_id.id)
        ])
        
        return {
            'type': 'ir.actions.act_window',
            'name': 'Nouvel Équipement',
            'view_mode': 'form',
            'res_model': 'gestion.equipement',
            'target': 'new',
            'context': {
                'default_parc_id': self.id,
                'default_client_id': self.client_id.id,
                'available_parc_ids': [self.id]
            },
            'domain': [('id', 'in', available_equipments.ids)] if available_equipments else []
        }