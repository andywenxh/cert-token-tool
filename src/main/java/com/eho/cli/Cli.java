package com.eho.cli;

public class Cli {

	public static void main(String[] args) {
       Command command = new Command(args);
       System.out.println(command);
	}

}
