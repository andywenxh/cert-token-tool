package com.eho.yaml;

import java.util.Map;

import org.yaml.snakeyaml.Yaml;

import com.eho.tools.FileUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;

public class YamlOne {
	
	
	
	public static void main(String[] args) throws Exception {
		
		Source source = new Source();
		String yamlString = FileUtil.loadFileIntoString("prehook.yaml");
		//System.out.println( yamlString );
		
		//source.setSource(fileContent);
		
		//source.setSource( "aa aaaa aaaa aaa aaaaa \r\n aaa aaaa aaa aaaa a  aaa aa aa aaa aa aa aa aa a a a");
		ObjectMapper mapper = new ObjectMapper(new YAMLFactory());

	    Yaml yaml = new Yaml();
		 
		 
		 Map<String, Object> obj = yaml.load(yamlString);

		
		
		String result = mapper.writeValueAsString(obj);

        System.out.println(result);
		
		
		//System.out.println( output );
		
	}

}
