<%@ page import ="java.sql.*" %>
<%
	session.setAttribute("userid", request.getAttribute("userid"));
	session.setAttribute("permission", request.getAttribute("permission"));
	session.setAttribute("success", request.getAttribute("success"));
	session.setAttribute("repo_name", request.getAttribute("repository"));
	session.setAttribute("username", request.getAttribute("username"));
	session.setAttribute("password", request.getAttribute("password"));
    response.sendRedirect("index.jsp?model=dm:DataSet");
%>