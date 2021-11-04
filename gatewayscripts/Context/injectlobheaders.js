/* -------------------Code Header -------------------------------
    Filename: injectlobheaders.js
    Version: 1.0.0
    Last Updated: 
          
    Feb 19 2020: Now will send JSON token to backend
    Nov 21 : X-GtwyOriginalURIMasked is now only up to the base path
             compatibility is offered for olis if compatiblity mode flag is on.
    Nov 14: Added X-Intermediary header
     Description: Generate the parameters used in request tracking

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
var lcategory = context.get('api.properties.log-category');
var logger = console.options({ 'category': lcategory });
var configurationObject = context.get('dhcg-configuration');
var xintermediaryvalue = context.get('api.properties.xintermediary');

var errorref_codes = {
    'SYSTEMCONFIG': {
        'ref_code': 'GTWY-SYSF1',
        'details': 'OAG-CG System configuration invalid',
        'status': {
            'code': '500',
            'reason': 'System Internal Error'
        },
        'kind': 'SE',
        'body': 'api.properties.xintermediary not set'
    }
};

// if error codes raised then return from this script
var errorcodes = context.get('application.errorcode');
if (errorcodes != null) {
    return; // stop processing
}


var transactionID = context.get('message.headers.x-global-transaction-id');
context.set('message.headers.X-GtwyTxId',
    transactionID);

if (xintermediaryvalue != null && xintermediaryvalue != "") {
    context.set('message.headers.X-Intermediary', xintermediaryvalue);
} else {
    // raise error - doesn't immediately reject
    context.set('application.errorcode', errorref_codes.SYSTEMCONFIG);
}




var maskedURI = getRequestPathMasked();
if (configurationObject.compatibilitymode) {
    var legacyMaskedURI = getRequestPathMaskedLegacy();
    logger.debug("CG-PREHOOK: injectlobheaders.js LEGACYMaskedURI: " + legacyMaskedURI);

    context.set('message.headers.GtwyOriginalRequestUriMasked', legacyMaskedURI);

    if (legacyMaskedURI == null) {
        var templateLog = context.get('dhcg-logging');
        templateLog.errorcode = "GTWY-SYSL0";
        templateLog.errordetails = "Could not parse the request URI";
        logger.error(JSON.stringify(templateLog));
    }
}

if (maskedURI == null) {
    var templateLog = context.get('dhcg-logging');
    templateLog.errorcode = "GTWY-SYSL0";
    templateLog.errordetails = "Could not parse the request URI for X-GtwyOriginalRequestUriMasked";
    logger.error(JSON.stringify(templateLog));
}

context.set('message.headers.X-GtwyOriginalRequestUriMasked', maskedURI);

logger.debug("CG-API: injectlobheaders.js MaskedURI: " + maskedURI);


// added this to catch problems, but no error to client, silent log.
if (maskedURI == null) {
    var templateLog = context.get('dhcg-logging');
    templateLog.errorcode = "GTWY-SYSL0";
    templateLog.errordetails = "Could not parse the request URI";
    logger.error(JSON.stringify(templateLog));
}

// X-forward-for logic testing 

//context.set("message.headers.GtwyOriginalClientIP", apim.getvariable('message.headers.X-Client-IP'));
//console.error("message.headers.X-Client-IP: " +  apim.getvariable('message.headers.X-Client-IP'));
//console.error("request.headers.X-Client-IP: " +  apim.getvariable('request.headers.X-Client-IP'));

//console.error("request.headers.X-Forwarded-For: " + context.get('request.headers.X-Forwarded-For'));
//console.error("message.headers.X-Forwarded-For: " + context.get('message.headers.X-Forwarded-For'));

var xforward = context.get('request.headers.X-Forwarded-For');
if (xforward == null || xforward == "") {
    // we inject our own, host name
    xforward = apim.getvariable('message.headers.X-Client-IP');
} 
// OAG-365
//xforward +=", " + xintermediaryvalue;
xforward +=", " + context.get('api.endpoint.address');
context.set('message.headers.X-Forwarded-For', xforward);

// X-Forwarded-Host header
var G_HOST_HEADER = context.get('request.headers.host');
var xhost = G_HOST_HEADER.split(":")[0];
context.set('message.headers.X-Forwarded-Host', xhost);

logger.debug("CG-PREHOOK: injectlobheaders.js X-Forwarded-For: " + xforward + " X-Forwarded-Host: " + xhost);

// emulate use new logic
/*if (!configurationObject.compatibilitymode) {
    putLOBBearerToken();
}*/
putLOBBearerToken();

function getRequestPathMasked() {
    var root = context.get('api.root');

    var fullPath = "https://" + context.get('api.endpoint.hostname') + "/" +
        context.get('api.org.name') + "/" + context.get('api.catalog.path');
    if (root != null && root.length > 0 && root != "/") {
        fullPath += root;
    }
    return fullPath;
}


/** Legacy Function with $ fixed */
function getRequestPathMaskedLegacy() {
    var requestURI = context.get('request.uri');
    var apiPath = context.get('api.root') + context.get('api.operation.path');
    var p = requestURI.indexOf(apiPath);
    if (p < 0) {
        return "error";
    }
    // now we have to replace the data with host, so 
    // 1 need to match the host in the request.headers.host  
    // 2 need to match the http scheme
    // 3 take evertthing starting and including the 3rd / character
    var extractedURI = requestURI.substring(0, p + apiPath.length);
    var scheme = requestURI.match('^http(s)?://')[0];
    return scheme + context.get('request.headers.host') + extractedURI.substring(extractedURI.indexOf('/', 8));
}





function putLOBBearerToken() {

    var outputClaims = context.get("App-IntrospectionToken");
    var stringClaims = JSON.stringify(outputClaims);
    var bufferClaims = Buffer.from(stringClaims);
    if (configurationObject.test_mode != null) logger.debug("CG-PREHOOK: injectlobheaders.js ProcessedToken " + stringClaims);

    var b64Token = bufferClaims.toString('base64url');
    var fullAuthHeader = "Bearer " + b64Token;
    logger.debug("Backend Token: " + fullAuthHeader);
    context.set('message.headers.Authorization', fullAuthHeader);
}

