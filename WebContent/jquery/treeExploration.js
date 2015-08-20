/**
 * 
 */

var html;
//var REPO_NAME = "http://localhost:8890/noon";
var prefix;
var dicNS = "dm:Dictionary";
var stringPrefix = "";

function loadPrefix() {
	$.ajax({
		type: "GET",
		url: './prefix/' + REPO_NAME.replace(/:\s*/g, "").replace(/\//g, '_') + "_namespace.json",
		dataType: 'json',
		async: false,
		cache:false,
		success: function (data){
			initPrefix(data);
		},
		error: function(errMsg) {
			$.ajax({
				type: "GET",
				url: "./prefix/main.json",
				dataType: 'json',
				async: false,
				cache:false,
				success: function (data){
					initPrefix(data);
				},
			});
	    }
	});
}

function initPrefix(data) {
	prefix = data;
	$("#dialog-form-namespace").find("fieldset").html("");
	stringPrefix = "";
	$.each(data, function(key, val) {
		$("#dialog-form-namespace").find("fieldset").append("<div>"
			+ "<input type='text' name='namespace_prefix' value='" + val.prefix + "' class='text ui-widget-content ui-corner-all' style='width: 20%'>"
			+ "<input type='text' name='namespace_url' value='" + val.url + "' class='text ui-widget-content ui-corner-all' style='width: 75%'>"
		+ "</div>");
		stringPrefix += "PREFIX " + val.prefix + ":<" + val.url + ">";
	});
	stringPrefix = encodeURIComponent(stringPrefix);
	$("#dialog-form-namespace").find("fieldset").append("<div>"
			+ "<input type='text' name='namespace_prefix' onkeyup='insertInputField(this)' value='' class='text ui-widget-content ui-corner-all' style='width: 20%'>"
			+ "<input type='text' name='namespace_url' value='' class='text ui-widget-content ui-corner-all' style='width: 75%'>"
		+ "</div>");
} 

function insertInputField(element) {
	if ($(element).val().length > 0 && $(element).parent().next().length == 0) {
		$("#dialog-form-namespace").find("fieldset").append("<div>"
			+ "<input type='text' name='namespace_prefix' onkeyup='insertInputField(this)' value='' class='text ui-widget-content ui-corner-all' style='width: 20%'>"
			+ "<input type='text' name='namespace_url' value='' class='text ui-widget-content ui-corner-all' style='width: 75%'>"
		+ "</div>");
	} else if ($(element).val().length == 0 && $(element).parent().next().length > 0 && $(element).parent().next().find("[name='namespace_prefix']").val().length == 0){
		$("#dialog-form-namespace").find("div").last().remove();
	}
}

function editNamespace() {
	var namespace = [];
	$.each($("[name='namespace_prefix']"), function(index) {
		if (!(($(this).val().length === 0 || !$(this).val().trim()) && ($(this).next().val().length === 0 || !$(this).next().val().trim()))) {
			namespace.push({ "prefix": $(this).val(), "url": $(this).next().val()});
		}
	});
	$.ajax({
	    type: "POST",
	    url: "/MetadataManagementTool/WriteNamespace?namespace=" +  encodeURIComponent(JSON.stringify(namespace)) + "&repo_name=" + REPO_NAME,
	    success: function(data){
	    	initPrefix();
	    	alert("Namespace has been successfully saved.");
	    },
	    error: function(errMsg) {
	        alert(errMsg.responseText);
	    }
	});
}

function retrieveTree(node, count, isDic, isPassive) {
	if (count <= 1) {
		$.ajax({
			type: "GET",
			url: API_PATH + "/types/" + node +"/hierarchy?repo_name=" + REPO_NAME + "&prefix=" + encodeURIComponent(JSON.stringify(prefix)),
			dataType: 'json',
			async: false,
			headers: {
				"Authorization": "Basic " + btoa(username + ":" + password)
			},
			success: function (data){
				html = "";
				if (count == 0) {
					html = "<div style='margin-bottom:15px'><input type='image' src='images/embed-plus.gif' alt='Expand' width='15' height='15' style='margin:0 5px 0 0' onclick='expand(this)'/>" +
					   "<a name='a_tree' href='./?model=" + printhtml(node) + (isDic ? "&dictionary=" : isPassive ? "&passive=" : "") + "' style='margin:0;padding-left:0'>" + printhtml(node) + "</a>";
				}
				html += "<div style='margin-left:15px;display:none' " + (count == 0 ? "name='main_tree_element'" : "") + "><p name='section' style='background-color:lightsteelblue'>subclasses</p>";
				recurTree(data, node, isDic, isPassive, count);
				if (count == 0) {
					html += "<p name='section' style='background-color:lightsteelblue'>model elements</p>";
					$("#tree_menu").append(html + "</div>");
				} else {
					html += "<p name='section' style='background-color:lightsteelblue'>instances</p>";
					$("#a_tree_" + node.replace(":", "")).after(html + "</div>");
				}
				$.ajax({
					type: "GET",
					url: API_PATH + "/types/" + node + "/instances?repo_name=" + REPO_NAME + "&prefix=" + encodeURIComponent(JSON.stringify(prefix)),
					dataType: 'json',
					async: false,
					headers: {
						"Authorization": "Basic " + btoa(username + ":" + password)
					},
					success: function (data){
						$.each(data, function(key, val) {
							var name = getPrefix(data[key].instance);
							var element;
							$("a[name='a_tree']").each(function(){
							    if($(this).html() == getPrefix(data[key].type)){
							        element = $(this).next();
							    }
							});
							/*if (element.html().indexOf(">instance</p>") < 0) {
								element.append("<p style='background-color:lightsteelblue'>instance</p>");
							}*/
							if (count == 0) {
								element.append("<input type='image' src='images/embed-plus.gif' alt='Expand' width='15' height='15' style='margin:0 5px 0 0' onclick='expand(this)'/>");
							}
							element.append("<a name='a_tree' id='a_tree_" + name.replace(":", "") + "' href='./?" + (count == 0 ? "model" : "instance") + "=" + name + (isDic ? "&dictionary=" : isPassive ? "&passive=" : "") + "'>" + name + "</a><br>");
							retrieveTree(name, count + 1, isDic, isPassive);
						});
					}
				});
			}
		});
	}
	/*$.getJSON(API_PATH + "/types/" + node +"/hierarchy?repo_name=" + REPO_NAME, function(data) {
		html = "<ul><li>" + printhtml(node) + "</li>";
		recurTree(data, node);
		$("#tree_menu").append(html);
		$.getJSON(API_PATH + "/types/" + node + "/instances?repo_name=" + REPO_NAME, function(data) {
			$.each(data, function(key, val) {
				var name = printhtml(data[key].instance);
				$("li:contains('" + data[key].type.substring(1, data[key].type.length - 1) +"')").append("<ul><li><a href='./?instance=" + encodeURIComponent(data[key].instance) + "'>" + name + "</a></li></ul>");
			});
		});
	});*/
}

function recurTree(data, node, isDic, isPassive, count) {
	$.each(data, function(key, val) {
		if (getPrefix(data[key].type) == node) {
			isType = true;
			var name = getPrefix(data[key].class);
			html += "<input type='image' src='images/embed-plus.gif' alt='Expand' width='15' height='15' style='margin:0 5px 0 0' onclick='expand(this)'/>" +
				"<a name='a_tree' href='./?model=" + getPrefix(data[key].class) + (isDic ? "&dictionary=" : isPassive ? "&passive=" : "") + "'>" + name + "</a>";
			html += "<div style='margin-left:15px;display:none'><p name='section' style='background-color:lightsteelblue'>subclass</p>";
			recurTree(data, getPrefix(data[key].class), isDic, isPassive, count);
			if (count == 0) {
				html += "<p name='section' style='background-color:lightsteelblue'>model elements</p>";
			} else {
				html += "<p name='section' style='background-color:lightsteelblue'>instances</p>";
			}
			html += "</div><br>";
		}
	});
}

function removeSection() {
	$("p[name='section']").each(function( index ) {
		if ($(this).next().prop("tagName") != "A" && $(this).next().prop("tagName") != "INPUT") {
			$(this).hide();
		}
	});
	$("div[name='main_tree_element']").append("<hr>");
}

function highlight(node) {
	$("a[name='a_tree']").each(function(){
	    if($(this).html() == node){
	        $(this).css("background-color", "lightcoral");
	        $(this).parents().show();
	        $(this).parents().prev().prev().attr("src", "images/embed-minus.png");
	    }
	});
}


function retrieveProperties(instance, type, isDic, isMeta, isPassive) {
	
	$.ajax({
		type: "GET",
		url: API_PATH + "/instances/" + instance + "/properties?repo_name=" + REPO_NAME + "&level=" + type  + "&prefix=" + encodeURIComponent(JSON.stringify(prefix)),
		dataType: 'json',
		cache:false,
		headers: {
			"Authorization": "Basic " + btoa(username + ":" + password)
		},
		success: function (data){
			if (type == "instance" && isPassive) {
				$("#contentbar").append("<div id='data_lineage_button'><button onclick='lineage(false)'>View Data Lineage</button></div>");
			}
			var isExternal = false;
			$.each(data, function(key, val) {
				if (getPrefix(data[key].predicate) == "dm:endpoint") {
					isExternal = true;
					if (type == "model") {
						$("#graphFrame").attr("src", "./graph.jsp?ontology=" + instance + "&type=ontology&endpoint=" + data[key].object.replace(/</g, "").replace(/>/g, ""));
					} else {
						$("#graphFrame").attr("src", "./graph.jsp?type=resource&endpoint=" + data[key].object.replace(/</g, "").replace(/>/g, "") + "&resource=" + instance);
					}
					$("#contentbar").html("");
				}
			});
				/*if (!hasType) {
					$("#contentbar").append("<div style='color:red'>This resource hasn't been loaded into the repository yet</div>");
					$("#contentbar").append("<div id='load_resource_button'><button onclick='openLoadOntologyPopup(false, \"" + $("#info_subject").html() + "\")'>View This Resource</button></div>");
				}
			} else {
				/*var hasType = false;
				$.each(data, function(key, val) {
					if (getPrefix(data[key].predicate) == "rdfs:subClassOf") {
						hasType = true;
					}
				});
				if (!hasType) {
					$("#contentbar").append("<div style='color:red'>This concept hasn't been loaded into the repository yet</div>");
					$("#contentbar").append("<div id='load_ontology_button'><button onclick='openLoadOntologyPopup(true, \"" + $("#info_subject").html() + "\")'>View This Ontology</button></div>");
				}
			}*/
			if (!isExternal) {
				$.each(data, function(key, val) {
					var predicate = getPrefix(data[key].predicate);
					if ($("[name=property_header]:contains('" + predicate + "')").length == 0) {
						var s = "<div><h3 name='property_header'>" + predicate + "</h3>" +
						"<div class='datagrid'><table><thead><tr><th>Object</th><th>Label</th><th></th></tr></thead>";
						if (!isMeta && type == "instance") {
							s += "</table><button onclick='openEditPopup(\"\", \"" + predicate + "\", false, \"instance\")'>Add</button></div></div><div>&nbsp;</div>";
						} else if (!isMeta) {
							s += "</table><button onclick='openEditPopup(\"\", \"" + predicate + "\", false, \"model\")'>Add</button></div></div><div>&nbsp;</div>";
						}
						$("#contentbar").append(s);
					}
					
					var content = "";
					if (data[key].object.indexOf("<") == 0) {
						content = "<tr><td name='info_object'><a href='./?" + type + "=" + getPrefix(data[key].object) + (isDic ? "&dictionary=" : "") + "'>" + getPrefix(data[key].object) + "</a></td>" +
						"<td>" + data[key].name + "</td>";
						//"<td><a href='./?model=" + getPrefix(data[key].type) + (isDic ? "&dictionary=" : "") + "'>" + getPrefix(data[key].type) + "</a></td>";
					} else {
						content = "<tr><td name='info_object'>" + data[key].object.substring(0, data[key].object.indexOf(" lang=")) + "^^" + getPrefix("<" + data[key].object.substring(data[key].object.indexOf("type=") + 5, data[key].object.length) + ">") + "</td>" +
						"<td></td>";
						//"<td>" + getPrefix("<" + data[key].object.substring(data[key].object.indexOf("type=") + 5, data[key].object.length) + ">") + "</td>";
					}
					
					if (!isMeta) {
						content += "<td><input type='image' src='images/delete.png' alt='Delete' width='20' height='20' onclick='openDeletePopup($(this), \"" + printhtml(data[key].object) + "\", \"" + predicate + "\", \"" + type + "\")'/></td>" +
								  "</tr>";
					}
					$("[name=property_header]:contains('" + getPrefix(data[key].predicate) + "')").parent().find("table").append(content);
				});	
			}
		}
	});
}

function retrieveSearch(keyword) {
	
	$.ajax({
		type: "GET",
		url: API_PATH + "/triples/search?repo_name=" + REPO_NAME + "&keyword=" + keyword,
		dataType: 'json',
		cache:false,
		headers: {
			"Authorization": "Basic " + btoa(username + ":" + password)
		},
		success: function (data){
			$.each(data, function(key, val) {
				var subject = getPrefix(data[key].subject);
				if ($("[name=subject_property_header]:contains('" + subject + "')").length == 0) {
					var s = "<div><h2 name='subject_property_header'><a href='./?instance=" + subject + "'>" + subject + "</h2>" +
						"<div class='datagrid'><table><thead><tr><th>Predicate</th><th>Object</th></tr></thead>";
					$("#contentbar").append(s);
				}
				
				var content = "<tr><td name='info_object'>" + getPrefix(data[key].predicate) + "</td>" +
				"<td>" + getPrefix(data[key].object) + "</td>";
				
				$("[name=subject_property_header]:contains('" + subject + "')").parent().find("table").append(content);
			});	
		}
	});
}

function openEditPopup(object, predicate, newPre, type) {
	$("#edit_object").val(object);
	$("#info_predicate").val(predicate);
	$("#old_object").val(object);
	$("#dialog-form").dialog("open");
	$("#edit_predicate_div").hide();
	$("#edit_new_object_div").hide();
	$("#edit_label_div").hide();
	$("#edit_type_div").hide();
	
	$("#edit_object").change(function() {
		objectChange(type);
	});
	
	if (newPre) {
		$("#edit_predicate_div").show();
		$("#edit_predicate_dropdown").show();
		var url = API_PATH + "/instances/" + $("#info_subject").html() + "/model_properties?repo_name=" + REPO_NAME + "&level=" + type + "&prefix=" + encodeURIComponent(JSON.stringify(prefix));
		$.ajax({
			type: "GET",
			url: url,
			dataType: 'json',
			headers: {
				"Authorization": "Basic " + btoa(username + ":" + password)
			},
			success: function (data){
				$("#edit_predicate_dropdown").html("");
				$.each(data, function(key, val) {
					if (val.predicate != "<http://www.w3.org/2000/01/rdf-schema#subClassOf>") {
						$("#edit_predicate_dropdown").append("<option value='" + getPrefix(val.predicate) + "'>" + getPrefix(val.predicate) + "</option>");
					}
				});
				$('#edit_predicate_dropdown option:first').attr('selected', 'selected');
				prepareObjectDropdown($("#edit_predicate_dropdown").val(), type);
			}
		});
		if (type == "instance") {
			$("#dialog-form").dialog( "option", "title", "Add Relationship");
			$("#edit_title").html("Add relationship for " + $("#info_subject").html());
			$("#edit_predicate").hide();
			$("#edit_predicate_subpro_label").hide();
			$("#edit_predicate_label").html("Choose from inherited properties:");
			
		} else {
			$("#dialog-form").dialog( "option", "title", "Add New Property" );
			$("#edit_title").html("Add new property for " + $("#info_subject").html());
			$("#edit_predicate").show();
			$("#edit_predicate_subpro_label").show();
			$("#edit_predicate_label").html("Property");
		}
		
	} else {
		$("#dialog-form").dialog( "option", "title", "Add Object" );
		$("#edit_title").html("Add object for property " + $("#info_predicate").val() + " of " + $("#info_subject").html());
		if (type == "instance") {
			prepareObjectDropdown(predicate);
		} else {
			prepareObjectModelDropdown();
		}
	}
	$("#dialog-form").dialog( "option", "buttons", 
		{
			"Add" : function() {
				addTriple(newPre, type);
			},
			Cancel : function() {
				$("#dialog-form").dialog("close");
			}
		}
	);
}

function openDeletePopup(row, object, predicate, type) {
	$("#info_predicate").val(predicate);
	$("#old_object").val(object);
	$("#dialog-confirm").dialog( "open" );
	$("#dialog-confirm").dialog( "option", "buttons", 
			{
				"Delete" : function() {
					deleteTriple(row, type);
				},
				Cancel : function() {
					$("#dialog-confirm").dialog("close");
				}
			}
		);
}

function openEditModelPopup(isIns, isMeta) {
	$( "#dialog-form-model" ).dialog( "open" );
	if (!isMeta) {
		if (isIns) {
			$("#dialog-form-model").dialog( "option", "title", "Add Instance" );
			$("#edit_model_title").html("Add new instance of " + $("#info_subject").html());
		} else {
			$("#dialog-form-model").dialog( "option", "title", "Add Subclass" );
			$("#edit_model_title").html("Add subclass of " + $("#info_subject").html());
		}
	} else {
		$("#dialog-form-model").dialog( "option", "title", "Add Model Element" );
		$("#edit_model_title").html("Add new model element of " + $("#info_subject").html());
	}
	$("#dialog-form-model").dialog( "option", "buttons", 
		{
			"Add" : function() {
				editModel(isIns, isMeta);
			},
			Cancel : function() {
				$("#dialog-form-model").dialog("close");
			}
		}
	);
}

function openLoadOntologyPopup(isOntology, url) {
	$("#typeof_div").hide();
	if (!isOntology) {
		$("#dialog-form-ontology").dialog("option", "title", "View External Resource");
		$("#resource_div").show();
		$("#ontology_div").hide();
		if (url != null) {
			$("#resource").val(url);
			$("#typeof_div").show();
		}
	} else {
		$("#dialog-form-ontology").dialog("option", "title", "View External Ontology");
		$("#resource_div").hide();
		$("#ontology_div").show();
		if (url != null) {
			$("#ontology").val(url);
		}
	}
	$( "#dialog-form-ontology" ).dialog( "open" );
}

function addTriple(newPre, type) {
	var validate = true;
	if ($("#edit_predicate").is(":visible") && !validateField($("#edit_predicate"))) {
		validate = false;
		$(".validateTips").html("Wrong predicate. Prefix not found or if you want to insert the full URI, please put less than and greater than signs infront and back of the URI (ex. &lt;http://dbpedia.org/ontology/capital&gt;");
	}
	if ($("#edit_label").is(":visible")) {
		$("#edit_label").val($("#edit_label").val().replace(/"/g, ""));
		$("#edit_label").val('"' + $("#edit_label").val() + '"');
	}
	if ($("#edit_new_object").is(":visible")) {
		if ($("#edit_object").val() == "new_literal") {
			$("#edit_new_object").val($("#edit_new_object").val().replace(/"/g, ""));
			$("#edit_new_object").val('"' + $("#edit_new_object").val() + '"');
		} else if (!validateField($("#edit_new_object"))) {
			validate = false;
			$(".validateTips").html("Wrong URI. Prefix not found or if you want to insert the full URI, please put less than and greater than signs infront and back of the URI (ex. &lt;http://dbpedia.org/ontology/capital&gt;");
		}
	}
	
	if (validate) {
		var triple;
		var url = API_PATH + "/triples?repo_name=" + REPO_NAME + "&level=" + type + "&prefix=" + encodeURIComponent(JSON.stringify(prefix));
		var object;
		if ($("#edit_object").val() == "new_uri") { 	// add new node
			triple = [{ "subject": decodehtml($("#edit_new_object").val()), "predicate": "rdf:type", "object": decodehtml($("#edit_type").val())},
			          { "subject": decodehtml($("#edit_new_object").val()), "predicate": "rdfs:label", "object": decodehtml($("#edit_label").val())}];
			$.ajax({
	    	    type: "POST",
	    	    url: url,
	    	    headers: {
	    			"Authorization": "Basic " + btoa(username + ":" + password)
	    		},
	    	    data: JSON.stringify(triple),
	    	    async: false,
	    	    contentType: "application/json; charset=utf-8",
	    	    success: function(data){
	    	    	
	    	    },
	    	    error: function(errMsg) {
	    	        alert(errMsg.responseText);
	    	    }
	    	});
			object = decodehtml($("#edit_new_object").val());
		} else if ($("#edit_object").val() == "new_literal") {
			object = $("#edit_new_object").val() + "^^" + $("#edit_type").val();
		} else {
			object = decodehtml($("#edit_object").val());
		}
		if (newPre && type == "model") {
			triple = [{ "subject": decodehtml($("#edit_predicate").val()), "predicate": "rdf:type", "object": "rdf:Property"},
			          { "subject": decodehtml($("#edit_predicate").val()), "predicate": "rdf:type", "object": decodehtml($("#edit_predicate_dropdown").val())},
			          { "subject": decodehtml($("#info_subject").html()), "predicate": decodehtml($("#edit_predicate").val()), "object": object},
			          { "subject": decodehtml($("#edit_predicate").val()), "predicate": "rdfs:domain", "object": decodehtml($("#info_subject").html())},
			          { "subject": decodehtml($("#edit_predicate").val()), "predicate": "rdfs:range", "object": object}];
		} else if (newPre) {
			triple = [{ "subject": decodehtml($("#info_subject").html()), "predicate": decodehtml($("#edit_predicate_dropdown").val()), "object": object}];
		} else {
			triple = [{ "subject": decodehtml($("#info_subject").html()), "predicate": decodehtml($("#info_predicate").val()), "object": object}];
		}
		$.ajax({
		    type: "POST",
		    url: url,
		    headers: {
				"Authorization": "Basic " + btoa(username + ":" + password)
			},
		    data: JSON.stringify(triple),
		    contentType: "application/json; charset=utf-8",
		    success: function(data){
		    	location.reload();
		    },
		    error: function(errMsg) {
		        alert(errMsg.responseText);
		    }
		});
	}
}

function deleteTriple(row, type) {
	var object;
	if ($("#old_object").val().indexOf("lang=") >= 0) {
		var ltype = $("#old_object").val().substring($("#old_object").val().indexOf("type=") + 5, $("#old_object").val().length);
		if (ltype == "http://www.w3.org/2001/XMLSchema#string") {
			object = '"' + $("#old_object").val().substring(0, $("#old_object").val().indexOf("lang=") - 1) + '"@en';
		} else {
			object = '"' + $("#old_object").val().substring(0, $("#old_object").val().indexOf("lang=") - 1) + '"' + "^^<" + ltype + ">";
		}
	} else {
		object = decodehtml($("#old_object").val());
	}
	
	old_triple = [{ "subject": decodehtml($("#info_subject").html()), "predicate": decodehtml($("#info_predicate").val()), "object": object}];
	var url = API_PATH + "/triples?repo_name=" + REPO_NAME + "&level=" + type + "&prefix=" + encodeURIComponent(JSON.stringify(prefix));
	$.ajax({
	    type: "DELETE",
	    url: url,
	    headers: {
			"Authorization": "Basic " + btoa(username + ":" + password)
		},
	    data: JSON.stringify(old_triple),
	    contentType: "application/json; charset=utf-8",
	    success: function(data){
	    	//$("td[name=info_object]:contains('" + decodehtml($("#old_object").val()).substring(1, decodehtml($("#old_object").val()).length - 1) + "')").parent().remove();
	    	row.parent().parent().remove();
	    	$( "#dialog-confirm" ).dialog( "close" );
	    },
	    error: function(errMsg) {
	    	alert(errMsg.responseText);
	    }
	});
} 

function editModel(isIns, isMeta) {
	var validate = true;
	if ($("#edit_label_model").is(":visible")) {
		$("#edit_label_model").val($("#edit_label_model").val().replace(/"/g, ""));
		$("#edit_label_model").val('"' + $("#edit_label_model").val() + '"');
	}
	if ($("#edit_object_model").is(":visible") && !validateField($("#edit_object_model"))) {
		validate = false;
		$(".validateTips").html("Wrong object. Prefix not found or if you want to insert the full URI, please put less than and greater than signs infront and back of the URI (ex. &lt;http://dbpedia.org/ontology/capital&gt;");
	}
	
	if (validate) {
	
		var triple;
		var url;
		if (isIns) { 	// add new instance / new model element
			triple = [{ "subject": decodehtml($("#edit_object_model").val()), "predicate": "rdf:type", "object": decodehtml($("#info_subject").html())},
		              { "subject": decodehtml($("#edit_object_model").val()), "predicate": "rdfs:label", "object": decodehtml($("#edit_label_model").val())}];
			url = API_PATH + "/triples?repo_name=" + REPO_NAME + "&level=" + (isMeta ? "model" : "instance") + "&prefix=" + encodeURIComponent(JSON.stringify(prefix));
		} else {		// add subclass
			triple = [{ "subject": decodehtml($("#edit_object_model").val()), "predicate": "rdfs:subClassOf", "object": decodehtml($("#info_subject").html())},
		              { "subject": decodehtml($("#edit_object_model").val()), "predicate": "rdfs:label", "object": decodehtml($("#edit_label_model").val())}];
			url = API_PATH + "/triples?repo_name=" + REPO_NAME + "&level=model" + "&prefix=" + encodeURIComponent(JSON.stringify(prefix));
		}
		$.ajax({
		    type: "POST",
		    url: url,
		    headers: {
				"Authorization": "Basic " + btoa(username + ":" + password)
			},
		    data: JSON.stringify(triple),
		    contentType: "application/json; charset=utf-8",
		    success: function(data){
		    	window.location.href = "./?" + (isIns ? isMeta ? "model" : "instance" : "model") + "=" + decodehtml($("#edit_object_model").val()) + (getQueryVariable("dictionary") != null ? "&dictionary=" : "");
		    },
		    error: function(errMsg) {
		    	alert(errMsg.responseText);
		    }
		});
	}
}

function retrieveOntology() {
	if (!$("#resource_div").is(":visible")) {
		if ($("#info_subject").html() != $("#ontology").val()) {
			$("#graphFrame").attr("src", "./graph.jsp?url=" + $("#info_subject").html() + "&ontology=" + decodehtml($("#ontology").val()) + "&type=ontology&endpoint=" + $("#endpoint").val());
		} else {
			$("#graphFrame").attr("src", "./graph.jsp?url=dm:Dictionary&ontology=" + decodehtml($("#ontology").val()) + "&type=ontology&endpoint=" + $("#endpoint").val());
		}
	} else {
		if (!$("#typeof_div").is(":visible")) {
			$("#graphFrame").attr("src", "./graph.jsp?url=" + $("#info_subject").html() + "&type=resource&endpoint=" + $("#endpoint").val() + "&resource=" + decodehtml($("#resource").val()));
		} else {
			$("#graphFrame").attr("src", "./graph.jsp?url=" + $("#typeof").val() + "&type=resource&endpoint=" + $("#endpoint").val() + "&resource=" + decodehtml($("#resource").val()));
		}
	}
	$("#contentbar").html("");
	$("#dialog-form-ontology").dialog( "close" );
}

function expand(element) {
	if ($(element).next().next().is(":visible")) {
		$(element).attr("src", "images/embed-plus.gif");
	} else {
		$(element).attr("src", "images/embed-minus.png");
	}
	$(element).next().next().toggle("blind", {}, 100 );
}

function prepareObjectDropdown(predicate, type) {
	
	var query1 = "SELECT distinct ?object from <" + REPO_NAME + "/metamodel> from <" + REPO_NAME + "/model> from <" + REPO_NAME + "/instance> WHERE { " +
					predicate + " rdfs:range ?range ." +
					"?model rdfs:subClassOf* ?range ." +
				    "?instance a ?model . " +
				    "?object rdfs:subClassOf* ?instance}";
	var query2 = "SELECT distinct ?object from <" + REPO_NAME + "/metamodel> from <" + REPO_NAME + "/model> from <" + REPO_NAME + "/instance> WHERE { " +
					predicate + " rdfs:range ?range ." +
					"?object rdfs:subClassOf* ?range}";
				"}";
	var url = API_PATH + "/sparql?query=" + encodeURIComponent(query1) + "&prefix=" + encodeURIComponent(JSON.stringify(prefix));
	$.ajax({
	    type: "GET",
	    url: url,
	    headers: {
			"Authorization": "Basic " + btoa(username + ":" + password)
		},
	    success: function(data){
	    	$("#edit_object").html("<option value='new_uri'>Add new URI</option><option value='new_literal'>Add new literal</option>");
	    	if (data.length > 0) {
	    		$("#edit_new_object_div").hide();
	    		$("#edit_label_div").hide();
	    		$("#edit_type_div").hide();
		    	$.each(data, function(key, val) {
		    		$("#edit_object").append("<option value='" + getPrefix(val.object) + "'>" + getPrefix(val.object) + "</option>");
				});		
		    	$('#edit_object option:eq(2)').attr('selected', 'selected');
	    	} else {
	    		objectChange();
	    	}
	    }
	});
	
	var url = API_PATH + "/sparql?query=" + encodeURIComponent(query2) + "&prefix=" + encodeURIComponent(JSON.stringify(prefix));
	$.ajax({
	    type: "GET",
	    url: url,
	    headers: {
			"Authorization": "Basic " + btoa(username + ":" + password)
		},
	    success: function(data){
	    	$("#edit_type").html("");
	    	$.each(data, function(key, val) {
	    		$("#edit_type").append("<option value='" + getPrefix(val.object) + "'>" + getPrefix(val.object) + "</option>");
			});		
	    }
	});
}

function prepareObjectModelDropdown() {
	var query = "SELECT distinct ?subject from <" + REPO_NAME + "/model> WHERE { "
	+ "?subject ?p ?o ."
	+ "}";
	var url = API_PATH + "/sparql?query=" + encodeURIComponent(query);
	$.ajax({
	    type: "GET",
	    url: url,
	    headers: {
			"Authorization": "Basic " + btoa(username + ":" + password)
		},
	    success: function(data){
	    	$("#edit_object").html("<option value='new_uri'>Add new URI</option><option value='new_literal'>Add new literal</option>");
	    	$("#edit_type").html("");
	    	if (data.length > 0) {
	    		$("#edit_new_object_div").hide();
	    		$("#edit_label_div").hide();
	    		$("#edit_type_div").hide();
		    	$.each(data, function(key, val) {
					$("#edit_object").append("<option value='" + getPrefix(val.subject) + "'>" + getPrefix(val.subject) + "</option>");
					$("#edit_type").append("<option value='" + getPrefix(val.subject) + "'>" + getPrefix(val.subject) + "</option>");	
				});		
		    	$('#edit_object option:eq(2)').attr('selected', 'selected');
		    } else {
	    		objectChange();
	    	}
	    }
	});
}

function objectChange(type) {
	$("#edit_new_object_div").hide();
	$("#edit_label_div").hide();
	$("#edit_type_div").hide();
	if ($("#edit_object").val() == "new_uri") {
		$("#edit_new_object_div").show();
		$("#edit_new_object_label").html("URI");
		$("#edit_label_div").show();
		$("#edit_type_div").show();
		$("#edit_type_label").html("rdf:type of");
	} else if ($("#edit_object").val() == "new_literal") {
		$("#edit_new_object_div").show();
		$("#edit_new_object_label").html("Literal");
		$("#edit_type_div").show();
		$("#edit_type_label").html("DataType");
	}
}

function lineage() {
	$("#graphFrame").attr("src", "./graph.jsp?url=" + $("#info_subject").html() + "&type=lineage");
}

function viewSamanticUsage() {
	$("#graphFrame").attr("src", "./graph.jsp?url=" + $("#info_subject").html() + "&type=usage");
}

function importFile(type) {
	var fd = new FormData(document.getElementById("import_form"));
	$.ajax({
		url : API_PATH + "/import?repo_name=" + REPO_NAME + "&level=" + type,
		type : "POST",
		headers : {
			"Authorization" : "Basic " + btoa(username + ":" + password)
		},
		data : fd,
		processData : false, // tell jQuery not to process the data
		contentType : false, // tell jQuery not to set contentType
		success : function(data) {
			location.reload();
		},
		error : function(errMsg) {
			alert(errMsg.responseText);
		}
	});
}

function exportRDF(type) {
	$.ajax({
		url : API_PATH + "/export?repo_name=" + REPO_NAME + "&format=owl&prefix=" + encodeURIComponent(JSON.stringify(prefix)) + (type == "repo" ? "" : "&level=model"),
		type : "GET",
		dataType: "text",
		headers : {
			"Authorization" : "Basic " + btoa(username + ":" + password)
		},
		success : function(data) {
			var url = 'data:application/octet-stream,' + data;
			var anchor = document.createElement('a');
			    anchor.setAttribute('href', url);
			    anchor.setAttribute('download', REPO_NAME + ".owl");

			var ev = document.createEvent("MouseEvents");
			    ev.initMouseEvent("click", true, false, self, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
			anchor.dispatchEvent(ev);
		},
		error : function(errMsg) {
			alert(errMsg.responseText);
		}
	});
}

function search(e) {
    if (e.keyCode == 13) {
    	window.location.href = "./?search=" + $(".search").val();
    }
}

function validateField(element) {
	var pass = false;
	if (!pass) {			// check is prefix
		$.each(prefix, function(key, val) {
			if (element.val().indexOf(prefix[key].prefix + ":") == 0) {
				pass = true;
			}
		});
	}
	if (!pass) {		// check if URI
		if (element.val().indexOf('<') == 0 && element.val().indexOf('>') == element.val().length - 1) {
			pass = true;
		}
	}
	return pass;
}

function printhtml(data) {
	return data.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function decodehtml(data) {
	return data.replace("&lt;", "<").replace("&gt;", ">");
}

function getPrefix(url) {
	if (url != null && url !== undefined) {
		$.each(prefix, function(key, val) {
			var position = url.indexOf(prefix[key].url);
			if (position >= 0) {
				position = position + prefix[key].url.length;
				url = [url.slice(0, position), ":", url.slice(position)].join('');
				url = url.replace(prefix[key].url, prefix[key].prefix).replace(/</g, "").replace(/>/g, "");
			}
		});
		return printhtml(url);
	}
	return url;
}

function getQueryVariable(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		if (pair[0] == variable) {
			return pair[1];
		}
	}
	return null;
}

