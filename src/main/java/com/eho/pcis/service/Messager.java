package com.eho.pcis.service;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

import com.eho.pcis.beans.TimeHolder;


@Path("/msg")
public class Messager {

	@Context
	private UriInfo uriInfo;
	
	
	public Messager() {
 	}
	
	@GET
	@Produces(MediaType.TEXT_PLAIN)
	@Path("/hello")
	public String hello() {		
        return "hello rest service consumer !";
	}
	
	@GET
	@Path("/time")
	@Produces("application/json")
	public Response time() {
		TimeHolder timeHolder = new TimeHolder();		
		return Response.ok().entity( timeHolder ).build();		
	}
	
	@GET
	@Path("/ack")
	@Produces(MediaType.TEXT_PLAIN)
	public Response echoGet(@Context  HttpHeaders headers) {
		
		String pathString = uriInfo.getRequestUri().toString();
				
		
		System.out.println("\n\n\n\n\n");
		System.out.println("-----------------------------------------------------------------");
		System.out.println("------- Incoming path : " + pathString );
		System.out.println("------- Received incoming request with the following http header:");
		System.out.println("-----------------------------------------------------------------");
		MultivaluedMap<String, String> requestHeaders = headers.getRequestHeaders();
		for(String key : requestHeaders.keySet() ) {
			System.out.println(String.format("%s=%s", key, requestHeaders.getFirst(key)));
		}

		String content = "ACK\n" + pathString;
		
		return Response.ok().entity( content ).build();		
	}
	
	
	
	@POST
	@Path("/echo")
	@Produces({MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML, MediaType.TEXT_PLAIN})
	@Consumes({MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML, MediaType.TEXT_PLAIN})
	public Response echoPost(String input, @Context  HttpHeaders headers) {
		
		String pathString = uriInfo.getRequestUri().toString();
				
		
		System.out.println("\n\n\n\n\n");
		System.out.println("-----------------------------------------------------------------");
		System.out.println("------- Incoming path : " + pathString );
		System.out.println("------- Received incoming request with the following http header:");
		System.out.println("-----------------------------------------------------------------");
		MultivaluedMap<String, String> requestHeaders = headers.getRequestHeaders();
		for(String key : requestHeaders.keySet() ) {
			System.out.println(String.format("%s=%s", key, requestHeaders.getFirst(key)));
		}

		System.out.println("-----------------------------------------------------------------");
		System.out.println("-------    Received incoming message body:");
		System.out.println("-----------------------------------------------------------------");
		System.out.println(input);
		
		
		
		String contentType = requestHeaders.getFirst("Content-Type");		
		return Response.ok().type(contentType).entity( input ).build();		
	}	
}
