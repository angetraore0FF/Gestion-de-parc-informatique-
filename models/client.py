from odoo import models, fields

class Client(models.Model):
    _inherit = 'res.partner'
    
    equipement_ids = fields.One2many('gestion.equipement', 'client_id', string='Équipements')
    parc_ids = fields.One2many('gestion.parc', 'client_id', string='Parcs')
    intervention_ids = fields.One2many('gestion.intervention', 'client_id', string='Interventions')
    contrat_ids = fields.One2many('gestion.contrat', 'client_id', string='Contrats')
    is_parc_client = fields.Boolean(string="Client du parc informatique")