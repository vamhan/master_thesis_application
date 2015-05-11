
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
</head>
<body>
	<div id="dialog-form" title="Edit Triple">
		<p class="validateTips"></p>

		<form>
			<fieldset>
				<div>
					<label for="edit_object">Object</label> 
					<input type="text" id="edit_object" value="" class="text ui-widget-content ui-corner-all" style="width: 100%">
				</div>
				<div id="edit_label_div">
					<label for="edit_label">Label</label> 
					<input type="text" id="edit_label" value="" class="text ui-widget-content ui-corner-all" style="width: 100%">
				</div>
				<!-- Allow form submission with keyboard without duplicating the dialog button -->
				<input type="submit" tabindex="-1"
					style="position: absolute; top: -1000px">
			</fieldset>
		</form>
	</div>
	
	<div id="dialog-form-predicate" title="Add new predicate">
		<p class="validateTips"></p>

		<form>
			<fieldset>
				<div id="edit_predicate_div">
					<label for="edit_object">Predicate</label> 
					<input type="text" id="edit_predicate" value="" class="text ui-widget-content ui-corner-all" style="width: 100%">
				</div>
				<div>
					<label for="edit_object">Object</label> 
					<input type="text" id="edit_object_predicate" value="" class="text ui-widget-content ui-corner-all" style="width: 100%">
				</div>
				<div id="edit_label_predicate_div">
					<label for="edit_label">Label</label> 
					<input type="text" id="edit_label_predicate" value="" class="text ui-widget-content ui-corner-all" style="width: 100%">
				</div>
				<div id="edit_type_predicate_div">
					<label for="edit_type">Type</label> 
					<input type="text" id="edit_type_predicate" value="" class="text ui-widget-content ui-corner-all" style="width: 100%">
				</div>
				<!-- Allow form submission with keyboard without duplicating the dialog button -->
				<input type="submit" tabindex="-1"
					style="position: absolute; top: -1000px">
			</fieldset>
		</form>
	</div>
	
	<div id="dialog-form-model" title="Edit Model">
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
						<li><a href="#">About</a></li>
						<li><a href="#">Contact</a></li>
						<li><a href="#">FAQ</a></li>
						<li><a href="#">Help</a></li>
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
				
				<main id="contentbar"></main>
				<% if (request.getParameter("model") != null) { %>
	
					<div id="add_predicate_button"><button onclick='openEditPredicate("", "", true, true)'>Add New Predicate</button></div>
					<div id="add_instance_button"><button onclick='openEditModelPopup(true)'>Add New Instance</button></div>
					<div id="add_subclass_button"><button onclick='openEditModelPopup(false)'>Add Subclass</button></div>
				<% } %>
				
				<% if (request.getParameter("model") != null) { %>
					<iframe src="./graph.jsp?url=<%= request.getParameter("model") %>&type=model" height="600px" width="1100px"></iframe>
				<% } else { %>
					<iframe src="./graph.jsp?url=<%= request.getParameter("instance") %>&type=instance" height="600px" width="1100px"></iframe>
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
			//retrieveProperties("<http://dbtune.org/bbc/peel/session/586>");
			<% if (request.getParameter("model") != null) { %>
				retrieveTree("ns:Dictionary", <%= "\"" + request.getParameter("model") + "\"" %>, "model");
			<% } else if (request.getParameter("instance") != null) { %>
				retrieveTree("ns:Dictionary", <%= "\"" + request.getParameter("instance") + "\"" %>, "instance");
			<% } else { %>
				retrieveTree("ns:Dictionary");
			<% } %>
		});

		// edit triple popup
		$(function() {
			var dialog, form;

			$("#edit_label_div").hide();
			$("#edit_type_div").hide();
			$("#edit_predicate_div").hide();

			dialog = $("#dialog-form").dialog({
				autoOpen : false,
				height : 350,
				width : 350,
				modal : true,
				buttons : {
					"Edit" : editTriple,
					Cancel : function() {
						dialog.dialog("close");
					}
				},
				close : function() {
					$(".validateTips").html("");
					$("#edit_label_div").hide();
					$("#edit_type_div").hide();
					$("#edit_predicate_div").hide();
				}
			});

			form = dialog.find("form").on("submit", function(event) {
				event.preventDefault();
				editTriple();
			});
		});
		
		// add new predicate
		$(function() {
			var dialog, form;

			$("#edit_label_predicate_div").hide();
			$("#edit_type_predicate_div").hide();
			$("#edit_predicate_div").hide();

			dialog = $("#dialog-form-predicate").dialog({
				autoOpen : false,
				height : 350,
				width : 350,
				modal : true,
				buttons : {
					"Edit" : editTriple,
					Cancel : function() {
						dialog.dialog("close");
					}
				},
				close : function() {
					$(".validateTips").html("");
					$("#edit_label_predicate_div").hide();
					$("#edit_type_predicate_div").hide();
					$("#edit_predicate_div").hide();
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
						editModel()
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