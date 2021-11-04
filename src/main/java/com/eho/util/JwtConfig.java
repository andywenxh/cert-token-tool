package com.eho.util;

import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.Properties;

public class JwtConfig {

	private String ctx;
	
	private String issuer;
	
	private String subject;

	private long expiry;
	
	private String clientId;
	
	private String clientSecret;
	
	private Properties properties;
	
	public String getClientSecret() {
		return clientSecret;
	}

	public void setClientSecret(String clientSecret) {
		this.clientSecret = clientSecret;
	}

	public String getClientId() {
		return clientId;
	}

	public void setClientId(String clientId) {
		this.clientId = clientId;
	}


	private Properties claims = new SequencedProperties();
	

	public String getCtx() {
		return ctx;
	}

	public void setCtx(String ctx) {
		this.ctx = ctx;
	}

	
	public String getSubject() {
		return subject;
	}

	public void setSubject(String subject) {
		this.subject = subject;
	}
	
	
	public String getIssuer() {
		return issuer;
	}

	public void setIssuer(String issuer) {
		this.issuer = issuer;
	}

	public long getExpiry() {
		return expiry;
	}

	public void setExpiry(long expiry) {
		this.expiry = expiry;
	}

	public Properties getClaims() {
		return claims;
	}

	public Properties getProperties() {
		return properties;
	}

	public JwtConfig(String ctx, Properties properties) {
		
		this.ctx = ctx;
		this.issuer  = properties.getProperty("iss");
		this.subject = properties.getProperty("sub");
		this.expiry = Long.parseLong( properties.getProperty("expires_in"));
		this.clientId = properties.getProperty("apic_client_id");
		this.clientSecret = properties.getProperty("apic_client_secret");
		this.properties = properties;
		
		Enumeration enumer = properties.keys();
		while(enumer.hasMoreElements()) {
			String key = enumer.nextElement().toString();
			
			String configedValue = properties.getProperty(key,"");
			String claimName = "";
			
			if( key.startsWith("claim.")) {
				claimName = key.substring("claim.".length());
				if( configedValue.startsWith("[int]")) {
					this.claims.put( claimName, Integer.parseInt(configedValue.substring("[int]".length())));
				}
				else {
					this.claims.put( claimName, configedValue);
				}
			}
			else if( key.startsWith("claims.")) {
				claimName = key.substring("claims.".length());
				if( claimName.indexOf(".") >= 0) {					
				   claimName = claimName.substring(0, claimName.indexOf("."));
				}

				List<String> claimValueList = null;
				if( this.claims.containsKey(claimName)) {
					claimValueList = (List<String>) this.claims.get(claimName);
				}
				else {
					claimValueList = new ArrayList<String>();
					this.claims.put(claimName, claimValueList);
				}
				
				claimValueList.add(configedValue);
			}
		}
		
		
	}
}
