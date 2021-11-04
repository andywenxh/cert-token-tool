/* -------------------------------------Code Header ----------------------------------
Filename: privacy-preserving.js
Version: 3.0.0

This script is executed after validate consumer gateway jwt token to make furthur request validation 
for privacy preserving purpose, it will perform the following steps:

1. validate special fields that mandatory for privacy preserving
2. validate the ROT against RSA(Resource Manager Adapter) and get patient details + permission
3. injert privacy preserving specifed LOB http headers

  Copyright (c) Ontario Health, 2020

  This unpublished material is proprietary to Ontario Health.
  All rights reserved. Reproduction or distribution, in whole or in part, 
  is forbidden except by express written permission of Ontario Health.
---------------------------------------------------------------------------------------*/
var console = require('console');
var crypto  = require('crypto');
var urlopen = require('urlopen');

var logCategory = context.get('api.properties.log-category');
var logger = console.options({ 'category': logCategory });



/* --------ERROR ref_code DEFINITION BLOCK -------------------------------*/
var errorref_codes = {

    'AUTHORIZATION_OAUTH_GTWY_SYSF1': {
      'ref_code': 'GTWY-SYSF1',
      'details': 'oauth-config is not set',
      'status': {
          'code': '500',
          'reason': 'Internal System Error',
      },
      'kind': 'AE',
      'body': ''
  },

  'AUTHORIZATION_JWT_CLAIMS': {
    'ref_code': 'GTWY-ATH13',
    'details': 'One or more claims in Token could not be verified',
    'status': {
        'code': '401',
        'reason': 'Unauthorized'
    },
    'kind': 'AE',
    'body': ''
  },

  'RSA_CONNMUNICATION_ERROR': {
      'ref_code': 'GTWY-SYSF3',
      'details': 'Failed to invoke the RSAdapter service',
      'status': {
        'code': '401',
        'reason': 'Unauthorized'
      },
      'kind': 'SE',
      'body': ''
  },

  'RSA_SERVER_ERROR': {
    'ref_code': 'GTWY-SYSF4',
    'details': 'RSAdapter Internal Server Error',
    'status': {
      'code': '401',
      'reason': 'Unauthorized'
    },
    'kind': 'SE',
    'body': ''
  }
};


//get the api setup and current error status
var privacyIndicator = context.get('api.properties.privacy-preserving-enabled');
var errorcode = context.get('application.errorcode');
logger.debug('CG-PREHOOK: privacy-preserving.js is executing with privacy indicate: ' + privacyIndicator + ' and error status: ' + errorcode );


// only process the privacy preserving when there is no previous error and the indicator is set to true
if( 'true' === privacyIndicator && ( errorcode == null || errorcode == undefined )) {
  processPrivacyPreserving();
}

//process the privacy preserving validation
function processPrivacyPreserving() {

  validateClaims();

  var authError = context.get('application.autherror');
  if( authError != null && authError === true ) {
    logger.debug('CG-PREHOOK: privacy-preserving.js claim validation failed, RPT token validation against RS Adapter will be ignored ! ' );
  }
  else {
     validateRptOnRSA();
  }
}


//validate some extra RPT token claims after the standard JTW validations
function validateClaims() {

  //derive the expected api-key based on client id
  var clientId = context.get('client.app.id');
  var validApiKey = crypto.createHash('sha256').update(clientId).digest('base64');  
  var tokenClaims = context.get('App-IntrospectionToken');
  logger.debug('CG-PREHOOK: privacy-preserving.js expected API Key:' + validApiKey );
  
  //load auth config rule for current api unique id
  // TODO: consider to keep the auth-config loading here before call the RSAdapter
  // var authRule = loadAuthConfig();
  // if( authRule['loaded'] == false ) {
  //     errorref_codes.AUTHORIZATION_OAUTH_GTWY_SYSF1.body = authRule['error'];
  //     raiseError(errorref_codes.AUTHORIZATION_OAUTH_GTWY_SYSF1);
  // }
  // else 
  
  if( ! isValidClaimPresent(tokenClaims, 'api_keys', validApiKey )) {
      errorref_codes.AUTHORIZATION_JWT_CLAIMS.body = "APIKey not in Token";
      raiseError(errorref_codes.AUTHORIZATION_JWT_CLAIMS);
  }
}


