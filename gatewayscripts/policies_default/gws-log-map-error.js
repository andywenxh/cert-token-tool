/* ---------------------Code Header -------------------------------
Filename: gws-log-map-error.js
Version: 2.0.1

Last Update:
June 1 2020: Added Global IDs in the log, X-Request-Id and X-Correlation-Id to be consistent with provider
Nov 8: Removed any message header injections, moved to setresponseheaders.js
Oct 23, 2019, Gateway mode conversion 
Jan 9, 2019, log message updated with relates_to field when authorization error occurs
ref_code is now appened in this code
added http_response_code
Dec 21, 2018, error handling refactored to display full details
Description: 
If api had an error during it's execution the 'application.errorcode'
context variable will be set with the appropriate error code and response.

If the api had an authorization error response then it will log the error and 
also copy the 'auth-response' context variable to the output , as to pass thru
it's response without changing it.

Error code is output in text/plain type where
the message has the format:

GTWY-XXXX: Details.

Author: Michael Hui



**************************************************************
  Copyright (c) ehealthOntario, 2019

  This unpublished material is proprietary to ehealthOntario.
  All rights reserved. Reproduction or distribution, in whole 
  or in part, is forbidden except by express written permission 
  of ehealthOntario.
**************************************************************
-------------------------------------------------------------------*/
var console = require('console');
var apim = require('apim');
var lcategory = context.get('log-category');
var logger = console.options({ 'category': lcategory });


//  1  detect what kind of error it is
//     this is done thru context variables
//  a) System Error
//  b)  Authentication Error

//  In both cases logging occurs
//  In case b) error message is passed thru


logger.debug('CG-API: gws-log-map-error.js Exception flow Executing');


var errorCode = context.get('application.errorcode');

var auth_error = context.get('application.autherror');

var G_TRANSACTION_ID = context.get('GtwyTxId');
var G_CLIENT_IP = context.get('G_CLIENT_IP');
var G_CLIENT_TRANSACTION_ID = context.get('ClientTxId');

if (errorCode) {

    var templateLog = context.get('dhcg-logging');



    if (!templateLog) {


        templateLog = {
            'relates_to': null,
            'op': context.get('api.root') + context.get('api.operation.path'),

            'ts': context.get('system.datetime'),

            'global': { 'GtwyTxId': context.get('GtwyTxId'), 'X-Request-Id': G_TRANSACTION_ID, 'X-Correlation-Id': G_CLIENT_TRANSACTION_ID },
            'tags': {
                'component': 'gateway',
                'instance': context.get('api.endpoint.address'),
                'client_ip': G_CLIENT_IP,
                'http_method': context.get('request.verb'),
                'http_status_code': null,
                'http_response_phrase': null,
                'application_certificate_Subject': context.get('application.certificate.Subject'),
                'application_certificate_Issuer': context.get('application.certificate.Issuer'),
                'apic': {
                    'plan_id': context.get('plan.id'),
                    'client_app_name': context.get('client.app.name'),
                    'apim-tx-id': context.get('GtwyTxId')
                },
                'error': true,
                'errorcode': null,
                'errordetails': null,
            },
        };

    }
    templateLog.ts = context.get('system.datetime');
    templateLog.tags.error = true;
    templateLog.tags.http_status_code = errorCode.status.code;
    templateLog.tags.http_response_phrase = errorCode.status.reason;

    templateLog.tags.errorcode = errorCode.ref_code;
    templateLog.tags.errordetails = errorCode.body;



    if (errorCode.ref_code == 'GTWY-SYS01') {
        templateLog.relates_to = templateLog.op;
        templateLog.op = 'backend';
    } else if (auth_error) {
        templateLog.relates_to = templateLog.op;
        templateLog.op = 'authentication';
    }


    logger.error(JSON.stringify(templateLog));
    // pass thru error code
    // refactor this Todo: remove content type setting
    // it should be from the backend

    context.message.statusCode = errorCode.status.code + " " + errorCode.status.reason;
    //context.set('message.body', response_msg);
    var accepted = context.get('message.headers.Accept');

    if (accepted != null && accepted.match("xml")) {
        context.set('message.headers["Content-Type"]', 'application/xml');
        session.output.write('<error><httpCode>' + errorCode.status.code + '</httpCode><httpMessage>' + errorCode.status.reason + '</httpMessage>' +
            '<moreInformation>' + errorCode.ref_code + ": " + errorCode.body + '</moreInformation></error>');
    } else {

        var response_msg = "";
        context.set('message.headers["Content-Type"]', 'application/json');
        response_msg = {
            "httpCode": errorCode.status.code,
            "httpMessage": errorCode.status.reason, "moreInformation": errorCode.ref_code + ": " + errorCode.body
        };
        session.output.write(JSON.stringify(response_msg));

    }


}
