# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
from odoo.addons.portal.controllers.portal import CustomerPortal

class ParcPortal(CustomerPortal):
    
    def _prepare_home_portal_values(self, counters):
        values = super(ParcPortal, self)._prepare_home_portal_values(counters)
        partner = request.env.user.partner_id
        
        if 'parc_count' in counters:
            values['parc_count'] = request.env['gestion.parc'].search_count([('client_id', '=', partner.id)])
        
        return values

class ParcController(http.Controller):
    
    @http.route(['/my/parcs'], type='http', auth="user", website=True)
    def portal_my_parcs(self, **kw):
        partner = request.env.user.partner_id
        parcs = request.env['gestion.parc'].search([('client_id', '=', partner.id)])
        
        values = {
            'parcs': parcs,
            'page_name': 'parcs',
        }
        return request.render("gestion_parc_informatique.portal_my_parcs", values)
    
    @http.route(['/my/parc/<int:parc_id>/equipements'], type='http', auth="user", website=True)
    def portal_my_parc_equipements(self, parc_id, **kw):
        parc = request.env['gestion.parc'].browse(parc_id)
        if parc.client_id != request.env.user.partner_id:
            return request.redirect('/my/home')
            
        equipements = request.env['gestion.equipement'].search([('parc_id', '=', parc_id)])
        
        values = {
            'parc': parc,
            'equipements': equipements,
            'page_name': 'parc_equipements',
        }
        return request.render("gestion_parc_informatique.portal_my_parc_equipements", values)
    
    @http.route(['/my/intervention/new'], type='http', auth="user", website=True)
    def portal_new_intervention(self, **kw):
        partner = request.env.user.partner_id
        equipements = request.env['gestion.equipement'].search([('client_id', '=', partner.id)])
        
        default_equipement_id = int(kw.get('equipement_id', 0)) if kw.get('equipement_id') else None
        
        values = {
            'equipements': equipements,
            'default_equipement_id': default_equipement_id,
            'page_name': 'new_intervention',
        }
        return request.render("gestion_parc_informatique.portal_my_intervention_form", values)
    
    @http.route(['/my/intervention/create'], type='http', auth="user", website=True, methods=['POST'])
    def portal_create_intervention(self, **post):
        partner = request.env.user.partner_id
        equipement = request.env['gestion.equipement'].browse(int(post.get('equipement_id')))
        
        if equipement.client_id != partner:
            return request.redirect('/my/home')
            
        intervention = request.env['gestion.intervention'].create({
            'name': post.get('title'),
            'description': post.get('description'),
            'client_id': partner.id,
            'equipement_id': equipement.id,
            'statut': 'nouveau',
        })
        
        # Envoyer une notification
        intervention.message_post(
            body="Nouvelle intervention créée depuis le portail client",
            subject="Nouvelle intervention",
            partner_ids=[partner.id],
        )
        
        return request.redirect('/my/parcs')