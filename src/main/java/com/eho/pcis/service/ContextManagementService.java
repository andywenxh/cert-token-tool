package com.eho.pcis.service;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

import com.eho.pcis.beans.PCOIContext;

@Path("/cms")
public class ContextManagementService {

	@Context
	private UriInfo uriInfo;
	
	
	@Context  
	private HttpHeaders headers; 
	
	@GET
	@Path("/context")
	@Produces("application/json")
	public Response list() {	
		
		String pathString = uriInfo.getRequestUri().toString();
		MultivaluedMap<String, String> requestHeaders = headers.getRequestHeaders();
		System.out.println("-----------------------------------------------------------------");
		System.out.println("incoming path : " + pathString );
		System.out.println("------- Received incoming request with the following http header:");
		for(String key : requestHeaders.keySet() ) {
			System.out.println(String.format("%s=%s", key, requestHeaders.getFirst(key)));
		}
		System.out.println("-----------------------------------------------------------------\n\n");
		
		return Response.ok().entity( PCOIContext.getInstance() ).build();		
	}
	
	@PUT
	@Path("/context")
	@Produces({MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML, MediaType.TEXT_PLAIN})
	@Consumes({MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML, MediaType.TEXT_PLAIN})
	public Response echo(String input) {
		
		String pathString = uriInfo.getRequestUri().toString();
		
		System.out.println("\n");
		System.out.println("-----------------------------------------------------------------");
		System.out.println("------- incoming call: " + pathString );
		System.out.println("------- Received incoming request with the following http header:");
		System.out.println("-----------------------------------------------------------------");
		MultivaluedMap<String, String> requestHeaders = headers.getRequestHeaders();
		for(String key : requestHeaders.keySet() ) {
			System.out.println(String.format("%s=%s", key, requestHeaders.getFirst(key)));
		}

		System.out.println("-----------------------------------------------------------------");
		System.out.println("-------  Received incoming message body:                         ");
		System.out.println("-----------------------------------------------------------------");
		System.out.println(input);
		
		
		
		String contentType = requestHeaders.getFirst("Content-Type");		
		return Response.ok().type(contentType).entity( input ).build();		
	}	
	
	
}
