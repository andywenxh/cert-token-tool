function base64urlToBase64(b64u) {
    console.debug("base64urlToBase64: [" + b64u + "]");
    var pads = new Array(4);
    pads[0] = '';
    pads[1] = '===';
    pads[2] = '==';
    pads[3] = '=';
    var b64uThumbprintNoPAD = b64u.replace(/-/g, '+').replace(/_/g, '/');
    return b64uThumbprintNoPAD + pads[b64uThumbprintNoPAD.length % 4];

}


var test = base64urlToBase64("--JRxY4hJRL3sI/dAU_/_WUEosC-EQJ-3A=");
console.info("converted " + test);