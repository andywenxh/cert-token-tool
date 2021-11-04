package com.eho.pcis.service;

import java.security.MessageDigest;
import java.util.Base64;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;

import com.eho.util.Jwt;

@Path("/token")
public class TokenService {

	@GET
	@Path("/jwt/{ctx}")
	@Produces("text/plain")
	public Response getJwtToken(@PathParam("ctx") String ctx) {
		
		String token = "";
		
		try {
			token = Jwt.genCtxToken(ctx, "BLUEWATER1.NODE_Keys04QA.JKS", "Keys04QA");
		} 
		catch (Exception e) {
		   String msg = e.getLocalizedMessage() ;
           return Response.serverError().entity( msg  ).build();
		}
		
		
		return Response.ok().entity(token).build();
	}
	
	@GET
	@Path("/sha256tobase64/{content}")
	@Produces("text/plain")
	public Response getSha256ToBase64(@PathParam("content") String content) {
		
		String token = "";
		
		try {

	        MessageDigest msgDigester = MessageDigest.getInstance("SHA-256");
	        byte[] theBytes = content.getBytes();
	        msgDigester.update(theBytes);
	        byte[] digest = msgDigester.digest();
	        token = Base64.getEncoder().encodeToString(digest);
		} 
		catch (Exception e) {
		   String msg = e.getLocalizedMessage() ;
           return Response.serverError().entity( msg  ).build();
		}
		
		
		return Response.ok().entity(token).build();
	}	
}
