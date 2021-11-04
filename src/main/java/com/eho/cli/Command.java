package com.eho.cli;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

public class Command {

	
	private static String[] validCommands = {"jwt", "certdetails", "x5t", "fingerprint", "apikey"};
	
	private static Map<String, List<String>> validParameter = new HashMap<String, List<String>>();
	
	static {
	   validParameter.put( "certdetails", Arrays.asList("keystore", "alias", "password", "cert"));	
       validParameter.put( "jwt",         Arrays.asList("keystore", "alias", "password", "template"));
       validParameter.put( "x5t",         Arrays.asList("keystore", "alias", "password", "cert", "hex"));
       validParameter.put( "fingerprint", Arrays.asList("keystore", "alias", "password", "cert"));
       validParameter.put( "apikey",      Arrays.asList("data"));
	}	
	
	private String command = "";
	
	private Map<String, List<String>> parameters = new HashMap<String, List<String>>();
	
	
	
	public Command(String[] args) {
	
		try {

		   if( args.length < 1 || !  Arrays.asList(validCommands).contains( args[0].toLowerCase()) ) {
			   throw new IllegalArgumentException();
		   }
		   
		   String latestParam = "";
		   int index = 0 ;
		   for(String argument : args) {
			   
			   if( index == 0 ) {
				   this.command = argument;
				   index = 1;
				   continue;
			   }
			   
			   
			   if( argument.startsWith("-")) {
				   latestParam = argument.substring(1);
				   if( ! parameters.containsKey(latestParam)) {
					   List<String> paramValues = new ArrayList<String>();
					   parameters.put( latestParam, paramValues );
				   }
			   }
			   else {				   
				   if( latestParam.length() == 0) {
					   throw new IllegalArgumentException();
				   }
				   
				   if( argument.startsWith("\"") && argument.endsWith("\"") ) {
					   argument = argument.substring(1, argument.length()-1);
				   }
				   else if ( argument.startsWith("'") && argument.endsWith("'") ) {
					   argument = argument.substring(1, argument.length()-1);
				   }
				   
				   parameters.get(latestParam).add(argument);
			   }        	   
		   }	   

		}
		catch(Exception exp) {
			displayCorrectCmd();
			System.exit(1);
		}		
	}
	
	private void displayCorrectCmd() {
		System.out.println("invalid command or parameters are used!");
		
		for(String command : validCommands ) {
			String line = "Cli " +  command ;
			for( String parameter : validParameter.get(command)) {
				line = line + " -" + parameter + " ABCDEFG" ;
			}
			
			System.out.println(line);			
		}
	}

	/**
	 * 
	 * @return
	 */
	public String getCommand() {
		return command;
	}

	/**
	 * 
	 * @return
	 */
	public Map<String, List<String>> getParameters() {
		return parameters;
	}
	
	@Override
	public String toString() {
		
		StringBuilder sb = new StringBuilder();
		sb.append("command:" + this.command + "\n");
		
		for(Entry<String, List<String>> entry : this.parameters.entrySet() ) {
			sb.append( entry.getKey() );
			sb.append( ":" );
			for(String p : entry.getValue()) {
				sb.append(p + " ");
			}
		}
	
		return sb.toString();		
	}
	
	
	
}
