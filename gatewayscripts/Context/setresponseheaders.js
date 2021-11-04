/* -------------------Code Header -------------------------------
Filename: setresponseheaders.js
Version: 2.0.0

Description: 
Updates:
Dec 3 2019 - Rmoved GtwyTxId headers in the response
Nov 8  2019 - Removed the logging code
Oct 29 2019 - Gatewaymode
This script is used to the gateway transaction ID



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



context.set('message.headers.X-Request-Id',
  context.get('GtwyTxId'));

// set the correlation ID
var clientTxId = context.get("ClientTxId");
if (clientTxId != null) {
  context.set('message.headers.X-Correlation-Id', clientTxId);
}
var errorCode = context.get('application.errorcode');
// if there are any error codes:
if (errorCode != null) {
  context.set('message.headers.X-GtwyErrorCode', errorCode.ref_code);
}


/** Clean up the headers not supposed to go back to client */
context.clear('message.headers.X-GtwyTxId');
context.clear('message.headers.X-Forwarded-For');
context.clear('message.headers.X-Forwarded-Host');
context.clear('message.headers.X-Intermediary');
context.clear('message.headers.Authorization');
context.clear('message.headers.GtwyOriginalRequestUriMasked');
context.clear('message.headers.X-GtwyOriginalRequestUriMasked');




