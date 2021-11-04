package com.eho.temp;

public class Temp1 {

	
	public static void main(String[] args) {
		String value = "[a7608f02-b43a-414b-8dea-e1431d2c4abc]";
		
		value = value.replaceAll("\\[", "");
		value = value.replaceAll("\\]", "");
		System.out.println(value);
		
		
	}
	
	
}