//load current invokcation auth config
function loadAuthConfig() {

  var authConfig = {
    loaded: false,
    error: ''
  };

  //derive the api unique id as either api operation id or the api path
  var apiUniqueId = '';
  var apiOperationPath = context.get('api.operation.path');
  var apiOperationId   = context.get('api.operation.id');
  logger.debug('CG-PREHOOK: privacy-preserving.js with operation id: ' + apiOperationId + ' with path: ' + apiOperationPath );
  if( apiOperationId != null && apiOperationId != '') {
     apiUniqueId = apiOperationId;
  }
  else {
     apiUniqueId = apiOperationPath;
  }

  //load the configured oauth-config and find the rule for current api unique id
  var authConfStr = context.get('api.properties.oauth-config');
  if( authConfStr == null ) {
    logger.error('CG-PREHOOK: privacy-preserving.js loaded NULL for oauth-config, Oauth configuration not set !');
    authConfig.error = 'Oauth configuration not set';
  }
  else { 
    var authCfg = JSON.parse(authConfStr);
    if( authCfg == null ) {
      logger.error('CG-PREHOOK: privacy-preserving.js Oauth configuration incorrectly set and cannot be parsed !');
      authConfig.error = 'Oauth configuration incorrectly set and cannot be parsed';
    }
    else {
      var apiVerb = context.get('request.verb');
      var matchedAuthRule = authCfg[apiUniqueId][apiVerb];
      if( matchedAuthRule == null ) {
        logger.error('CG-PREHOOK: privacy-preserving.js Oauth configuration incorrectly set, no rule match request !');
        authConfig.error = 'Oauth configuration incorrectly set, no rule match request';      
      }
      else {
        authConfig['scope']   = matchedAuthRule['scope'];
        authConfig['profile'] = matchedAuthRule['profile'];
        authConfig['loaded']  = true;
        logger.debug('CG-PREHOOK: privacy-preserving.js loaded the matched auth rule: ' + JSON.stringify(authConfig));
      }
    }
  }

  return authConfig;
}

//check if the permission claim authorized 
function isClaimAuthorized(authRule, rsaResponse) {
   var claimAuthorized  = false;
   var tokenPermissions = rsaResponse['permissions'];
 
   if(tokenPermissions != null && Array.isArray( tokenPermissions )) {

      var countOfPermissions = tokenPermissions.length;
      var configuredProfile = authRule['profile'];
      var configuredScopes  = authRule['scope'];
    
      for( var index=0; index < countOfPermissions; index++) {
        
          logger.debug();
          var permission = tokenPermissions[index];
          var resourceType = permission['resource_type'];
          var scopeArray = permission['resource_scopes'];
    
          logger.debug('CG-PREHOOK: privacy-preserving.js validate permission group ' + index + ' with resource type: ' + resourceType + ' with scopes: ' + scopeArray );
    
          if( configuredProfile === resourceType && isArrayOverlapping(configuredScopes, scopeArray )) {
              claimAuthorized = true;
              break;
          }
      }
   }   

   return claimAuthorized;
}


//return false if any matching occurs
function isArrayOverlapping(claimValues, expectedValues ) {

  var overlapping = false;

  claimValues.some( claimItem => {
      expectedValues.some( expectedItem => {         
         if( claimItem === expectedItem ) {
           overlapping = true;
         }
         return overlapping;
      });
      return overlapping;
  }) ;
  return overlapping;
}



