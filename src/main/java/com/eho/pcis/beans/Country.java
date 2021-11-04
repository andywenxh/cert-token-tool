package com.eho.pcis.beans;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class Country {

	public String name;
	
	public String code;
	
	public String dialCode;
	
	public Country() {

	}
	
	public Country(String name, String code, String dialCode) {
      this.name = name;
      this.code = code;
      this.dialCode = dialCode;
	}


	public String getName() {
		return name;
	}


	public String getCode() {
		return code;
	}


	public String getDialCode() {
		return dialCode;
	}


	public void setName(String name) {
		this.name = name;
	}


	public void setCode(String code) {
		this.code = code;
	}


	public void setDialCode(String dialCode) {
		this.dialCode = dialCode;
	}
}
