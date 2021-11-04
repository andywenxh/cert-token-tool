/*
This is the gateway script to inject a JWT token into the client request
*/

var console = require('console');
var urlopen = require('urlopen');

var logger = console.options({ 'category': 'OAG' });


apim.setvariable('message.headers.GtwyClientIP', 'the client ip');
apim.setvariable('message.headers.X-Forwarded-For', 'forward for');
apim.setvariable('message.headers.X-Forwarded-Host', 'forward host');



var options = {
   target: 'http://10.69.5.63:48080/api/token/jwt/pcoi',
   method: 'GET',
   headers: { 'X-My-Header1' : 'value1' , 'X-My-Header2' : 'value2' },
   timeout: 120
};


urlopen.open(options, function(error, response) {
    if (error) {
        logger.error( error );
    } 
    else {
        var responseStatusCode = response.statusCode;
        var responseReasonPhrase = response.reasonPhrase;
        
        logger.error("Response status code: " + responseStatusCode);
        logger.error("Response reason phrase: " + responseReasonPhrase);
        
        response.readAsBuffer(function(error, responseData){
          if (error){
            throw error ;
          } 
          else {
             logger.error('JWT Token is: ' + responseData )
             var authHeader = 'bearer: ' + responseData;
             apim.setvariable('Authorization', authHeader);
          }
        });
    }
});