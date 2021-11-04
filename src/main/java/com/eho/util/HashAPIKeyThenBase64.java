package com.eho.util;

public class HashAPIKeyThenBase64 {

	
	public static void main(String[] args) {
		
		if( args.length != 1 || args[0].trim().length() == 0) {
			System.out.println("please provide proper client id !!");
			return;
		}
		
		String[] clientIds = args[0].split(";");
		
		for(String clientid : clientIds ) {
			String apikey = Jwt.getApiKey( clientid );	
			System.out.println(  apikey + "\n");		
		}		
	}

}
