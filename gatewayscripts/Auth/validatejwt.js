/* ---------------------Code Header -------------------------------
Filename: validatejwt.js
Version: 3.0.0

Last update:
Dec 5,   Updated to support P/D validation in the usertype claims
Nov 26, Updated to support V2 token updated Nov22 on confluence.
Nov 14, 2019 - combined the validation of the auth error into this source
            for efficieny and separation of concerns, the hook doesn't need to
            know too much about auth errors.
Nov 4, 2019  - Cosumer V2 functionality
Oct 23, 2019
   Convert to gateway mode context variables 
Jan 11, 2019
- Future token check added iat in future will not be accepted.
Jan 9 , 2019 
-modified raiseError to not put in error code, that is resolved later
-used ISO format for date error messages

Dec 21, 2018
-added typ, alg , and iat validation
Description: 
1)Extract Headers
2)Reformat the x5t field into base64 by changing the - and _ characters and
  pad to a multiple of 4 with the = characters
3) Validate claims
  
Author: Michael Hui



**************************************************************
  Copyright (c) ehealthOntario, 2019

  This unpublished material is proprietary to ehealthOntario.
  All rights reserved. Reproduction or distribution, in whole 
  or in part, is forbidden except by express written permission 
  of ehealthOntario.
**************************************************************
-------------------------------------------------------------------*/
var jose = require('jose');
var jwt = require('jwt');
var console = require('console');

var dhcgconfig = context.get('dhcg-configuration');
var lcategory = context.get('api.properties.log-category');
var logger = console.options({ 'category': lcategory });




