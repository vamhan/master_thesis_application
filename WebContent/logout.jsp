<%
	session.setAttribute("userid", null);
	session.setAttribute("permission", null);
	session.setAttribute("success", null);
	session.setAttribute("repo_name", null);
	session.setAttribute("username", null);
	session.setAttribute("password", null);
	session.invalidate();
	response.sendRedirect("index.jsp?model=ns:Dataset");
%>