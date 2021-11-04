package com.eho.util;

import java.util.Base64;

public class Hex2ByteAndThenBase64 {

	public static void main(String[] args) {

		String hexString = args[0];
		if (hexString == null) {
			System.out.println("HEX string is missing");
			return;
		}
		
		hexString = hexString.replaceAll(":", "");
		
		
		if (hexString.length() % 2 > 0) {
			System.out.println("HEX string is not in pair");
			return;
		}

		byte[] theBytes = new byte[hexString.length() / 2];
		for (int i = 0; i < theBytes.length; i++) {
			int index = i * 2;
			int j = Integer.parseInt(hexString.substring(index, index + 2), 16);
			theBytes[i] = (byte) j;
		}
		
        String hashBase64 = Base64.getEncoder().encodeToString(theBytes);
        System.out.println("base64 encoded bytes:" + hashBase64);

        

	}

}
