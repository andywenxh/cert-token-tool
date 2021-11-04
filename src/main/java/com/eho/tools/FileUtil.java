package com.eho.tools;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

public class FileUtil {

	public FileUtil() {
	}
	
	public static void main(String[] args) {
		getFileList("c:/", "ppt").stream().forEach( name -> System.out.println(name));
	}
	
	
	public static List<File> getFileList(String folderName, String fileExtention) {
		
		List<File> logFiles = new ArrayList<File>();		
		File directory = new File( folderName );
		
		if( directory.exists() && directory.isDirectory() ) {
			
			File[] files = directory.listFiles();
			for(File file : files) {
				if( file.isFile() ) {				
				   String fileName = file.getName();
				   if( fileName.toLowerCase().endsWith("." + fileExtention.toLowerCase())) {					   
					   logFiles.add(file);					   
				   }
				}				
			}
		}
		
		
		return logFiles;
	}
	
	
	/**
	 * initial a configuration file, load the content if it exist, or create an empty file
	 * @param fileName
	 * @return
	 */
	public static List<String> initConfigFile(String fileName) {
		List<String> lines = new ArrayList<String>();

		File file = new File(fileName);
		if( file.exists() ) {
			List<String> linesLoaded = loadFileByLines(fileName);
			lines.addAll(linesLoaded);
		}
		else {
			try {
			  FileWriter out = new FileWriter(file);
			  BufferedWriter writer = new BufferedWriter(out);
			  writer.write("");
			  writer.close();
			  out.close();
			}
			catch(Exception exp) {
				
			}
		}		
		return lines;		
	}

	/**
	 * load a text file into line list
	 * @param file
	 * @return
	 */
	public static List<String> loadFileByLines(String file) {
		List<String> lines = new ArrayList<String>();
		
		BufferedReader lineReader = null;
		
		try {
		    java.io.FileReader in = new java.io.FileReader(new File(file));
			lineReader = new BufferedReader(in);
			
			String oneLine = lineReader.readLine();
			while( oneLine != null ) {				
				lines.add(oneLine);
				oneLine = lineReader.readLine();
			}			
			lineReader.close();
			in.close();		
		}
		catch(Exception exp) {
			
		}		
		
		return lines;
	}
	
	
    /**
     * 
     * @param file
     * @param lines
     * @throws IOException
     */
	public static void writeFileByLines(String file, List<String> lines ) throws IOException {
		File fout = new File( file );
		FileOutputStream fos = new FileOutputStream(fout);	 
		BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(fos));
	 
		for (int i = 0; i < lines.size(); i++) {
			bw.write( lines.get(i));
			bw.newLine();
		}
	 
		bw.close();
	}	
	
	/**
	 * 
	 * @param file
	 * @return
	 * @throws Exception
	 */
	public static String loadFileIntoString(String file) throws Exception {		
		String contents = new String(Files.readAllBytes(Paths.get(file)));
		return contents;		
	}
	
	/**
	 * 
	 * @param length
	 * @return
	 */
	public static String createPadding(int length) {
	
		StringBuilder sb = new StringBuilder();
		for (int i = 0; i < length; i++) {
		    sb.append(' ');
		}
		return sb.toString();		
	}
	
	/**
	 * 
	 * @param fileName
	 * @param line
	 */
    public static void appendStringToFile(String fileName, String line) {
    	File file = new File(fileName);
    	FileWriter fileWriter = null;    	
    	BufferedWriter bufferedWriter = null;    	
    	try {
	    	fileWriter = new FileWriter(file, true);
	    	bufferedWriter = new BufferedWriter(fileWriter);
	    	bufferedWriter.newLine();
	    	bufferedWriter.write(line);	    	
	    	bufferedWriter.close();
	    	fileWriter.close();    	
    	}
    	catch(Exception exp) {
    		exp.printStackTrace();
    	}    	
    }
	

}