// validate RPT token against RS adapter, no need to use promise
function validateRptOnRSA() {

  //get the original client request's base64 RPT token as RSA request payload
  var rptToken = {'token': context.get('request.authorization').split("Bearer ")[1] };
  var request  = JSON.stringify(rptToken);
  logger.debug('CG-PREHOOK: privacy-preserving.js request sent to RS Adapter is: ' + request );

  var rsadapterURL = context.get('api.properties.rsadapter-url');
  var tlsProfile   = context.get('api.properties.rsadapter-tls-profile');
 
  var httpOptions = {
    target: rsadapterURL,
    method: 'post',
    headers: { 
      'Content-Type': 'application/json'
    },
    contentType: 'application/json',
    data: request,
    sslClientProfile: tlsProfile
  }; 
  logger.debug('CG-PREHOOK: privacy-preserving.js is about to call rsadapter at ' + rsadapterURL + ' with ssl profile ' + tlsProfile  );

  //invoke the RSAdapter
  urlopen.open( httpOptions, function ( error, response ) {

      if ( error ) {
        logger.error('CG-PREHOOK: failed to conmunicate with RSAdapter: ' + JSON.stringify(error) ); 
        errorref_codes.RSA_CONNMUNICATION_ERROR.body = "failed to invoke rs adapter service due to connmunication error";
        raiseError( errorref_codes.RSA_CONNMUNICATION_ERROR );
      }
      else {
        var responseStatusCode   = response.statusCode;
        var responseReasonPhrase = response.reasonPhrase;

        logger.debug("CG-PREHOOK: privacy-preserving.js invoke RS Adapter with HTTP " + responseStatusCode + ' ' + responseReasonPhrase);

        if ( responseStatusCode == 200 ) {
            response.readAsJSON( function (error, rsaResponse) {
                if (error) {
                  errorref_codes.RSA_CONNMUNICATION_ERROR.body = "failed to read rs adapter response due to json parsing error";
                  raiseError( errorref_codes.RSA_CONNMUNICATION_ERROR );
                }
                else {
                  processRSAdapterResponse( rsaResponse );
                }
            });
        }
        else {
          errorref_codes.RSA_SERVER_ERROR.body = 'RSAdapter internal error HTTP ' + responseStatusCode + ' ' + responseReasonPhrase;
          raiseError( errorref_codes.RSA_SERVER_ERROR );
        }
      }
  });
}

//process the RSAdapter response presented in json format
function processRSAdapterResponse( rsaResult ) {

  logger.debug('CG-PREHOOK: privacy-preserving.js is processing RSAdapter response: ' + JSON.stringify(rsaResult));

  var active = rsaResult['active'];
  if( active == true ) {

    var authRule = loadAuthConfig();

    if( authRule['loaded'] == false ) {
        errorref_codes.AUTHORIZATION_OAUTH_GTWY_SYSF1.body = authRule['error'];
        raiseError(errorref_codes.AUTHORIZATION_OAUTH_GTWY_SYSF1);
    }
    else if( ! isClaimAuthorized(authRule, rsaResult) ) {
        errorref_codes.AUTHORIZATION_JWT_CLAIMS.body = "RPT Token permissions does not contain expected resoruce-id and scope";
        raiseError(errorref_codes.AUTHORIZATION_JWT_CLAIMS);
    }
    else {
      var tokenClaims = context.get('App-IntrospectionToken');
      tokenClaims['patient'] = rsaResult['owner_info'];
      context.set('App-IntrospectionToken', tokenClaims);
    }
  }
  else {
    var rejectDetails = 'RSAdapter rejected RPT token wiht error code: ' + rsaResult['error'] + ', error message: ' + rsaResult['error_description'];
    logger.debug('CG-PREHOOK: privacy-preserving.js ' + rejectDetails );
    errorref_codes.AUTHORIZATION_JWT_CLAIMS.body    = rejectDetails;
    errorref_codes.AUTHORIZATION_JWT_CLAIMS.details = 'One or more claims in Token could not be verified against RSAdapter';
    raiseError( errorref_codes.AUTHORIZATION_JWT_CLAIMS );
  }
}


//check if the expected value match the specified claim field (single or array)
//return true if the expected value matches the claim field
//return false if expected value does not match the claim field, or any element of the specified claim array
function isValidClaimPresent(claims, fieldName, expectedValue ) {
  var claimValid = false;
  var fieldValue = claims[fieldName];

  logger.debug('CG-PREHOOK: privacy-preserving.js  validate field ' + fieldName + ' with expected [' + expectedValue + '] against ' + fieldValue );

  if(  fieldValue != null ) {

    if( Array.isArray( fieldValue )) {
      fieldValue.some( item => {
        if( item === expectedValue ) {
            claimValid = true;
        }
        return claimValid;
      });
    }
    else if( fieldValue === expectedValue ) {
        claimValid = true;
    }    
  }

  return claimValid;
}

// thie function set error context variable to indicate application failure
function raiseError( errorcode ) {
  context.set('application.autherror', true );
  context.set('application.errorcode', errorcode );
  logger.debug('PG-PREHOOK: privacy-preserving.js, Raising Error : ' + errorcode.ref_code + " Details: " + errorcode.body);
}