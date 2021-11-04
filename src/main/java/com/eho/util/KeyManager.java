package com.eho.util;

import java.io.InputStream;
import java.security.KeyStore;
import java.security.MessageDigest;
import java.security.cert.Certificate;
import java.security.interfaces.RSAKey;
import java.util.Base64;
import java.util.Enumeration;

import org.apache.commons.codec.binary.Hex;


public class KeyManager {
	
	//private static final String KEY_STORE_NAME = "/VTE4-Token-Signer-Keys04QA.jks";
	private static String KEY_STORE_NAME = "/BLUEWATER1.NODE_Keys04QA.JKS";

//	private static String PASSWD = "Keys04QA";
	
	private static KeyContext keyContext = null;

	public static void main(String[] args) throws Exception{		
		
		
	}
	
	public static KeyContext getKeyCtx(String keystoreName, String password) throws Exception {
		
		if( keyContext == null ) {		
			
			String name = "/" + keystoreName;
			
			InputStream is = KeyManager.class.getResourceAsStream( name );
		    KeyStore keystore = KeyStore.getInstance(KeyStore.getDefaultType());
		    
 
		    
		    
		    keystore.load(is, password.toCharArray());
		    String alias = "1";
	
		    Enumeration<String> allAlies = keystore.aliases();
		    
		    alias = allAlies.nextElement();
		    
		    RSAKey privateKey = null;
		    
		    try {
		      privateKey = (RSAKey)keystore.getKey(alias, password.toCharArray());
		    }
		    catch(Exception exp) {
		    	exp.printStackTrace();
		    }
		    
		    Certificate cert = keystore.getCertificate(alias);
		    RSAKey publicKey = (RSAKey) cert.getPublicKey();
		    
	        MessageDigest sha1Digest = MessageDigest.getInstance("SHA-1");
	        sha1Digest.update(cert.getEncoded());
	        byte[] hashResult = sha1Digest.digest();

	        String keyId = new String( Hex.encodeHex( hashResult, false ) );
	        String x5t = Base64.getUrlEncoder().encodeToString(hashResult);
	        String hashBase64 = Base64.getEncoder().encodeToString(hashResult);
	        
	        System.out.println("Cert thumbprint:[" + keyId + "]\n");
	        System.out.println("Cert x5t:[" + x5t + "]\n");
	        System.out.println("Cert hash-base64:[" + hashBase64 + "]\n");

	        
	        keyContext = new KeyContext()
	        		.setCert(cert)
	        		.setPrivateKey(privateKey)
                    .setPublicKey(publicKey)
	                .setX5t(x5t)
	                .setKid(keyId)
	                .setKeyStore(keystore)
	                .setSha1Base64(hashBase64)
	                .setPasswd(password);
		}
		
	    return keyContext;
	}   
	
}
