package com.eho.pcis.beans;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class OperationOutcome {

	public String errorCode = "";
	
	public String errorDetails = "";
	
	public OperationOutcome() {
		// TODO Auto-generated constructor stub
	}

}