/* --------ERROR ref_code DEFINITION BLOCK -------------------------------*/
var errorref_codes = {
    'AUTHORIZATION_JWT_NE': {

        'ref_code': 'GTWY-ATH10',
        'details': 'Token Not in Request',
        'status': {
            'code': '400',
            'reason': 'Bad Request',
        },
        'kind': 'AE',
        'body': 'Token Not in Request'

    },
    'AUTHORIZATION_JWT_INVALIDTOKENFORMAT': {
        'ref_code': 'GTWY-ATH11',
        'details': 'Token does not contain the verfication certificate thumbprint',
        'status': {
            'code': '400',
            'reason': 'Bad Request'
        },
        'kind': 'AE',
        'body': ''
    },
    'AUTHORIZATION_JWT_SIGNATUREVALIDATION': {
        'ref_code': 'GTWY-ATH12',
        'details': 'Token signature cannot be verified',
        'status': {
            'code': '401',
            'reason': 'Unauthorized'
        },
        'kind': 'AE',
        'body': 'Token signature cannot be verified'
    },
    'AUTHORIZATION_JWT_SYSCONFIG': {
        'ref_code': 'GTWY-SYSF0',
        'details': 'Cannot Validate JWT Signature, Certificate Registry Issue',
        'status': {
            'code': '500',
            'reason': 'Internal System Error'
        },
        'kind': 'SE',
        'body': 'Cannot Validate JWT Signature, Certificate Registry Issue'
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
    'AUTHORIZATION_JWT_TOKENEXPIRED': {
        'ref_code': 'GTWY-ATH14',
        'details': 'Token is expired',
        'status': {
            'code': '401',
            'reason': 'Unauthorized'
        },
        'kind': 'AE',
        'body': ''
    },
    'AUTHORIZATION_JWT_TOKENLIFETOOLONG': {
        'ref_code': 'GTWY-ATH15',
        'details': 'Token is life time too long',
        'status': {
            'code': '401',
            'reason': 'Unauthorized'
        },
        'kind': 'AE',
        'body': ''
    },
    'AUTHORIZATION_JWT_TOKENFUTURE': {
        'ref_code': 'GTWY-ATH16',
        'details': 'Token was created for the future',
        'status': {
            'code': '401',
            'reason': 'Unauthorized'
        },
        'kind': 'AE',
        'body': ''
    },
    'SYSTEMCONFIG': {
        'ref_code': 'GTWY-SYSF1',
        'details': 'DHCG System configuration invalid',
        'status': {
            'code': '500',
            'reason': 'System Internal Error'
        },
        'kind': 'SE',
        'body': ''
    },
    'SYSTEMASYNC': {
        'ref_code': 'GTWY-SYSF2',
        'details': 'System configuration invalid Claim Validation Async error',
        'status': {
            'code': '500',
            'reason': 'System Internal Error'
        },
        'kind': 'SE',
        'body': ''
    }
};
/* --------END ERROR ref_code DEFINITION BLOCK -------------------------------*/

var outputClaims = {};
const validusertypes = ["P", "D"];

const validatePromise = new Promise((resolve, reject) => {
    validateJWT(resolve, reject);
});

function onResolved() {
    logger.debug("CG-PREHOOK: validatejwt.js on Resolved");
    var authPassed = {

        'status': {
            'code': '200',
            'reason': 'OK'
        },
        'body': '',
        'headers': {
            'errorcode': '0000'
        }
    };
    //context.set('auth-response', authPassed);
    context.set('App-IntrospectionToken', outputClaims);
}

function onRejected(errorcode) {
    logger.debug('CG-PREHOOK: validatejwt.js, onRejected Raising Error : ' + errorcode.ref_code + " Details: " + errorcode.body);
    //context.set('auth-response', errorcode);
    context.set('application.autherror', true);
    context.set('application.errorcode', errorcode);
}
// some asynch ref_code is inside the above
// going to lock it.
validatePromise.then(onResolved, onRejected).catch(onRejected);



/** This function has some internal locking to ensure asynch functions finish before returning 
 * 
 */
function validateJWT(resolve, reject) {
    // cut the bearer out


    var jwtTokenBearer = context.get('request.authorization');
    if (jwtTokenBearer == null || !jwtTokenBearer || jwtTokenBearer == '') {
        reject(errorref_codes.AUTHORIZATION_JWT_NE);
        return;
    }

    // if it not start with Bearer then another error

    var jwtToken = jwtTokenBearer.split("Bearer "); // the space is important
    if (jwtToken.length < 2) {
        reject(errorref_codes.AUTHORIZATION_JWT_NE);
        return;
    }

    var jwsSignedObject = null;

    try {
        jwsSignedObject = jose.parse(jwtToken[1]);
    } catch (err) {
        logger.debug("CG-PREHOOK: validatejwt.js Error caught " + err.message);
        errorref_codes.AUTHORIZATION_JWT_INVALIDTOKENFORMAT.body = 'Error parsing jtwToken: System ' + err.message;
        reject(errorref_codes.AUTHORIZATION_JWT_INVALIDTOKENFORMAT);
        return;
    }


    var signedJWSHeaders = jwsSignedObject.getSignatures();

    var x5t = null;
    var typ = null;
    var alg = null;
    var x5tFound = false;
    var certificateError = false;
    var typFound = false;
    var algFound = false;

    for (var i = 0; i < signedJWSHeaders.length; i++) {
        logger.debug("CG-PREHOOK: validatejwt.js Header index " + i);
        var hdr2 = signedJWSHeaders[i];
        // Extract the value for the Header Parameter named 'kid'
        var allHDR = hdr2.get();
        //x5t = allHDR.x5t;
        alg = allHDR.alg;
        typ = allHDR.typ;
        x5t = hdr2.get('x5t');

        //alg = hdr2.get('alg');
        if (x5t != null) {
            if (x5t.startsWith('*') && x5t.endsWith('*')) {
                // break out and error is set, this is a system error
                certificateError = true;
            } else {
                var b64Thumbprint = base64urlToBase64(x5t);
                if (!b64Thumbprint) {
                    /* Throw an error up */
                    errorref_codes.AUTHORIZATION_JWT_INVALIDTOKENFORMAT.body = "Cannot convert x5t to base64: " + x5t;
                    reject(errorref_codes.AUTHORIZATION_JWT_INVALIDTOKENFORMAT);
                    return;
                }
                var keyID = 'thumbprintsha1:' + b64Thumbprint;
                hdr2.setKey(keyID);
                x5tFound = true;
                logger.debug("CG-PREHOOK: validatejwt.js key id: " + keyID);
            }
        }

        if (alg != null) {
            algFound = true;
            // validate it
            logger.debug('CG-PREHOOK: validatejwt.js Token alg ' + alg);
            if (alg != 'RS256') {
                errorref_codes.AUTHORIZATION_JWT_INVALIDTOKENFORMAT.body = "Token signature algorithm is not supported";
                reject(errorref_codes.AUTHORIZATION_JWT_INVALIDTOKENFORMAT);
                return;
            }
        }
        if (typ != null) {

            typFound = true;
            if (typ != 'JWT') {
                errorref_codes.AUTHORIZATION_JWT_INVALIDTOKENFORMAT.body = 'Token type ' + typ + ' is not supported type';
                reject(errorref_codes.AUTHORIZATION_JWT_INVALIDTOKENFORMAT);
                return;
            }

        }

        if (!x5tFound || !algFound || !typFound) {
            var error_code = null;
            var errorDetails = "";

            if (certificateError) {
                error_code = errorref_codes.AUTHORIZATION_JWT_SYSCONFIG;
                error_code.body = x5t;

            }
            else {
                error_code = errorref_codes.AUTHORIZATION_JWT_INVALIDTOKENFORMAT;
                error_code.body = "No x5t thumbprint or alg or typ found in JWT";
            }

            reject(error_code);
            return;
        }
    }


    var myVerifier = jose.createJWSVerifier(jwsSignedObject);
    logger.debug("CG-PREHOOK: validatejwt.js We've created the verifier");
    // Verify all signatures for which a key has been set
    // At least one signature must have key set
    // This valdiate is not asynchrohous as IBM documentation will have me beleive
    // https://www.ibm.com/support/knowledgecenter/SS9H2Y_7.5.0/com.ibm.dp.doc/jose_js.html#JWSVerifier


    myVerifier.validate(function (error) {
        if (error) {
            logger.debug("CG-PREHOOK: validatejwt.js Signature Validation Error");

            var error_code = errorref_codes.AUTHORIZATION_JWT_SIGNATUREVALIDATION;
            error_code.body  += " " + error.errorCode;
            reject(error_code);
            //session.reject(error.errorMessage);
        } else {
            // All signature verifications have succeeded
            // therefore payload may be trusted
            var textClaims = jwsSignedObject.getPayload();
            // write it into the next step
            // do some claims validation
            logger.debug('CG-PREHOOK: validatejwt.js Start Validating Claims');
            var claimsObj = JSON.parse(textClaims);

            // copy the claims into the outputclaims object
            copyClaims(claimsObj);

            // Check date time
            // current date represented as Date()
            // there are 2 possiblities the gateway clock is ahead or behind.
            // when it is ahead tokens will appear to be exired
            // when it is behind even tokens which are exired will still be accepted
            // this logic treats the first case the 2nd case , the nbf or iat needs to be validated
            // the skew configuration needs to be part of the api base set up

            if (!dhcgconfig || !dhcgconfig.clockSkewSec || !dhcgconfig.maxTokenLifeSec) {
                errorref_codes.SYSTEMCONFIG.body = "skew or max token life not set";
                reject(errorref_codes.SYSTEMCONFIG);

            } else {
                var currentTime = new Date().getTime(); // this is in ms
                // take maximum token life from api if there, otherwise use hook
                var maxLife = dhcgconfig.maxTokenLifeSec;
                var apiMaxTokenLife = context.get('maxTokenLifeSec');
                if (apiMaxTokenLife) {
                    maxLife = apiMaxTokenLife;
                    logger.debug("CG-PREHOOK: validatejwt.js Using api defined max token life " + maxLife);
                }

                // the actual test, need to check if it is a number and positive check the date format
                if (!claimsObj.exp || typeof claimsObj.exp != 'number' ||
                    claimsObj.exp < 0 ||
                    !claimsObj.iat || typeof claimsObj.iat != 'number' || claimsObj.iat < 0) {
                    errorref_codes.AUTHORIZATION_JWT_INVALIDTOKENFORMAT.body = "No 'exp' and/or 'iat' claim found in token";
                    reject(errorref_codes.AUTHORIZATION_JWT_INVALIDTOKENFORMAT);

                } else {
                    if (currentTime - (claimsObj.exp * 1000) > (dhcgconfig.clockSkewSec * 1000)) {
                        errorref_codes.AUTHORIZATION_JWT_TOKENEXPIRED.body = "The token exp: " +
                            new Date(Number.parseFloat((claimsObj.exp * 1000).toPrecision(13))).toISOString() +
                            "  is before the current system time: " + new Date(currentTime).toISOString();
                        reject(errorref_codes.AUTHORIZATION_JWT_TOKENEXPIRED);
                    } else if (!validateClaimType(claimsObj, 'exp', 0, true, 'number')) {
                        errorref_codes.AUTHORIZATION_JWT_CLAIMS.body = "invalid exp";
                        reject(errorref_codes.AUTHORIZATION_JWT_CLAIMS);
                    } else if (!validateClaimType(claimsObj, 'iat', 0, true, 'number')) {
                        errorref_codes.AUTHORIZATION_JWT_CLAIMS.body = "invalid iat";
                        reject(errorref_codes.AUTHORIZATION_JWT_CLAIMS);
                    }
                    else if (claimsObj.exp - claimsObj.iat > maxLife) {
                        errorref_codes.AUTHORIZATION_JWT_TOKENLIFETOOLONG.body = "The life time is out of bounds";
                        reject(errorref_codes.AUTHORIZATION_JWT_TOKENLIFETOOLONG);
                    } else if (currentTime - (claimsObj.iat * 1000) < (dhcgconfig.clockSkewSec * -1000)) {
                        errorref_codes.AUTHORIZATION_JWT_TOKENFUTURE.body = "The token issue time: " +
                            new Date(Number.parseFloat((claimsObj.iat * 1000).toPrecision(13))).toISOString() +
                            "  is after the current system time: " + new Date(currentTime).toISOString();
                        reject(errorref_codes.AUTHORIZATION_JWT_TOKENFUTURE);
                    } else if (!validateClaimType(claimsObj, 'jti', 40, true, 'string')) {
                        errorref_codes.AUTHORIZATION_JWT_CLAIMS.body = "invalid jti";
                        reject(errorref_codes.AUTHORIZATION_JWT_CLAIMS);
                    }
                    else if (!validateClaimType(claimsObj, 'org', 70, false, 'string')) {
                        errorref_codes.AUTHORIZATION_JWT_CLAIMS.body = "invalid org";
                        reject(errorref_codes.AUTHORIZATION_JWT_CLAIMS);
                    } else if (!validateClaimType(claimsObj, 'app', 50, true, 'string')) {
                        errorref_codes.AUTHORIZATION_JWT_CLAIMS.body = "invalid app";
                        reject(errorref_codes.AUTHORIZATION_JWT_CLAIMS);
                    } else if (!validateClaimType(claimsObj, 'appVersion', 10, true, 'string')) {
                        errorref_codes.AUTHORIZATION_JWT_CLAIMS.body = "invalid appversion";
                        reject(errorref_codes.AUTHORIZATION_JWT_CLAIMS);
                    } else if (!validateClaimType(claimsObj, 'sub', 0, true, 'string')) {
                        errorref_codes.AUTHORIZATION_JWT_CLAIMS.body = "invalid sub";
                        reject(errorref_codes.AUTHORIZATION_JWT_CLAIMS);
                    } else if (!validateClaimType(claimsObj, 'idp', 255, true, 'string')) {
                        errorref_codes.AUTHORIZATION_JWT_CLAIMS.body = "invalid Idp";
                        reject(errorref_codes.AUTHORIZATION_JWT_CLAIMS);
                    } else if (!validateClaimType(claimsObj, 'prn', 75, true, 'string')) {
                        errorref_codes.AUTHORIZATION_JWT_CLAIMS.body = "invalid prn";
                        reject(errorref_codes.AUTHORIZATION_JWT_CLAIMS);
                    } else if (!validateClaimType(claimsObj, 'usertype', 1, true, 'string')) {
                        errorref_codes.AUTHORIZATION_JWT_CLAIMS.body = "invalid usertype";
                        reject(errorref_codes.AUTHORIZATION_JWT_CLAIMS);
                    } else if (!validateClaimValueIsOneOf(claimsObj, 'usertype', validusertypes)) {
                        errorref_codes.AUTHORIZATION_JWT_CLAIMS.body = "invalid usertype values";
                        reject(errorref_codes.AUTHORIZATION_JWT_CLAIMS);
                    }
                    else if (!validateClaimType(claimsObj, 'aud', 255, true, 'string')) {
                        errorref_codes.AUTHORIZATION_JWT_CLAIMS.body = "invalid aud spec";
                        reject(errorref_codes.AUTHORIZATION_JWT_CLAIMS);
                    }
                    else {
                        //validateClaims(jwtToken);
                        resolve();
                    }

                }
            }
        }

    });
}



/** Todo: this function should be included as part of an require module
 *  However, if we choose to do this, then deployments will be more complex because
 *  it will be a combination with file deployments
 */
function base64urlToBase64(b64u) {
    logger.debug("CG-PREHOOK: validatejwt.js base64urlToBase64: [" + b64u + "]");
    var pads = new Array(4);
    pads[0] = '';
    pads[1] = '===';
    pads[2] = '==';
    pads[3] = '=';
    var b64uThumbprintNoPAD = b64u.replace(/-/g, '+').replace(/_/g, '/');
    return b64uThumbprintNoPAD + pads[b64uThumbprintNoPAD.length % 4];

}

function copyClaims(claimsObj) {
    for (var key in claimsObj) {
        outputClaims[key] = claimsObj[key];
    }
}


function validateClaimValue(obj, key, value) {
    if (obj[key] == undefined) { return false; }
    if (obj[key] != value) {
        // check if array
        var match = false;
        if (obj[key] instanceof Object) {

            for (var vind in obj[key]) {

                if (obj[key][vind] == value) {
                    match = true;
                    break;
                }
            }
            return match;
        }
        return false;
    }
    return true;
}

function validateClaimType(obj, key, maxlength, mandatory, typename) {
    if (obj[key] != undefined) {
        // check if array
        if (typename == 'string') {
            if (typeof obj[key] == typename) {
                if( maxlength == 0 ) {
                    return (obj[key].length >= 1);
                }
                else {
                return (obj[key].length >= 1 && obj[key].length <= maxlength);
                }
            }
        } else if (typename == 'number') {
            return typeof obj[key] == typename;
        } else {
            return false; // type not supported
        }
    } else {
        return !mandatory;
    }

}


function validateClaimValueIsOneOf(obj, key, valueSet) {
    if (obj[key] == undefined || valueSet == undefined) { return false; } // misconfiguration lock out.
    // check if array
    var match = false;

    for (var vind in obj[key]) {
        console.log("What vind " + vind);
        for (var vsind in valueSet) {
            if (obj[key][vind].toUpperCase() == valueSet[vsind]) {
                match = true;
                break;
            }
        }
        if (match == true) break;
    }

    return match;
}


