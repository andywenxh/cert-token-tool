package com.eho.pcis.beans;

import java.util.Random;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class PCOIContext {

	
	public String contextSessionID;
	
	public String contextTopic;
	
	public String version;
	
	public String status;
	
	public String operation;
	
	public PCOIContext() {
		
	}
	
	public static PCOIContext getInstance() {
		PCOIContext instance = new PCOIContext();
		Random r =  new Random();
		
		instance.contextSessionID = System.currentTimeMillis() + "";
		instance.contextTopic = r.nextLong() + "";
		instance.version = "1.0.3";
		instance.status = "Success";
		instance.operation = "GET or PUT";		
		
		return instance;
	}
}
