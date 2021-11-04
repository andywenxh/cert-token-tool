package com.eho.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

public class CacheManager {
	
	private Map<String, JwtConfig> jwtConfigs = new HashMap<String, JwtConfig>();
	
	private static CacheManager instance = new CacheManager();
	
	private Map<String, MessageDigest> digesterMap = new HashMap<String, MessageDigest>();
	
	private CacheManager() {		
	}
	
	public static CacheManager getInstance() {
		return instance;
	}
	
	public JwtConfig getJtwConfig(String ctx) throws Exception {
		JwtConfig jwtConfig = null;
		
		if( this.jwtConfigs.containsKey(ctx)) {
			jwtConfig = this.jwtConfigs.get(ctx);
		}
		else {			
			String propertyName = "/JwtConf." + ctx + ".properties";			
		    Properties prop = ResourceLoader.getProperties(propertyName);
		    jwtConfig = new JwtConfig(ctx, prop);
		    this.jwtConfigs.put(ctx, jwtConfig);
		}
		return jwtConfig;
	}

	
    public MessageDigest getMessageDigester(String alg) {
    	if( this.digesterMap.containsKey(alg)) {
    		return this.digesterMap.get(alg);
    	}
    	else {
    		MessageDigest msgDigester = null;
    		try {
				msgDigester = MessageDigest.getInstance(alg);
			} 
    		catch (NoSuchAlgorithmException e) {
				e.printStackTrace();
			}
    		
    		this.digesterMap.put(alg, msgDigester);    		
    		return msgDigester;
    	}
    }

}


