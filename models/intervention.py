from odoo import models, fields, api
from odoo.exceptions import UserError


class Intervention(models.Model):
    _name = 'gestion.intervention'
    _description = 'Intervention Technique'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'date_intervention desc'
    _rec_name = 'name'

    name = fields.Char(string='Titre', required=True)
    client_id = fields.Many2one('res.partner', string='Client', required=True)
    equipement_id = fields.Many2one('gestion.equipement', string='Équipement concerné', required=True)
    date_intervention = fields.Datetime(string='Date intervention', default=fields.Datetime.now)
    description = fields.Text(string='Description de l\'intervention')
    
    technicien_id = fields.Many2one('hr.employee', string='Technicien assigné')

    statut = fields.Selection([
        ('nouveau', 'Nouveau'),
        ('en_cours', 'En cours'),
        ('termine', 'Terminé'),
        ('annule', 'Annulé')
    ], string='Statut', default='nouveau', tracking=True)
    
    # Remplacement de product_ids par un modèle spécifique
    materiel_ids = fields.One2many(
        'gestion.intervention.materiel', 
        'intervention_id', 
        string="Matériel utilisé"
    )
    
    facture_id = fields.Many2one('account.move', string="Facture générée")
    
    def generer_facture(self):
        for intervention in self:
            if intervention.facture_id:
                raise UserError("Une facture a déjà été générée pour cette intervention.")

            if not intervention.materiel_ids:
                raise UserError("Aucun matériel n'est lié à l'intervention.")

            facture = self.env['account.move'].create({
                'move_type': 'out_invoice',
                'partner_id': intervention.client_id.id,
                'invoice_date': fields.Date.today(),
                'invoice_line_ids': [
                    (0, 0, {
                        'product_id': materiel.product_id.id,
                        'quantity': materiel.quantite,
                        'price_unit': materiel.prix_unitaire,
                        'name': materiel.description or materiel.product_id.name,
                    }) for materiel in intervention.materiel_ids
                ]
            })

            intervention.facture_id = facture.id
            return {
                'name': 'Facture',
                'view_mode': 'form',
                'res_model': 'account.move',
                'res_id': facture.id,
                'type': 'ir.actions.act_window',
                'target': 'current',
            }


class InterventionMateriel(models.Model):
    _name = 'gestion.intervention.materiel'
    _description = 'Matériel utilisé pour une intervention'
    
    intervention_id = fields.Many2one('gestion.intervention', string='Intervention')
    product_id = fields.Many2one('product.product', string='Produit', required=True)
    description = fields.Char(string='Description complémentaire')
    quantite = fields.Float(string='Quantité', default=1.0)
    prix_unitaire = fields.Float(string='Prix unitaire', related='product_id.list_price')
    montant_total = fields.Float(string='Montant total', compute='_compute_montant_total', store=True)
    
    @api.depends('quantite', 'prix_unitaire')
    def _compute_montant_total(self):
        for line in self:
            line.montant_total = line.quantite * line.prix_unitaire

def write(self, vals):
    res = super(Intervention, self).write(vals)
    if 'statut' in vals:
        for intervention in self:
            body = f"Le statut de votre intervention {intervention.name} a été mis à jour à {vals['statut']}"
            intervention.message_post(
                body=body,
                subject="Mise à jour d'intervention",
                partner_ids=[intervention.client_id.id],
            )
    return res