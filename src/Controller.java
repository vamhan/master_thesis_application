import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.StringReader;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class Controller extends HttpServlet {

	private static final long serialVersionUID = 1L;

	@Override
	public void doPost(HttpServletRequest request, HttpServletResponse response) {
		try {
			String namespace = java.net.URLDecoder.decode(request.getParameter("namespace"), "UTF-8");
			String repo_name = java.net.URLDecoder.decode(request.getParameter("repo_name"), "UTF-8").replace(":", "").replace("/", "_");
			File file = new File("../webapps/MetadataManagementTool/prefix/" + repo_name + "_namespace.json");
 
			// if file doesnt exists, then create it
			if (!file.exists()) {
				file.createNewFile();
			}
 
			FileWriter fw = new FileWriter(file.getAbsoluteFile());
			BufferedWriter bw = new BufferedWriter(fw);
			bw.write(namespace);
			bw.close();
 
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}