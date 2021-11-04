/* ---------------------Code Header -------------------------------
Filename: querystringparameterextractor.js
Version: 1.0.0

Last Update:

Description:

Code to fix gateway mode issue for the // collapse issue.
It always uses the multiple parameter encoding style of csv  comma separated multi values.
Even when the client comes in with the repeating field name format.

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
var lcategory = context.get('api.properties.log-category');
//var parameterEncodingStyle = context.get('api.properties.queryparameterencoding');
var logger = console.options({ 'category': lcategory });
// var qs = require('querystring');  doesn't work in gateway mode

/*logger.debug("parameterencoding " + parameterEncodingStyle);
if (parameterEncodingStyle == null || parameterEncodingStyle == 'undefined' ||  parameterEncodingStyle != "csv") {
  // default set to repeating
  parameterEncodingStyle = "repeat";

}
logger.debug("parameterencoding " + parameterEncodingStyle);
*/
var reqp = context.get('request.parameters');
var params = {};
var a_qstring = "";
for (var name in reqp) {
  params[name] = reqp[name];

  if (ArrayContains(params[name].locations, 'query')) {
    if (a_qstring.length > 0) {
      a_qstring += "&";
    }

    if (typeof params[name].values[0] == 'object') {
      //  this is a multivalue likely
      // need to iterate over it's values
      for (var i = 0; i < params[name].values[0].length; i++) {
        if (i > 0) {
          a_qstring += "&";
        }
        a_qstring += name + '=' + params[name].values[0][i];
      }
    } else {
      // this is a normal string like parameter just copy
      a_qstring += name + "=" + params[name].values[0];
    }

  }
}

logger.debug('CG-PREHOOK: querystringparameterextractor.js strippedparams', JSON.stringify(params));

//var sid = qs.stringify(params);
var decodedStep = decodeURIComponent(a_qstring);
//var encodedStep = encodeURIComponent(decodedStep);
logger.debug("CG-PREHOOK: querystringparameterextractor.js app-querystring is " + decodedStep + typeof decodedStep);
var builtin = context.get('request.querystring');
logger.debug("CG-PREHOOK: built in query string " + typeof builtin);
logger.debug("CG-PREHOOK: built in query string .... " +  builtin);
if (builtin == decodedStep) {
  logger.debug("CG-PREHOOK: built in qs same as processed");
} else {
  logger.debug("CG-PREHOOK: built in qs NOT same AS processed");

}
//logger.debug("app-quertystring sid version " + sid);
//context.set('app-querystring', decodedStep);
context.set('app-querystring', builtin);



function ArrayContains(arr, search) {
  let found = false;
  for (const valuein of arr) {
    if (valuein == search) {
      found = true;
      break;
    }
  }
  return found;
}