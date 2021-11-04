/* ---------------------Code Header -------------------------------
Filename: gws-connection-error.js
Version: 2.0.0

Last Update:
Oct 23 2019 - convert to gateway mode 
Jan 15: Expimental label variable
Jan 9:  Error code is no longer pre-fixing the body, it is handled later
Dec 21, 2018
Description: 
Handles a remote service connection error.
Context variable is 'application.errorcode'
  
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

var lcategory = context.get('log-category');
var logger = console.options({ 'category': lcategory });
logger.debug("CG-API: gws-connection-error.js connection error detected");

// setting the error code and message
// Todo need to extract the backend host/port only

var errorCode = {

  'ref_code': 'GTWY-SYS01',
  'details': '',
  'status': {
    'code': '500',
    'reason': 'Internal System Error'
  },
  'kind': 'SE',
  'body':
    'Cannot connect to: [' +
    context.get('target-url-label-value') + ']'

};


context.set('application.errorcode', errorCode);
