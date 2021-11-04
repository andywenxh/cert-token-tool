package com.eho.util;

import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.Properties;

public class ResourceLoader {
	
	
	public static Properties getProperties(String name) throws Exception {		
		Properties properties = new SequencedProperties();
		InputStream is = ResourceLoader.class.getResourceAsStream(name);
		
		if( is == null ) {
			throw new FileNotFoundException("perperties file [" + name + "] is not found under the class path !!");
		}
		
		properties.load(is);		
		return properties;
	}

}
