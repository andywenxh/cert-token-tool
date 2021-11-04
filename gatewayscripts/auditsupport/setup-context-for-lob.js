/* -------------------Code Header -------------------------------
Filename: setup-context-for-retry.js
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
const { time } = require('console');
var lcategory = context.get('api.properties.log-category');
var logger = console.options({ 'category': lcategory });
logger.debug("CG-API: setup-context-for-retry.js prepare context for kafka call");

//construct the headers update target url with x-global-transaction-id
//add global txn id to target url
var globalTxnId = context.get('message.headers.x-global-transaction-id');
var encodedTxnId = base16Encode(globalTxnId);
var kafkaQueryParam =  '?key=' + globalTxnId + '&headers=x-global-transaction-id:' + encodedTxnId;

//add encoded x-request-id to the query header
var xrequestId = context.get('message.headers.X-Request-Id');
if( xrequestId ) {
    var encodedXreqId = base16Encode(xrequestId);
    kafkaQueryParam = kafkaQueryParam + ',' + 'x-request-id:' + encodedXreqId;
}

//set the query header to variable and used by invoke later as $(api.properties.target-url)$(kafka-header-param)
context.set('kafka-header-parameter', kafkaQueryParam);

var kafkaApiKey = 'Bearer ' + context.get('api.properties.api-key');
context.set('message.headers.Authorization', kafkaApiKey );

//log the lob endpoint at debug level
var endpoint = context.get('api.properties.target-url') + kafkaQueryParam;
logger.debug('Kafka service endpoint is: ' + endpoint );


//cache the http headers sent from OAG to LOB for retry purpose
var startTimeRetryContext = new Date().getTime();
var oagOutMsgHeader = {};
var lobReqHeaders = context.message.headers;
for (var header in lobReqHeaders) {
   var headerValue = lobReqHeaders[header];
   oagOutMsgHeader[header] = headerValue;
}
context.set('CachedLobReqHeaders', oagOutMsgHeader);
logger.debug('CG-API: setup-context-for-retry cached LOB headers: ' + JSON.stringify(oagOutMsgHeader));

//get the original request body and write into message
context.request.body.readAsBuffer(function(error, buffer) {

  if( error ) {
    logger.error('CG-API: setup-context-for-retry failed to load request body buffer !');
  }
  else {
    var payload = buffer.toString('utf8')
    context.set( 'CachedRequestPayload', payload );
    logger.info('CG-API: setup-context-for-retry loaded original string: ' + payload )

    var endTimeRetryContext = new Date().getTime();
    var timeSpentOnRetryContext = endTimeRetryContext - startTimeRetryContext;
    var bufferSize = buffer.length;
    logger.info('CG-API: buffer size is: ' + bufferSize + ', and time spent on retry context in miliseconds: ' + timeSpentOnRetryContext ) ;    
  }
});


//base16 encode
function base16Encode(str)
{
	var arr1 = [];
	for (var n = 0, l = str.length; n < l; n ++) 
     {
		var hex = Number(str.charCodeAt(n)).toString(16);
		arr1.push(hex);
	 }
	return arr1.join('');
}