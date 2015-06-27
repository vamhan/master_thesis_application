import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Login extends HttpServlet {

	private static final long serialVersionUID = 1L;
	private static String host = "http://localhost:8081/myapp";

	@Override
	public void doPost(HttpServletRequest request, HttpServletResponse response) {
		HttpClient client = new DefaultHttpClient();
    	HttpGet get = new HttpGet(host + "/login?repo_name=" + request.getParameter("repository"));
    	HttpResponse APIresponse;
    	HttpEntity entity;
		
		String authString = request.getParameter("username") + ":" + request.getParameter("password");
		byte[] authEncBytes = Base64.encodeBase64(authString.getBytes());
		String authStringEnc = new String(authEncBytes);
		get.setHeader("Authorization", "Basic " + authStringEnc);
		
		try {
			APIresponse = client.execute(get);
			entity = APIresponse.getEntity();
	    	String retSrc = EntityUtils.toString(entity); 
	    	System.out.println(retSrc);
	    	JSONObject result = new JSONObject(retSrc);
			HttpEntity enty = APIresponse.getEntity();
	        if (enty != null)
	            enty.consumeContent();
		
	    	request.setAttribute("userid", result.length() == 0 ? null : result.get("userid"));
		    request.setAttribute("permission", result.length() == 0 ? null : result.get("permission"));
		    request.setAttribute("success", result.length() == 0 ? "false" : "true");
		    request.setAttribute("repository", request.getParameter("repository"));
		    request.setAttribute("username", request.getParameter("username"));
		    request.setAttribute("password", request.getParameter("password"));
			getServletConfig().getServletContext()
					.getRequestDispatcher("/loginHandle.jsp")
					.forward(request, response);
		} catch (ServletException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}