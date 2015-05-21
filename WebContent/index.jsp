<%@ page import="java.util.Arrays" %>
<!DOCTYPE html>
<!-- Template by html.am -->
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>Fixed Width 1 Green</title>
<link rel="stylesheet" type="text/css" href="_styles.css" />
<link rel="stylesheet" type="text/css"
	href="jquery/css/ui-lightness/jquery-ui-1.8.23.custom.css" />
<script type="text/javascript" src="jquery/jquery-1.7.1.min.js"></script>
<script type="text/javascript"
	src="jquery/jquery-ui-1.8.20.custom.min.js"></script>
<script type="text/javascript" src="jquery/config.js"></script>
<script type="text/javascript" src="jquery/treeExploration.js"></script>
<% 
	String[] nodes = {"ns:Dataset", "ns:Feature", "ns:DataProperty", "ns:Operation", "ns:MiningModel", "ns:Dictionary"};
%>
</head>
<body>
	
	<div id="dialog-form" title="">
		<p id="edit_title"></p>
		<p class="validateTips"></p>

		<form>
			<fieldset>
				<div id="edit_predicate_div">
					<label id="edit_predicate_label" for="edit_object">Predicate</label> 
					<input type="text" id="edit_predicate" value="" class="text ui-widget-content ui-corner-all" style="width: 100%">
					<select id="edit_predicate_dropdown" onchange="prepareObjectDropdown($(this).val())">
					</select>
				</div>
				<div>
					<label for="edit_object">Object</label>
					<select id="edit_object">
					</select>
				</div>
				<div id="edit_new_object_div">
					<label id="edit_new_object_label"></label> 
					<input type="text" id="edit_new_object" value="" class="text ui-widget-content ui-corner-all" style="width: 100%">
				</div>
				<div id="edit_label_div">
					<label for="edit_label">Label</label> 
					<input type="text" id="edit_label" value="" class="text ui-widget-content ui-corner-all" style="width: 100%">
				</div>
				<div id="edit_type_div">
					<label id="edit_type_label">Type</label> 
					<select id="edit_type" onchange="objectChange();">
					</select>
				</div>
				<!-- Allow form submission with keyboard without duplicating the dialog button -->
				<input type="submit" tabindex="-1"
					style="position: absolute; top: -1000px">
			</fieldset>
		</form>
	</div>
	
	<div id="dialog-form-model" title="Edit Model">
		<p id="edit_model_title"></p>
		<p class="validateTips"></p>

		<form>
			<fieldset>
				<div>
					<label for="edit_object">Object</label> 
					<input type="text" id="edit_object_model" value="" class="text ui-widget-content ui-corner-all" style="width: 100%">
				</div>
				<div>
					<label for="edit_label">Label</label> 
					<input type="text" id="edit_label_model" value="" class="text ui-widget-content ui-corner-all" style="width: 100%">
				</div>
				<!-- Allow form submission with keyboard without duplicating the dialog button -->
				<input type="submit" tabindex="-1"
					style="position: absolute; top: -1000px">
			</fieldset>
		</form>
	</div>
	
	<div id="dialog-confirm" title="Delete Triple">
	  <p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span>This triple will be permanently deleted and cannot be recovered. Are you sure?</p>
	</div>
	
	<div id="dialog-form-ontology" title="View External Ontology">
		<p id="load_ontology_title"></p>
		<p class="validateTips"></p>

		<form>
			<fieldset>
				<div>
					<label for="edit_object">Endpoint URL</label> 
					<input type="text" id="endpoint" value="http://dbpedia.org/sparql" class="text ui-widget-content ui-corner-all" style="width: 100%">
				</div>
				<div id="ontology_div">
					<label for="edit_label">Ontology URL</label> 
					<input type="text" id="ontology" value="&lt;http://dbpedia.org/ontology/PopulatedPlace&gt;" class="text ui-widget-content ui-corner-all" style="width: 100%">
				</div>
				<div id="resource_div">
					<label for="edit_label">Resource URL</label> 
					<input type="text" id="resource" value="&lt;http://dbpedia.org/resource/Barcelona&gt;" class="text ui-widget-content ui-corner-all" style="width: 100%">
				</div>
				<div id="typeof_div">
					<label for="edit_label">rdf:type of</label> 
					<input type="text" id="typeof" value="" class="text ui-widget-content ui-corner-all" style="width: 100%">
				</div>
				<!-- Allow form submission with keyboard without duplicating the dialog button -->
				<input type="submit" tabindex="-1"
					style="position: absolute; top: -1000px">
			</fieldset>
		</form>
	</div>
	
	<form id="import_form" method="POST" enctype="multipart/form-data" action="./import" style="display:none">
		<input id="import_file" type="file" name="file">
	</form>
	
	<input id="info_predicate" style="display: none" /> 
	<input id="old_object" style="display: none" />

	<div id="page">
		<header id="header">
			<div id="header-inner">
				<div id="logo">
					<h1>
						<a href="#">Cool<span>Logo</span></a>
					</h1>
				</div>
				<div id="top-nav">
					<ul>
						<li><a href="./?model=ns:Dataset">Main</a></li>
						<li><a href="./?metamodel">View Model</a></li>
						<li><a href="#" id="import_model">Import Model</a></li>
						<li><a href="#" id="import_instance">Import Instance</a></li>
						<li><a href="http://localhost:8890/sparql-auth">Sparql Endpoint</a></li>
						<li><a href="#">Login</a></li>
					</ul>
				</div>
				<div class="clr"></div>
			</div>
		</header>
		<div class="feature">
			<div class="feature-inner">
				<h1>Heading</h1>
			</div>
		</div>


		<div id="content">
			<div id="content-inner">

				<nav id="sidebar">
					<div class="widget" id="tree_menu"></div>
				</nav>
				
				<% if (request.getParameter("model") != null) { %>
					<h1>Model Level</h1>
					<h2 id='info_subject'><%= request.getParameter("model") %></h2>
				<% } else if (request.getParameter("instance") != null) { %>
					<h1>Instance Level</h1>
					<h2 id='info_subject'><%= request.getParameter("instance") %></h2>
				<% } %>
				
				<main id="contentbar">
				<% if (request.getParameter("model") != null) { %>
					<div id="add_instance_button"><button onclick='openEditModelPopup(true)'>Add New Instance</button></div>
					<div id="add_subclass_button"><button onclick='openEditModelPopup(false)'>Add Subclass</button></div>
					<% if (request.getParameter("dictionary") != null) { %>
						<div id="load_ontology_button"><button onclick='openLoadOntologyPopup(true)'>View External Ontology</button></div>
						<div id="load_resource_button"><button onclick='openLoadOntologyPopup(false)'>View External Resource</button></div>
				<% }} %>
				
				<% if (request.getParameter("instance") != null) {
					if (request.getParameter("dictionary") != null) {%>
						<div id="samantic_usage_button"><button onclick='viewSamanticUsage()'>View Samantic Usage</button></div>
					<% } %>
				    <div id="add_predicate_button"><button onclick='openEditPopup("", "", true, "instance")'>Add Property</button></div>
				<% } else if (request.getParameter("model") != null){
					if (!Arrays.asList(nodes).contains(request.getParameter("model"))) {
					%>
					<div id="add_predicate_button"><button onclick='openEditPopup("", "", true, "model")'>Add New Predicate</button></div>
					<% } %>
				<% } %>
				</main>
				
				<% if (request.getParameter("instance") != null) { %>
					<iframe id="graphFrame" src="./graph.jsp?url=<%= request.getParameter("instance") %>&type=instance" height="600px" width="1100px"></iframe>
				<% } else if (request.getParameter("model") != null){ %>
					<iframe id="graphFrame" src="./graph.jsp?url=<%= request.getParameter("model") %>&type=model" height="600px" width="1100px"></iframe>
				<% } else if (request.getParameter("metamodel") != null) { %>
					<iframe id="graphFrame" src="./graph.jsp?url=&type=metamodel" height="600px" width="1100px"></iframe>
				<% } %>

				<div class="clr"></div>
			</div>
		</div>

		<div id="footerblurb">
			<div id="footerblurb-inner">

				<div class="column">
					<h2>
						<span>Heading</span>
					</h2>
					<p></p>
				</div>
				<div class="column">
					<h2>
						<span>Heading</span>
					</h2>
					<p></p>
				</div>
				<div class="column">
					<h2>
						<span>Heading</span>
					</h2>
					<p></p>
				</div>

				<div class="clr"></div>
			</div>
		</div>
		<footer id="footer">
			<div id="footer-inner">
				<p>
					&copy; Copyright <a href="#">Your Site</a> &#124; <a href="#">Terms
						of Use</a> &#124; <a href="#">Privacy Policy</a>
				</p>
				<div class="clr"></div>
			</div>
		</footer>
	</div>


	<script type="text/javascript">
			
		$(function() {
			initPrefix("main.json");

			<% for (int i = 0; i < nodes.length - 1; i++) { %>
				retrieveTree(<%= "\"" + nodes[i] + "\"" %>);
			<% } %>
			
			$("#tree_menu").append("<hr>");
			
			retrieveTree("ns:Dictionary");
			
			<% if (request.getParameter("model") != null) { %>
				retrieveProperties(<%= "\"" + request.getParameter("model") + "\""  %>, "model", <%= request.getParameter("dictionary") != null ? true : false %>, <%= Arrays.asList(nodes).contains(request.getParameter("model")) ? true : false %>);
				highlight(<%= "\"" + request.getParameter("model") + "\""  %>);
			<% } else if (request.getParameter("instance") != null) { %>
				retrieveProperties(<%= "\"" + request.getParameter("instance") + "\"" %>, "instance", <%= request.getParameter("dictionary") != null ? true : false %>);
				highlight(<%= "\"" + request.getParameter("instance") + "\""  %>);
			<% } %>
			
			$("#import_model").on('click', function(e){
		        e.preventDefault();
		        $("#import_file").change(function(){
		        	importFile("model");
		    	});
		        $("#import_file").trigger('click');
		    });
		    $("#import_instance").on('click', function(e){
		        e.preventDefault();
		        $("#import_file").change(function(){
		        	importFile("instance");
		    	});
		        $("#import_file").trigger('click');
		    });
		});
		
		$(function() {
			var dialog, form;

			dialog = $("#dialog-form").dialog({
				autoOpen : false,
				height : 400,
				width : 400,
				modal : true,
				buttons : {
					"Edit" : addTriple,
					Cancel : function() {
						dialog.dialog("close");
					}
				},
				close : function() {
					$(".validateTips").html("");
				}
			});

			form = dialog.find("form").on("submit", function(event) {
				event.preventDefault();
				editTriple();
			});
		});
		
		// edit model popup
		$(function() {
			var dialog, form;

			dialog = $("#dialog-form-model").dialog({
				autoOpen : false,
				height : 350,
				width : 350,
				modal : true,
				buttons : {
					"Add" : function() {
						editModel();
					},
					Cancel : function() {
						dialog.dialog("close");
					}
				}
			});

			form = dialog.find("form").on("submit", function(event) {
				event.preventDefault();
				editModel();
			});
		});
		
		// load ontology popup
		$(function() {
			var dialog, form;
			
			$("resource_div").hide();

			dialog = $("#dialog-form-ontology").dialog({
				autoOpen : false,
				height : 350,
				width : 350,
				modal : true,
				buttons : {
					"Retrieve" : function() {
						retrieveOntology();
					},
					Cancel : function() {
						dialog.dialog("close");
						$("resource_div").hide();
					}
				}
			});

			form = dialog.find("form").on("submit", function(event) {
				event.preventDefault();
				editModel();
			});
		});

		// delete triple popup
		$(function() {
			$("#dialog-confirm").dialog({
				autoOpen : false,
				resizable : false,
				height : 200,
				modal : true,
				buttons : {
					"Delete" : function() {
						deleteTriple();
					},
					Cancel : function() {
						$(this).dialog("close");
					}
				}
			});
		});
	</script>
</body>
</html>