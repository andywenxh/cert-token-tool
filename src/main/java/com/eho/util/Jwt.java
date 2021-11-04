package com.eho.util;


import java.io.BufferedWriter;
import java.io.FileWriter;
import java.security.MessageDigest;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.UUID;
import java.util.stream.Collectors;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTCreator;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;


public class Jwt {

    private static final String SECRET = "9a96349e2345385785e804e0f4254dee";

    private static String ISSUER = "sys_user";
    
    public static void main(String[] args) throws Exception{    	
  	
    	String apiCtx = args[0];
    	String keystore = args[1];
    	String token = genCtxToken(apiCtx, keystore, "Keys04QA");    	
    	System.out.println("Generated token is:[\n");
    	System.out.println(token);
    	System.out.println("]");

    	saveJWT2File(apiCtx, token);    	
    }
    
    public static String genCtxToken(String ctx, String keystore, String password) throws Exception {
    	String token="";
    	
    	JwtConfig jwtConfig = CacheManager.getInstance().getJtwConfig(ctx);
    	
    	String clientId = jwtConfig.getClientId(); 
    	String clientSecret = jwtConfig.getClientSecret();
    	
    	long now = System.currentTimeMillis() ;
		long expiryTimeStamp = now  + jwtConfig.getExpiry() * 1000;
		Date expireAt =  new Date(expiryTimeStamp);
		Date issueAt =  new Date(now - 30000);
    	
        String issuer  = jwtConfig.getIssuer();
        String subject = jwtConfig.getSubject();
        String jti = UUID.randomUUID().toString();
		JWTCreator.Builder builder = JWT.create().withIssuer(issuer).withSubject(subject).withIssuedAt(issueAt).withExpiresAt(expireAt).withNotBefore(issueAt).withJWTId(jti);
		
        @SuppressWarnings("rawtypes")
		Enumeration enumer = jwtConfig.getClaims().keys();
        while( enumer.hasMoreElements()) {
        	Object key = enumer.nextElement();
        	Object value = jwtConfig.getClaims().get(key);
        	
        	if(value instanceof List) {
        		String[] claimArray = ((List<String>) value).toArray(new String[0]);
        		builder.withArrayClaim( key.toString(), claimArray);
        	}
        	else if( value instanceof String) {
        		builder.withClaim(key.toString(), value.toString());
        	}
        	else if( value instanceof Integer ) {
        		builder.withClaim(key.toString(), (Integer)value);
        	}
        }
        
        
        Properties originalProperties = jwtConfig.getProperties();
        
		String permissionsRequired = originalProperties.getProperty("permissions.required");
        String permissionsCount = originalProperties.getProperty("permissions.count");
        if( permissionsRequired != null && "true".equalsIgnoreCase( permissionsRequired)) {
        	if( permissionsCount != null && permissionsCount.matches("\\d+")) {
        		
        		
        		List<Map> permissions = new ArrayList<Map>();
        		
        		
        		int count = Integer.parseInt(permissionsCount);
        		for(int i=1; i<= count; i++) {
        			
        			String subKey = "permissions." + i + ".sub";
        			String expKey = "permissions." + i + ".exp";
        			String resourceIdKey   = "permissions." + i + ".resource_id";
        			String resourceTypeKey = "permissions." + i + ".resource_type";
        			String scopesKey       = "permissions." + i + ".resource_scopes";
        			
        			
					String sub = originalProperties.getProperty(subKey);
					String resourceId   = originalProperties.getProperty(resourceIdKey);
					String resourceType = originalProperties.getProperty(resourceTypeKey);
					String[] resourceScopes = originalProperties.getProperty(scopesKey).split(";");        			
					String expStr = originalProperties.getProperty(expKey);
					
         			long exp = Long.parseLong(expStr) + System.currentTimeMillis() / 1000;
         			
         			Map map = new HashMap();
         			map.put("sub", sub);
         			map.put("exp", exp);
         			map.put("resource_scopes", resourceScopes);
         			map.put("resource_id",     resourceId);
         			map.put("resource_type",   resourceType);
         			
         			permissions.add( map );        			
        		}       
        		
        		builder.withClaim("permissions", permissions );
        	}
        }
        
        
        KeyContext keyCtx = KeyManager.getKeyCtx( keystore, password );
    	
        //builder.withClaim("api_client_id", clientId);
        builder.withClaim("certThumbPrint", keyCtx.getKid());
        
        
        String[] apiKeys = getApiKeys(clientId);
        builder.withArrayClaim("api_keys", apiKeys);
    	
        Map<String, Object> header = new HashMap<String, Object>();
        header.put("kid", keyCtx.getKid());
        header.put("x5t", keyCtx.getX5t());
        header.put("typ", "JWT");
        builder = builder.withHeader( header );
        
         
        Algorithm rsaAlg = Algorithm.RSA256( keyCtx.getPrivateKey());
        
        token = builder.sign(rsaAlg);

        return token;    	
    }
    
    
    public static String getApiKey(String clientId) {
        MessageDigest msgDigester = CacheManager.getInstance().getMessageDigester("SHA-256");
        byte[] theBytes = clientId.getBytes();
        msgDigester.update(theBytes);
        byte[] digest = msgDigester.digest();
        String token = Base64.getEncoder().encodeToString(digest);
        return token;
    }
    
    private static String[] getApiKeys(String clientId) throws Exception {
        
        List<String> idList = null;
        if( clientId.contains(";")) {
        	idList = Arrays.asList( clientId.split(";"));
        }
        else {
        	idList = Arrays.asList( new String[] {clientId});
        }
        
        List<String> apiKeys = idList.stream().map(id-> {return getApiKey(id);}).collect( Collectors.toList());
        
        return apiKeys.toArray( new String[] {});
    }
    

    
   /**
     * @param token
     * @return
     * @throws RuntimeException
     */
    public static Map<String,String> verifyToken(String token) throws RuntimeException{
        Algorithm algorithm = null;
        try {
            algorithm = Algorithm.HMAC256(SECRET);
        } catch ( Exception e) {
            throw new RuntimeException(e);
        }

        JWTVerifier verifier = JWT.require(algorithm).withIssuer(ISSUER).build();
        DecodedJWT jwt =  verifier.verify(token);
        Map<String, Claim> map = jwt.getClaims();
        Map<String, String> resultMap = new HashMap<>();
        map.forEach((k,v) -> resultMap.put(k, v.asString()));
        return resultMap;
    }
    
    
    private static void saveJWT2File(String apiCtx, String token) {
    	
    	String timeStamp = (new SimpleDateFormat("yyyyMMdd-hhmm")).format(new Date());
    	
    	String fileName = "JWT_" + apiCtx + "_" + timeStamp + ".txt";
    	
        BufferedWriter writer = null;
        try {
	        writer = new BufferedWriter(new FileWriter(fileName));
	        writer.write(token);         
	        writer.close();
        }
        catch(Exception exp) {
        	exp.printStackTrace();
        }    	
    }    
}