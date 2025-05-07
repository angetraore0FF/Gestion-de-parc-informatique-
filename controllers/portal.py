# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request  # Importez explicitement request
from odoo.addons.portal.controllers.portal import CustomerPortal

class ParcPortal(CustomerPortal):
    
    def _prepare_home_portal_values(self, counters):
        values = super(ParcPortal, self)._prepare_home_portal_values(counters)
        if not request.env.user.partner_id:
            return values
            
        partner = request.env.user.partner_id
        
        if 'parc_count' in counters:
            values['parc_count'] = http.request.env['gestion.parc'].search_count([
                ('client_id', '=', partner.id)
            ])
        
        return values