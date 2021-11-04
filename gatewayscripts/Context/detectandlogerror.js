/* -------------------Code Header -------------------------------
Filename: detectandlogerror.js
Version: 1.0.0

Description: 
Updates:

This script is used to the push to log the operation error on the backend.



**************************************************************
  Copyright (c) ehealthOntario, 2019

  This unpublished material is proprietary to ehealthOntario.
  All rights reserved. Reproduction or distribution, in whole 
  or in part, is forbidden except by express written permission 
  of ehealthOntario.
**************************************************************
-------------------------------------------------------------------*/
var console = require('console');
var lcategory = context.get('api.properties.log-category');
var logger = console.options({ 'category': lcategory });


// check the error code, is it accessible here?
var statusCode = context.message.statusCode + ""; // cast to string
var regex = /2[0-9][0-9]/g;
if (statusCode.match(regex) == null) {
    var log_entry = {
        'op': 'backend',
        'relates_to': context.get('api.root') + context.get('api.operation.path'),
        'ts': context.get('system.datetime'),
        'global': {
            'GtwyTxId': context.get('GtwyTxId')
        },
        'tags': {
            'component': 'gateway',
            'instance': context.get('api.endpoint.hostname'),
            'client_ip': context.get('request.headers.x-forwarded-for'),
            'http_method': context.get('request.verb'),
            'http_status_code': context.message.statusCode + "",
            'http_response_phrase': context.message.reasonPhrase,
            'application_certificate_Subject': context.get('application.certificate.Subject'),
            'application_certificate_Issuer': context.get('application.certificate.Issuer'),
            'apic': {
                'plan_id': context.get('plan.id'),
                'client_app_name': context.get('client.app.name'),
                'apim-tx-id': context.get('GtwyTxId')
            },
            'error': true,
            'errorcode': 'GTWY-LOB01',
            'errordetails': 'Application operation error',
        }
    };
    logger.error(JSON.stringify(log_entry));
}