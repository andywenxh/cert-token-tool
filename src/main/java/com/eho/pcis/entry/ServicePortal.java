package com.eho.pcis.entry;

import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.HttpConfiguration;
import org.eclipse.jetty.server.HttpConnectionFactory;
import org.eclipse.jetty.server.SecureRequestCustomizer;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.server.SslConnectionFactory;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.eclipse.jetty.util.ssl.SslContextFactory;
import org.glassfish.jersey.servlet.ServletContainer;

import com.eho.util.KeyContext;
import com.eho.util.KeyManager;
import com.eho.util.ResourceLoader;

public class ServicePortal {

	private static final String SERVICE_POOL_PROPERTIES = "/ServicePool.properties";

	private static final String API_PATH = "/api/*";
	
	private static final String SERVICE_PACKAGE = "com.eho.pcis.service";
	
	
	public ServicePortal() {


	
	}

    public static void main(String[] args) throws Exception {
    	
        Server server = configureServer();
    	
        ServletContextHandler contextHandler = new ServletContextHandler(ServletContextHandler.NO_SESSIONS);                
        contextHandler.setContextPath("/");
        server.setHandler(contextHandler);

        ServletHolder servletHolder = contextHandler.addServlet(ServletContainer.class, API_PATH);
        servletHolder.setInitOrder(1);
        servletHolder.setInitParameter("jersey.config.server.provider.packages", SERVICE_PACKAGE );
        
        
        try {
            server.start();
            server.join();
        } 
        catch (Exception ex) {
            Logger.getLogger(ServicePortal.class.getName()).log(Level.SEVERE, null, ex);
        } 
        finally {
            server.destroy();
        }
    }
    
    private static Server configureServer() throws Exception {
    	
    	Server server = null;
    	
    	Properties property = ResourceLoader.getProperties(SERVICE_POOL_PROPERTIES);
        int serverPort = Integer.parseInt(property.getProperty("server.port", "9999"));
        String httpsEnabled = property.getProperty("server.httpsEnabled", "false");
    	
        if( "false".equalsIgnoreCase(httpsEnabled)) {
          server = new Server(serverPort);
        }
        else {
        	
        	   server = new Server();
        	
        	   HttpConfiguration httpsConfig = new HttpConfiguration();
               httpsConfig.addCustomizer(new SecureRequestCustomizer());
               HttpConnectionFactory httpConnFactory = new HttpConnectionFactory(httpsConfig);
        
               // Configuring SSL and Defining key-store path and passwords
               KeyContext keyContext = KeyManager.getKeyCtx("BLUEWATER1.NODE_Keys04QA.JKS", "Keys04QA");
               SslContextFactory sslCtxFactory = new SslContextFactory();
               sslCtxFactory.setKeyStore(keyContext.getKeyStore());
               sslCtxFactory.setKeyStorePassword(keyContext.getPasswd());
               sslCtxFactory.setKeyManagerPassword(keyContext.getPasswd());
               
         
               // Configuring the connector
               SslConnectionFactory sslConnFactory = new SslConnectionFactory(sslCtxFactory, "http/1.1");
			   ServerConnector sslConnector = new ServerConnector(server, sslConnFactory, httpConnFactory);
               sslConnector.setPort(serverPort);
               
               server.setConnectors(new Connector[]{ sslConnector});        	
        }

        
        
        displayServerInfo(serverPort);
        
        return server;
    	
    }

	private static void displayServerInfo(int serverPort) {
		System.out.println("*************************************************************");
        String msg = String.format("Server is start at port [%d] with context [%s]", serverPort, API_PATH);
        System.out.println(msg);
        
        
        
        
        
        
        System.out.println("*************************************************************");
	}	
	
}
