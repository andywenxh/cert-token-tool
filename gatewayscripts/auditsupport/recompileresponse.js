/* -------------------Code Header -------------------------------
Filename: recompileresponse.js
Version: 2.0.0

Description: 
This script is used to setup the kafka service endpoint and headers



**************************************************************
  Copyright (c) Ontario Health, 2020

  This unpublished material is proprietary to Ontario Health.
  All rights reserved. Reproduction or distribution, in whole 
  or in part, is forbidden except by express written permission 
  of Ontario Health.
**************************************************************
-------------------------------------------------------------------*/
var console = require('console');

var lcategory = context.get('log-category');
var logger = console.options({ 'category': lcategory });
logger.debug("CG-API: recompileresponse.js process success response or operation error");


context.set('message.headers.X-Request-Id', context.get('GtwyTxId'));

// set the correlation ID
var clientTxId = context.get("ClientTxId");
if (clientTxId != null) {
  context.set('message.headers.X-Correlation-Id', clientTxId);
}

// Clean up the headers not supposed to go back to client 
context.clear('message.headers.X-GtwyTxId');
context.clear('message.headers.X-Forwarded-For');
context.clear('message.headers.X-Forwarded-Host');
context.clear('message.headers.X-Intermediary');
context.clear('message.headers.Authorization');
context.clear('message.headers.GtwyOriginalRequestUriMasked');
context.clear('message.headers.X-GtwyOriginalRequestUriMasked');

var statusCode = context.message.statusCode + ""; // cast to string
var regex = /2[0-9][0-9]/g;
if (statusCode.match(regex) == null) {

    context.message.statusCode = '500 Internal System Error';
    context.set('message.headers["Content-Type"]', 'application/json');
    context.set('message.headers["X-GtwyErrorCode"]', 'GTWY-LOB01');

    var response_msg = {
            "httpCode": "500",
            "httpMessage": "Internal System Error", 
            "moreInformation": "GTWY-LOB01: Internal System Error"
    };
    session.output.write(JSON.stringify(response_msg));
}
else {
  // empty the message payload and content type
  context.message.header.remove('Content-Type');
  session.output.write('');
}
