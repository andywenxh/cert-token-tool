package com.eho.yaml;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.yaml.snakeyaml.Yaml;

import com.eho.tools.FileUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;

public class YamlMaker {
	
	
	public static ObjectMapper mapper = new ObjectMapper(new YAMLFactory());

	public static void main(String[] args) throws Exception {
		
		if( args.length == 0) {
			return;
		}
		
		
		
		String yamlTemplate = FileUtil.loadFileIntoString( args[0]);
	    Yaml yaml = new Yaml();
        Map<String, Object> yamlMap = yaml.load(yamlTemplate);
        

        for( Entry<String, Object> entry : yamlMap.entrySet()) {
        	
        	String key = entry.getKey();
        	Object value = entry.getValue();
        	
        	System.out.println(key);
        	System.out.println( value );
        	
        }
        
		
//		
//		
//		
//		
//		List<String> lines = FileUtil.loadFileByLines(args[0]);
//		List<String> outLines = new ArrayList<String>();
//		
//		String yamlName = "";
//		String yamlVersion = "";
//		String currentTopElement = "";
//		
//        for(String line : lines ) {
//			String trimedLine = line.trim();
//			String tagName = "";			
//			
//			if( ! line.startsWith(" ")) {				
//				tagName = trimedLine.split(":")[0];
//				currentTopElement = tagName;
//			}
//			
//			if( trimedLine.startsWith("yamlmake:") || trimedLine.startsWith("yamlmaketarget:")) {
//				continue;
//			}
//			
//			if( trimedLine.startsWith("#global-policy")) {
//				outLines.add( line.substring(1) );
//				continue;
//			}
//			
//			
//			if( currentTopElement.equalsIgnoreCase("info")) {
//			
//				String[] fields = trimedLine.split(":");
//				String tag = fields[0];
//				String val = "";
//				
//				if( fields.length > 1) { 						
//					val = fields[1];
//				}
//				
//				if( "name".equalsIgnoreCase(tag) || "x-ibm-name".equalsIgnoreCase(tag)) {
//				    yamlName = val.trim();
//				}
//				else if("version".equalsIgnoreCase(tag)) {
//					yamlVersion = val.trim();
//				}				
//			}
//			
//			if( trimedLine.startsWith("requires:")) {				
//				String composedLine = parseRequiredLine( line );
//				outLines.add( composedLine );
//			}
//			else {
//				outLines.add( line );
//			}			
//        }        
//        
//        String outFileName = yamlName + yamlVersion + ".yaml";
//        FileUtil.writeFileByLines(outFileName, outLines);
		
	}

	private static String parseRequiredLine(String line) throws Exception {
		
		List<String> outLines = new ArrayList<String>();

		int paddingLength = line.indexOf("requires:") ;
		
		String fileName = line.trim().split(":")[1].trim();		
		String fileContent = FileUtil.loadFileIntoString(fileName);
		
		Source source = new Source();
		source.setSource( fileContent );
		

		String result = mapper.writeValueAsString(source);
		result = result.trim();
		result = result.substring(4);
		
		
		System.out.println( result );
		
		
		String composedLine = "";
		
		String[] lines = result.split("\n");
        for(int i=0; i < lines.length; i++ ) {

        	
        	String newLine = lines[i].trim();
        	if( newLine.startsWith("\\ ")) {        		
        		newLine = newLine.substring(1);        		
        	}
        	
        	if( newLine.endsWith("\\")) {
        		newLine = newLine.substring(0, newLine.length() - 1);
        	}
        	
        	composedLine = composedLine + newLine;
        }
		
        
        String pad = FileUtil.createPadding( paddingLength );
        composedLine = pad + composedLine;
        
		return composedLine;
		
	}	
}
