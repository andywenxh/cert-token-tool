/* ---------------------Code Header -------------------------------
Filename: detecterrorandreject.js
Version: 2.0.0

Last Update:


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


var errorcode = context.get('application.errorcode');
if (errorcode!= null) {
    context.reject('GenericError', 'Error Detected in Previous Steps');
}