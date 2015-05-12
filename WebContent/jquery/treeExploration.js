/**
 * 
 */

var html;
var REPO_NAME = "http://localhost:8890/noon";
var prefix;
var username = "dba";
var password = "dba";
var dicNS = "ns:Dictionary";
var isDic = false;

function initPrefix(filename) {
	$.ajax({
		type: "GET",
		url: './prefix/' + filename,
		dataType: 'json',
		success: function (data){
			prefix = data;
		}
	});
}

function retrieveTree(node, prop, type) {
	if (node == dicNS) {
		isDic = true;
	}
	$.ajax({
		type: "GET",
		url: API_PATH + "/types/" + node +"/hierarchy?repo_name=" + REPO_NAME,
		dataType: 'json',
		headers: {
			"Authorization": "Basic " + btoa(username + ":" + password)
		},
		success: function (data){
			html = "<ul><li><a href='./?model=" + printhtml(node) + (isDic ? "&dictionary=" : "") + "'>" + printhtml(node) + "</a></li>";
			recurTree(data, node);
			$("#tree_menu").append(html);
			$.ajax({
				type: "GET",
				url: API_PATH + "/types/" + node + "/instances?repo_name=" + REPO_NAME,
				dataType: 'json',
				headers: {
					"Authorization": "Basic " + btoa(username + ":" + password)
				},
				success: function (data){
					$.each(data, function(key, val) {
						var name = getPrefix(data[key].instance);
						$("li:contains('" + getPrefix(data[key].type) +"')").append("<ul><li><a href='./?instance=" + getPrefix(data[key].instance) + (isDic ? "&dictionary=" : "") + "'><font color='8000FF'>" + name + "</font></a></li></ul>");
					});
					retrieveProperties(prop, type);
				}
			});
		}
	});
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

function recurTree(data, node) {
	html += "<ul>";
	$.each(data, function(key, val) {
		if (getPrefix(data[key].type) == node) {
			isType = true;
			var name = getPrefix(data[key].class);
			html += "<li><a href='./?model=" + getPrefix(data[key].class) + (isDic ? "&dictionary=" : "") + "'>" + name + "</a></li>";
			recurTree(data, getPrefix(data[key].class), html);
		}
	});
	html += "</ul>"
}


function retrieveProperties(instance, type) {
	$("#contentbar").append("<h2 id='info_subject'>" + printhtml(instance) + "</h2>");

	$.ajax({
		type: "GET",
		url: API_PATH + "/instances/" + instance + "/properties?repo_name=" + REPO_NAME + "&level=" + type,
		dataType: 'json',
		cache:false,
		headers: {
			"Authorization": "Basic " + btoa(username + ":" + password)
		},
		success: function (data){
			$.each(data, function(key, val) {
				var predicate = getPrefix(data[key].predicate);
				if ($("[name=property_header]:contains('" + predicate + "')").length == 0) {
					var s = "<div><h3 name='property_header'>" + predicate + "</h3>" +
					"<div class='datagrid'><table><thead><tr><th>Object</th><th>Label</th><th>Type</th><th></th><th></th></tr></thead>";
					if (type == "instance") {
						s += "</table><button onclick='openEditPopup(\"\", \"" + predicate + "\", true)'>Add</button></div></div><div>&nbsp;</div>";
					} else {
						s += "</table><button onclick='openEditPredicate(\"\", \"" + predicate + "\", true, false)'>Add</button></div></div><div>&nbsp;</div>";
					}
					$("#contentbar").append(s);
				}
				
				var content = "";
				if (data[key].object.indexOf("<") == 0) {
					content = "<tr><td name='info_object'><a href='./?" + type + "=" + getPrefix(data[key].object) + (isDic ? "&dictionary=" : "") + "'>" + getPrefix(data[key].object) + "</a></td>" +
					"<td>" + data[key].name + "</td>" +
					"<td><a href='./?model=" + getPrefix(data[key].type) + (isDic ? "&dictionary=" : "") + "'>" + getPrefix(data[key].type) + "</a></td>";
				} else {
					content = "<tr><td name='info_object'>" + data[key].object.substring(0, data[key].object.indexOf("lang=") - 1) + "</td>" +
					"<td></td>" +
					"<td>" + getPrefix("<" + data[key].object.substring(data[key].object.indexOf("type=") + 5, data[key].object.length) + ">") + "</td>";
				}
				
				if (type == "instance") {
					content += "<td><button onclick='openEditPopup(\"" + getPrefix(data[key].object) + "\", \"" + predicate + "\", false)'>Edit</button></td>";
				} else {
					content += "<td><button onclick='openEditPredicate(\"" + getPrefix(data[key].object) + "\", \"" + predicate + "\", false, false)'>Edit</button></td>";
				}
					content += "<td><input type='image' src='images/delete.png' alt='Delete' width='20' height='20' onclick='openDeletePopup(\"" + getPrefix(data[key].object) + "\", \"" + predicate + "\", \"" + type + "\")'/></td>" +
							  "</tr>";
				$("[name=property_header]:contains('" + getPrefix(data[key].predicate) + "')").parent().find("table").append(content);
			});	
		}
	});
}

function openEditPopup(object, predicate, isAdd) {
	$("#edit_object").val(object);
	$("#info_predicate").val(predicate);
	$("#old_object").val(object);
	$( "#dialog-form" ).dialog( "open" );
	if (isAdd) {
		$("#dialog-form").dialog( "option", "title", "Add Triple" );
		$("#dialog-form").dialog( "option", "buttons", 
			{
				"Add" : function() {
					editTriple(false);
				},
				Cancel : function() {
					$("#dialog-form").dialog("close");
				}
			}
		);
		
	} else {
		$("#dialog-form").dialog( "option", "title", "Edit Triple" );
		$("#dialog-form").dialog( "option", "buttons", 
			{
				"Edit" : function() {
					editTriple(true);
				},
				Cancel : function() {
					$("#dialog-form").dialog("close");
				}
			}
		);
	}
}

function openEditPredicate(object, predicate, isAdd, newPre, type) {
	$("#edit_object").val(object);
	$("#info_predicate").val(predicate);
	$("#old_object").val(object);
	$("#dialog-form-predicate").dialog("open");
	$("#edit_predicate").show();
	$("#edit_predicate_dropdown").hide();
	$("#edit_predicate_dropdown").html("");
	if (isAdd) {
		if (newPre) {
			$("#dialog-form-predicate").dialog( "option", "title", "Add New Predicate" );
			
			if (type == "instance") {
				$("#edit_label_predicate_div").hide();
				$("#edit_predicate").hide();
				$("#edit_predicate_dropdown").show();
				var url = API_PATH + "/instances/" + $("#info_subject").html() + "/model_properties?repo_name=" + REPO_NAME + "&level=instance";
				$.ajax({
					type: "GET",
					url: url,
					dataType: 'json',
					headers: {
						"Authorization": "Basic " + btoa(username + ":" + password)
					},
					success: function (data){
						$.each(data, function(key, val) {
							$("#edit_predicate_dropdown").append("<option value='" + printhtml(val.predicate) + "'>" + printhtml(val.predicate) + "</option>");
						});
					}
				});
			}
			
			
			$("#edit_predicate_div").show();
			
		} else {
			$("#dialog-form-predicate").dialog( "option", "title", "Add Triple" );
		}
		$("#dialog-form-predicate").dialog( "option", "buttons", 
			{
				"Add" : function() {
					editPredicate(false, newPre, type);
				},
				Cancel : function() {
					$("#dialog-form-predicate").dialog("close");
				}
			}
		);
		
	} else {
		$("#dialog-form-predicate").dialog( "option", "title", "Edit Triple" );
		$("#dialog-form-predicate").dialog( "option", "buttons", 
			{
				"Edit" : function() {
					editPredicate(true, newPre, type);
				},
				Cancel : function() {
					$("#dialog-form-predicate").dialog("close");
				}
			}
		);
	}
}

function openDeletePopup(object, predicate, type) {
	$("#info_predicate").val(predicate);
	$("#old_object").val(object);
	$("#dialog-confirm").dialog( "open" );
	$("#dialog-confirm").dialog( "option", "buttons", 
			{
				"Delete" : function() {
					deleteTriple(null, type);
				},
				Cancel : function() {
					$("#dialog-confirm").dialog("close");
				}
			}
		);
}

function openEditModelPopup(isIns) {
	$( "#dialog-form-model" ).dialog( "open" );
	if (isIns) {
		$("#dialog-form-model").dialog( "option", "title", "Add Instance" );
	} else {
		$("#dialog-form-model").dialog( "option", "title", "Add Subclass" );
	}
	$("#dialog-form-model").dialog( "option", "buttons", 
		{
			"Add" : function() {
				editModel(isIns);
			},
			Cancel : function() {
				$("#dialog-form-model").dialog("close");
			}
		}
	);
}

function openLoadOntologyPopup(isOntology) {
	if (!isOntology) {
		$("#resource_div").show();
	} else {
		$("#resource_div").hide();
	}
	$( "#dialog-form-ontology" ).dialog( "open" );
}

function editTriple(isEdit) {
	if ($("#edit_object").val().indexOf('"') >= 0  && !$("#edit_type_div").is(":visible")) { //literal
		$("#edit_type_div").show();
	} else if ($("#edit_object").val().indexOf('"') >= 0  && $("#edit_type_div").is(":visible")) {
		if (isEdit) {
			deleteTriple(addTriple, "instance");
		} else {
			addTriple();
		}
	} else { // URI
		$.ajax({
			type: "GET",
			url: API_PATH + "/instances/" + decodehtml($("#edit_object").val()) + "/properties?repo_name=" + REPO_NAME + "&level=instance",
			dataType: 'json',
			headers: {
				"Authorization": "Basic " + btoa(username + ":" + password)
			},
			success: function (data){
				if (data.length == 0 && !$("#edit_label_div").is(":visible")) {
					$(".validateTips").html("Subject not exist! Add information about its label");
					$("#edit_label_div").show();
					$("#edit_type_div").show();
				} else {
					
					if (isEdit) {	// edit triple
					// delete previous triple first, then add new one
						deleteTriple(addTriple, "instance");
					} else {		// add triple
						addTriple();
					}
					
				}
			}
		});
	}
}

function addTriple() {
	
	var url_main = API_PATH + "/triples?repo_name=" + REPO_NAME + "&level=instance"
	/*if (!$("#edit_type_div").is(":visible")) {
		var query = "SELECT ?model from <" + REPO_NAME + "/model> from <" + REPO_NAME + "/instance> WHERE {"
				+  decodehtml($("#info_subject").html()) + " a ?type ."
				+ "?type " + decodehtml($("#info_predicate").val()) + " ?model }";
		var url = API_PATH + "/sparql?query=" + encodeURIComponent(query);
		$.ajax({
		    type: "GET",
		    url: url,
		    async: false,
		    headers: {
				"Authorization": "Basic " + btoa(username + ":" + password)
			},
		    success: function(data){
		    	var modelType = data[0].model;*/
		    	var triple;
		    	if ($("#edit_label_div").is(":visible")) { 	// add new node
		    		triple = [{ "subject": decodehtml($("#edit_object").val()), "predicate": "rdf:type", "object": decodehtml($("#edit_type").val())},
		    	              { "subject": decodehtml($("#edit_object").val()), "predicate": "rdfs:label", "object": decodehtml($("#edit_label").val())}];
		    		$.ajax({
			    	    type: "POST",
			    	    url: url_main,
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
		    	}			
		    //}
		//});
	//}
	    	
	var object;
	if ($("#edit_object_predicate").val().indexOf('"') >= 0) {
		object = $("#edit_object").val() + "^^" + $("#edit_type").val();
	} else {
		object = decodehtml($("#edit_object").val());
	}
	triple = [{ "subject": decodehtml($("#info_subject").html()), "predicate": decodehtml($("#info_predicate").val()), "object": object}];
	$.ajax({
	    type: "POST",
	    url: url_main,
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

function deleteTriple(callback, type) {
	old_triple = [{ "subject": decodehtml($("#info_subject").html()), "predicate": decodehtml($("#info_predicate").val()), "object": decodehtml($("#old_object").val())}];
	var url = API_PATH + "/triples?repo_name=" + REPO_NAME + "&level=" + type;
	$.ajax({
	    type: "DELETE",
	    url: url,
	    headers: {
			"Authorization": "Basic " + btoa(username + ":" + password)
		},
	    data: JSON.stringify(old_triple),
	    contentType: "application/json; charset=utf-8",
	    success: function(data){
	    	if (callback != null) {
	    		callback(type);
	    	}
	    	$("td[name=info_object]:contains('" + decodehtml($("#old_object").val()).substring(1, decodehtml($("#old_object").val()).length - 1) + "')").parent().remove();
	    	$( "#dialog-confirm" ).dialog( "close" );
	    },
	    error: function(errMsg) {
	    	alert(errMsg.responseText);
	    }
	});
} 

function editPredicate(isEdit, newPre, type) {
	if ($("#edit_object_predicate").val().indexOf('"') >= 0  && !$("#edit_type_predicate_div").is(":visible")) { //literal
		$("#edit_type_predicate_div").show();
	} else if ($("#edit_object_predicate").val().indexOf('"') >= 0  && $("#edit_type_predicate_div").is(":visible")) {
		if (newPre) {
			if (type == "model") {
				$("#info_predicate").val($("#edit_predicate").val());
			} else {
				$("#info_predicate").val($("#edit_predicate_dropdown").val());
			}
			addPredicate(type);
		} else {
			addModelTriple();
		}
	} else { // URI
		$.ajax({
			type: "GET",
			url: API_PATH + "/instances/" + decodehtml($("#edit_object_predicate").val()) + "/properties?repo_name=" + REPO_NAME + "&level=instance",
			dataType: 'json',
			headers: {
				"Authorization": "Basic " + btoa(username + ":" + password)
			},
			success: function (data){
				if (data.length == 0 && !$("#edit_label_predicate_div").is(":visible")) {
					$(".validateTips").html("Object not exist! Add information about its label");
					$("#edit_label_predicate_div").show();
					$("#edit_type_predicate_div").show();
				} else {
					
					if (isEdit) {	// edit triple
					// delete previous triple first, then add new one
						deleteTriple(addModelTriple, type);
					} else {		// add triple
						if (newPre) {
							if (type == "model") {
								$("#info_predicate").val($("#edit_predicate").val());
							} else {
								$("#info_predicate").val($("#edit_predicate_dropdown").val());
							}
							addPredicate(type);
						} else {
							addModelTriple();
						}
					}
					
				}
			}
		});
	}
}

function addModelTriple() {
	var triple;
	var url = API_PATH + "/triples?repo_name=" + REPO_NAME + "&level=model";
	if ($("#edit_label_predicate_div").is(":visible")) { 	// add new node
		triple = [{ "subject": decodehtml($("#edit_object_predicate").val()), "predicate": "rdfs:subClassOf", "object": decodehtml($("#edit_type_predicate").val())},
		          { "subject": decodehtml($("#edit_object_predicate").val()), "predicate": "rdfs:label", "object": decodehtml($("#edit_label_predicate").val())}];
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
	}			
	
	var object;
	if ($("#edit_object_predicate").val().indexOf('"') >= 0) {
		object = $("#edit_object_predicate").val() + "^^" + $("#edit_type_predicate").val();
	} else {
		object = decodehtml($("#edit_object_predicate").val());
	}
	triple = [{ "subject": decodehtml($("#info_subject").html()), "predicate": decodehtml($("#info_predicate").val()), "object": object}];
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

function addPredicate(type) {
	var triple;
	var url = API_PATH + "/triples?repo_name=" + REPO_NAME + "&level=" + type;
	if ($("#edit_label_predicate_div").is(":visible")) { 	// add new node
		if (type == "model") {
			triple = [{ "subject": decodehtml($("#edit_object_predicate").val()), "predicate": "rdfs:subClassOf", "object": decodehtml($("#edit_type_predicate").val())},
			          { "subject": decodehtml($("#edit_object_predicate").val()), "predicate": "rdfs:label", "object": decodehtml($("#edit_label_predicate").val())}];
		} else {
			triple = [{ "subject": decodehtml($("#edit_object_predicate").val()), "predicate": "rdf:type", "object": decodehtml($("#edit_type_predicate").val())},
			          { "subject": decodehtml($("#edit_object_predicate").val()), "predicate": "rdfs:label", "object": decodehtml($("#edit_label_predicate").val())}];
		}
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
	}			
	
	var object;
	if ($("#edit_object_predicate").val().indexOf('"') >= 0) {
		object = $("#edit_object_predicate").val() + "^^" + $("#edit_type_predicate").val();
	} else {
		object = decodehtml($("#edit_object_predicate").val());
	}
	triple = [{ "subject": decodehtml($("#info_subject").html()), "predicate": decodehtml($("#info_predicate").val()), "object": object}];
	if (type == "model") {
		triple.push({ "subject": decodehtml($("#info_predicate").val()), "predicate": "rdfs:domain", "object": decodehtml($("#info_subject").html())},
	          { "subject": decodehtml($("#info_predicate").val()), "predicate": "rdfs:range", "object": decodehtml($("#edit_object_predicate").val())});
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

function editModel(isIns) {
	var triple;
	var url;
	if (isIns) { 	// add new instance
		triple = [{ "subject": decodehtml($("#edit_object_model").val()), "predicate": "rdf:type", "object": decodehtml($("#info_subject").html())},
	              { "subject": decodehtml($("#edit_object_model").val()), "predicate": "rdfs:label", "object": decodehtml($("#edit_label_model").val())}];
		url = API_PATH + "/triples?repo_name=" + REPO_NAME + "&level=instance"
	} else {		// add subclass
		triple = [{ "subject": decodehtml($("#edit_object_model").val()), "predicate": "rdfs:subClassOf", "object": decodehtml($("#info_subject").html())},
	              { "subject": decodehtml($("#edit_object_model").val()), "predicate": "rdfs:label", "object": decodehtml($("#edit_label_model").val())}];
		url = API_PATH + "/triples?repo_name=" + REPO_NAME + "&level=model"
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
	    	if (isIns) {
	    		window.location.href = "./?instance=" + decodehtml($("#edit_object_model").val());
	    	} else {
	    		window.location.href = "./?model=" + decodehtml($("#edit_object_model").val());
	    	}
	    },
	    error: function(errMsg) {
	    	alert(errMsg.responseText);
	    }
	});
}

function retrieveOntology() {
	if (!$("#resource_div").is(":visible")) {
		$("#graphFrame").attr("src", "./graph.jsp?url=" + $("#info_subject").html() + "&ontology=" + $("#ontology").val() + "&type=ontology&endpoint=" + $("#endpoint").val());
	} else {
		$("#graphFrame").attr("src", "./graph.jsp?url=" + $("#info_subject").html() + "&ontology=" + $("#ontology").val() + "&type=resource&endpoint=" + $("#endpoint").val() + "&resource=" + $("#resource").val());
	}
	$("#contentbar").html("");
	$("#dialog-form-ontology").dialog( "close" );
}

function printhtml(data) {
	return data.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function decodehtml(data) {
	return data.replace("&lt;", "<").replace("&gt;", ">");
}

function getPrefix(url) {
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

