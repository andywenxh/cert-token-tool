/* ---------------------Code Header -------------------------------
Filename: gws-client-auth-error.js
Version: 2.0.0

Last Update:
Oct 23, 2019 - Port to gateway mode 
Jan 14, 2019 - Updated error message details to "Client ID or Client Secret Invalid" to line up with lad.
Jan 11, 2019 - Updated this to generate an auth error as well.
Jan 9, 2019
body of error message no longer contains error code, that is prepended later
Dec 21, 2018
Description: 
Handles a client auth error by setting an application level error code
such that the default error handler will
catch and process it. Context variable is 'application.errorcode'
  
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
var logger = console.options({ 'category': lcategory });

// we can't use anything from previous api policy or global pre hook because
// they haven't executed yet.
logger.debug("Client error detected");


var errorCode = {

  'ref_code': 'GTWY-ATH01',
  'details': 'Client ID or Client Secret Invalid',
  'status': {
    'code': '401',
    'reason': 'Unauthorized'
  },
  'kind': 'CE',
  'body': 'Client ID or Client Secret Invalid'
};


context.set('application.errorcode', errorCode);
context.set('application.autherror', true);
