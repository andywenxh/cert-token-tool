/* -------------------Code Header -------------------------------
          Filename: dhcg-init.js
          Version: 1.1.1
          Last Updated: 
          June 5, 2020 - removed app-querystring as a best practice.
          June 1, 2020 - upgrade to 4.1.11 - this file copies the query string parameter into the request.querystring to avoid having to update apis.
          Oct. 25, 2019 - gtwy mode
          Jan 11, 2019 - GtwyClientIP added to headers to pass thru
          Jan 7, 2019 - changed ets to ts, and added relates_to, http_response_phrase


          Description: 
          This script is used to define runtime variables such as allowable clock skews etc..  



          **************************************************************
            Copyright (c) ehealthOntario, 2018

            This unpublished material is proprietary to ehealthOntario.
            All rights reserved. Reproduction or distribution, in whole 
            or in part, is forbidden except by express written permission 
            of ehealthOntario.
          **************************************************************
          -------------------------------------------------------------------*/
//var serviceVars = require('service-metadata'); - does not work in apic even if it works in pure gatewayscript
var console = require('console');
var apim = require('apim');
var lcategory = context.get('api.properties.log-category');
var logger = console.options({ 'category': lcategory });
var testmode = context.get('api.properties.test');
var compatibilitymode = context.get('api.properties.compatibilitymode');
var privacyIndicator = context.get('api.properties.privacy-preserving-enabled');

/* fallback parameters */
var configurationObject =
{
    'clockSkewSec': 300,
    'loglevel': 'error',  // setting to error for easy debugging, in prod this should be info
    'test_mode': (testmode != null),
    'maxTokenLifeSec': 3600,
    'compatibilitymode': (compatibilitymode!=null)
};

// set test mode

// compute request size
var reqSizeTemp = context.get('request.headers.content-length');
var contentLength = 0;
if (reqSizeTemp) {
    contentLength = parseInt(reqSizeTemp);
}



var templateLog = {
    'relates_to': null,
    'op': context.get('api.root') + context.get('api.operation.path'),
    'ts': null,

    'global': { 'GtwyTxId': context.get('message.headers.x-global-transaction-id') },
    'tags': {
        'component': 'gateway',
        'instance': context.get('api.endpoint.address'),
        'client_ip': context.get('request.headers.x-forwarded-for'),
        'http_method': context.get('request.verb'),
        'http_status_code': null,
        'http_response_phrase': null,
        'request_size': contentLength,
        'application_certificate_Subject': context.get('application.certificate.Subject'),
        'application_certificate_Issuer': context.get('application.certificate.Issuer'),
        'apic': {
            'plan_id': context.get('plan.id'),
            'client_app_name': context.get('client.app.name'),
            'apim-tx-id': context.get('message.headers.x-global-transaction-id')
        },
        'error': false,
        'errorcode': null,
        'errordetails': null,
    },


};

// setup the privacy preserving status, which will decide to go regular JTW validation or RSAdapter validation
if( 'true' === privacyIndicator ) {
    context.set('privacy_preserving_enabled', 'true')
}
else {
    context.set('privacy_preserving_enabled', 'false')
}
logger.debug('CG-PREHOOK: prehook-src.js api property privacy-preserving-enabled is ' + privacyIndicator );
logger.debug('CG-PREHOOK: prehook-src.js context variable privacy-preserving-enabled is ' + context.get('privacy_preserving_enabled'));


context.set('dhcg-configuration', configurationObject);
context.set('dhcg-logging', templateLog);
// needed for gtwy mode have to put into context
context.set('GtwyTxId', context.get('message.headers.x-global-transaction-id'));
// get the client transaction id 
context.set('ClientTxId', context.get('request.headers.x-request-id'));

// blanking out the header fields.
context.set('G_CLIENT_IP', apim.getvariable('message.headers.X-Client-IP'));

//context.set('log.request_http_headers.X-Gtwy-Client-Secret', "******");

//context.set('log.request_http_headers.Authorization', "******");