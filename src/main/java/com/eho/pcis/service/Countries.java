package com.eho.pcis.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.MissingResourceException;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.eho.pcis.beans.Country;
import com.eho.pcis.beans.OperationOutcome;

@Path("/country")
public class Countries {

	private static List<Country> countryList = new ArrayList<Country>();
	
	
	public Countries() {
		// TODO Auto-generated constructor stub
	}

	@GET
	@Path("/list")
	@Produces("application/json")
	public Response list() {		

		loadCountryList();		
		
		return Response.ok().entity( countryList ).build();		
	}


	
	@POST
	@Path("/match")
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	public Response searchTransactionFlow2JSon(Country country) {
		
		loadCountryList();
		
		Country foundCty = null;
		
		for( Country cty : countryList) {
			if( cty.getName().equalsIgnoreCase( country.getName()) 
				|| cty.getCode().equalsIgnoreCase( country.getCode())
				|| cty.getDialCode().equalsIgnoreCase( country.getDialCode()) ) {
				
				foundCty = cty;
				break;				
			}
		}
		
		
		if( foundCty == null ) {
			OperationOutcome outCome = new OperationOutcome();
			outCome.errorCode = "404";
			outCome.errorDetails = "no record match the given country";			
		    return Response.status( 404 ).entity( outCome ).build();			
		} 
		else {
			return Response.status( 200 ).entity( foundCty ).build();
		}
	}
		
	
	/**
	 * @throws MissingResourceException
	 */
	private void loadCountryList() throws MissingResourceException {
		if( countryList.isEmpty()) {
			
			String[] countryCodes = Locale.getISOCountries();

			for (String countryCode : countryCodes) {
			    Locale obj = new Locale("", countryCode);
			    Country cty = new Country(obj.getDisplayCountry(), obj.getCountry(), obj.getISO3Country());
                countryList.add(cty);
			}			
		}
	}	
	
}
