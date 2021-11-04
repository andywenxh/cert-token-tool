var console = require('console');
var lcategory = context.get('log-category');
var logger = console.options({ 'category': lcategory });
logger.debug("CG-API: after-invoke-routing.js is invoked after first LOB call ! ");

// cast to string
var statusCode = context.message.statusCode + ''; 
logger.debug('CG-API: LOB returned http code: ' + statusCode );

// log if error happened 
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


// load api properties that defines if retry is allowed for some status code
var retryAllowedStatus = context.get('api.properties.retry-allowed-status');
logger.debug('CG-API: retry allowed status codes are: ' + retryAllowedStatus );

if( retryAllowedStatus != null && retryAllowedStatus.includes( statusCode ) ) {
   context.message.header.set('OAG_RETRY_DECESSION', "retry");
}
else {
   logger.info('CG-API: the lob status [' + statusCode + '] is not in the retry allowed list: ' + retryAllowedStatus );
}
