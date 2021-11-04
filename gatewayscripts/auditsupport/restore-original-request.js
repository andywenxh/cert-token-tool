var console = require('console');
var lcategory = context.get('log-category');
var logger = console.options({ 'category': lcategory });
logger.debug("CG-API: restore-origin-request.js is restoring original client request for retry");

// get the cached LOB request headers
var cachedLobReqHeaders = context.get('CachedLobReqHeaders');
for (var header in cachedLobReqHeaders) {
   var headerValue = cachedLobReqHeaders[header];
   context.message.header.set( header, headerValue);
   logger.debug('restored header: ' + header + " with value:" + headerValue);
}

// explicitly restore the authorization http headers on top of above headers
var kafkaApiKey = 'Bearer ' + context.get('api.properties.api-key');
context.message.header.set('Authorization', kafkaApiKey );

// restore the payload
var payload = context.get( 'CachedRequestPayload' );
context.message.body.write( payload );
logger.debug('CG-API: restore-origin-request get the pre-cached payload: ' + payload );

//get the original request body and write into message
// context.request.body.readAsBuffer(function(error, buffer) {

//   if( error ) {
//     logger.error('CG-API: restore-original-request failed to load request body buffer !');
//   }
//   else {
    
//     logger.error('CG-API: restore-origin-request loaded original buffer: ' );
//     logger.error( buffer );
    
//     var length = 999;
//     length = buffer.length;
//     logger.error('CG-API: length of buffer: ' + length);
    
//     var payload = buffer.toString('utf8')
//     logger.error('CG-API: restore-origin-request loaded original string: ' + payload )
//     context.message.body.write( buffer );
//   }
// });