package com.eho.util;

import java.security.KeyStore;
import java.security.cert.Certificate;
import java.security.interfaces.RSAKey;

public class KeyContext {
	
	
	private KeyStore keyStore;
	private RSAKey privateKey;
	private RSAKey publicKey;
	private Certificate cert;
	private String x5t;
	private String sha1Base64;

	private String kid;
	
	private String passwd;
	
	public RSAKey getPrivateKey() {
		return privateKey;
	}
	public KeyContext setPrivateKey(RSAKey privateKey) {
		this.privateKey = privateKey;
		return this;
	}
	public RSAKey getPublicKey() {
		return publicKey;
	}
	public KeyContext setPublicKey(RSAKey publicKey) {
		this.publicKey = publicKey;
		return this;
	}
	public Certificate getCert() {
		return cert;
	}
	public KeyContext setCert(Certificate cert) {
		this.cert = cert;
		return this;
	}
	public String getX5t() {
		return x5t;
	}
	public KeyContext setX5t(String x5t) {
		this.x5t = x5t;
		return this;
	}
	public KeyStore getKeyStore() {
		return keyStore;
	}
	public KeyContext setKeyStore(KeyStore keyStore) {
		this.keyStore = keyStore;
		return this;
	}
	public String getPasswd() {
		return passwd;
	}
	public KeyContext setPasswd(String passwd) {
		this.passwd = passwd;
		return this;
	}
	public String getKid() {
		return kid;
	}
	public KeyContext setKid(String kid) {
		this.kid = kid;
		return this;
	}
	
	/**
	 * @return the sha1Base64
	 */
	public String getSha1Base64() {
		return sha1Base64;
	}
	/**
	 * @param sha1Base64 the sha1Base64 to set
	 */
	public KeyContext setSha1Base64(String sha1Base64) {
		this.sha1Base64 = sha1Base64;
		return this;
	}
	
}
