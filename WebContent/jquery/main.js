//var REPO_NAME = "http://localhost:8890/noon";
var username = "dba";
var password = "dba";
var prefix;
var ontologyData;
var dicNS = "dm:Dictionary";
var stringPrefix = "";
var w = 1200;//document.getElementById("chart").offsetWidth-2,
h = 700;//document.getElementById("chart").offsetHeight;

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
	stringPrefix = "";
	$.each(data, function(key, val) {
		stringPrefix += "PREFIX " + val.prefix + ":<" + val.url + ">";
	});
	stringPrefix = encodeURIComponent(stringPrefix);
} 

var svg = d3.select("#chart").append("svg:svg")
.attr("width", w)
.attr("height", h)
.attr("pointer-events", "all");
vis = svg
.append('svg:g')
.call(d3.behavior.zoom().on("zoom", redraw))
.append('svg:g');

vis.append('svg:rect')
.attr('width', w)
.attr('height', h)
.attr('fill', 'white');


var preds=false;
var types=true;
var nodes = [];
var links = [];
var literals = [];
var linkedArrowhead = [];
var force;
var uniquePredicates = {};
function redraw() {
	vis.attr("transform",
		"translate(" + d3.event.translate + ")"
		+ " scale(" + d3.event.scale + ")");
}


function mergeGraphs(newNodes, newLinks){
	for(i in newLinks){
		sIdx = newLinks[i].source;
		tIdx = newLinks[i].target;

		if(nodes.indexOf(newNodes[sIdx]) == -1){
			nodes.push(newNodes[sIdx]);
		}
		newLinks[i].source = nodes.indexOf(newNodes[sIdx]);

		if(nodes.indexOf(newNodes[tIdx]) == -1){
			nodes.push(newNodes[tIdx]);
		}
		newLinks[i].target = nodes.indexOf(newNodes[tIdx]);
		links.push(newLinks[i]);
	}

}

function createPredicateFilters(up){
	//d3.select("#preds").append("div").attr("class", "filter")
	//                     .html("<input type='checkbox' id='all' class='all'/><label for='all'>All Predicates</label>");
	for(i in up){
		d3.select("#preds").append("div").attr("class", "filter")
		.html("<input type='checkbox' id='"+i+"' class='pred-filter'/><label for='"+i+"'>"+i+"</label>");
	}
	updateFilters();
}
function init(json){
	literals = json.literals;
	for(i in json.links){
		uniquePredicates[json.links[i].name] = 1;
	}
	createPredicateFilters(uniquePredicates);
	force = self.force = d3.layout.force();
	mergeGraphs(json.nodes, json.links);
	force.nodes(nodes)
	.links(links)
	.gravity(0.2)
	.distance(2000)
	.charge(-2000)
	.linkDistance(100)
	.size([w, h])
	.start();

	var link = vis.selectAll("g.link")
	.data(links)
	.enter()
	.append("svg:g").attr("class", "link").attr("class", function(d){return d.name})
	.call(force.drag);
	link.append("svg:line")
	.attr("class", "link")
	.attr("stroke", "gray")
	.attr("x1", function(d){return d.x1})
	.attr("y1", function(d){return d.y1})
	.attr("x2", function(d){return d.x1})
	.attr("y2", function(d){return d.y2});

	link.append("svg:text")
	.attr("class", "link")
	.attr("x", function(d) { return d.source.x; })
	.attr("y", function(d) { return d.source.y; })
	.text(function(d){return d.name;}).style("display", "none");


	linkArrowhead = link.append("svg:polygon")
	.attr("class", "arrowhead")
	.attr("transform",function(d) {
		angle = Math.atan2(d.target.y-d.source.y, d.target.x-d.source.x);
		return "rotate("+angle+", "+d.target.x+", "+d.target.y+")";
	})
	.attr("points", function(d) {
			//angle = (d.y2-d.y1)/(d.x2-d.x1);
			return [[d.target.x,d.target.y].join(","),
			[d.target.x-3,d.target.y+26].join(","),
			[d.target.x+3,d.target.y+26].join(",")].join(" ");
		});

	var node = vis.selectAll("g.node")
	.data(nodes)
	.enter().append("svg:g")
	.attr("class", "node")
	.attr("dx", "80px")
	.attr("dy", "80px")
	.call(force.drag);

	node.filter(function(d){return d.type == "uri"})
	//.attr("onclick", function(d){return "nodeClick(event, '" + d.uri + "')"} )
	.attr("onclick", function(d){return "viewGraph('" + d.name + "', '" + d.scope + "')"} )
	.attr("oncontextmenu", function(d){return "javascript:editNode('" + d.name + "', '" + d.scope + "')"})
	.append("svg:circle")
	.attr("class", "node")
	.attr("r", 10)
	.attr("x", "-8px")
	.attr("y", "-8px")
	.attr("width", "16px")
	.attr("height", "16px")
	.style("fill", function(d){return d.color == null ? "#CFEFCF" : d.color})
	.style("stroke", "#000");



	node.filter(function(d){return d.type == "literal"}).append("svg:rect")
	.attr("class", "node")
	.attr("x", "-4px")
	.attr("y", "-8px")
	.attr("width", "60px")
	.attr("height", "16px")
	.style("fill", "#CFEFCF")
	.style("stroke", "#000");

	node.filter(function(d){return d.type == "bnode" || d.type == "uri"}).append("svg:text")
	.attr("class", "nodetext")
	.attr("dx", 12)
	.attr("dy", ".35em").attr("xlink:href", "http://graves.cl").attr("target", "_new")
	.text(function(d) { return d.name });



	node.filter(function(d){return d.type == "literal"}).append("svg:text")
	.attr("class", "literal")
	.attr("dx", 0)
	.attr("dy", ".35em")
	.text(function(d) { return d.name });

	arr1 = d3.selectAll("text.literal");
	arr = arr1[0];
	for(var i=0; i<arr.length; i++){
		x = arr[i].previousSibling;
		d3.select(x).attr("width", arr[i].getBBox().width+8);
	}


	var ticks = 0;
	force.on("tick", function() {
		ticks++;
		if (ticks > 300) {
			force.stop();
			force.charge(0)
			.linkStrength(0)
			.linkDistance(0)
			.gravity(0);
			force.start();
		}
		link.selectAll("line.link").attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });
		link.selectAll("text.link").attr("x", function(d) { return (d.source.x+d.target.x)/2; })
		.attr("y", function(d) { return (d.source.y+d.target.y)/2; });

		node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")";


	});

		linkArrowhead.attr("points", function(d) {
			return [[d.target.x,d.target.y+10].join(","),
			[d.target.x-3,d.target.y+16].join(","),
			[d.target.x+3,d.target.y+16].join(",")].join(" ");
		})
		.attr("transform",function(d) {
			angle = Math.atan2(d.target.y-d.source.y, d.target.x-d.source.x)*180/Math.PI + 90;
			return "rotate("+angle+", "+d.target.x+", "+d.target.y+")";
		});
		d3.selectAll('circle').on('mouseenter', function(d){
			var currentLiterals = literals[d.name];
			var tablebody = $("#literalbody");
			tablebody.empty();
			$("#literalsubject").html(d.name);
			if (currentLiterals != undefined){
				d3.select("#literaltable").style("display", "block");
				d3.select("#literalmsg").html("")
				$.each(currentLiterals, function(i, item){
					language = (item['l'] == "")?"":" <strong>("+item['l']+")</strong>";
					datatype = (item['d'] == "")?"":"^^<strong>"+item['d']+"</strong>";
					td = "<tr><td>"+item['p']+"</td><td>"+item['o']+"</td></tr>"
					tablebody.append($(td))
				})
			}else{
				d3.select("#literaltable").style("display", "none");
				d3.select("#literalmsg").html("No literals related to this URI")
			}
			var x = d3.event.pageX+"px",
			y = d3.event.pageY+"px";
			var l = d3.select("#literals");
			l.style("top", y).style("left", x).style("display", "block");
		}).on('mouseout', function(d){
			var l = d3.select("#literals");
			l.style("display", "none");

		});

	});

			/*node.filter(function(d){return d.type == "uri"}).on('click', function(d){
					restart(d.uri);
				});*/
}


function restart(url, type, endpoint, resource){
	var nodes = [];
	var links = [];
	var literals = [];
	if (type == "metamodel") {
		$.ajax({
			type: "GET",
			url: API_PATH + "/triples?repo_name=" + REPO_NAME + "&level=metamodel",
			dataType: 'json',
			headers: {
				"Authorization": "Basic " + btoa(username + ":" + password)
			},
			success: function (data){
				/*var query2 = "select * from <http://localhost:8890/noon/model> where {" +
								"?subject ?predicate ?object " +
								"filter not exists {";
				$.each(dicsub, function(key1, val1) {
					query2 += "{" + val1.s + " ?predicate ?object filter (?predicate != <http://www.w3.org/2000/01/rdf-schema#subClassOf>)}";
					if (key1 != dicsub.length - 1) {
						query2 += "union";
					}
				});
				query2 += "} filter (?predicate != <http://www.w3.org/2000/01/rdf-schema#label> && ?predicate != <http://www.w3.org/2000/01/rdf-schema#comment> && ?predicate != <http://www.w3.org/2000/01/rdf-schema#domain> && ?predicate != <http://www.w3.org/2000/01/rdf-schema#range>)}";
				$.ajax({
					type: "GET",
					url: API_PATH + "/sparql?query=" + encodeURIComponent(query2) + "&prefix=" + encodeURIComponent(JSON.stringify(prefix)),
					dataType: 'json',
					headers: {
						"Authorization": "Basic " + btoa(username + ":" + password)
					},
					success: function (data){*/
						$.each(data, function(key, val) {
							if (getPrefix(data[key].predicate) != "rdfs:label" && getPrefix(data[key].predicate) != "rdfs:comment" && getPrefix(data[key].predicate) != "rdfs:domain" && getPrefix(data[key].predicate) != "rdfs:range") {
								var node1 = {name: getPrefix(data[key].subject), uri: data[key].subject, type: "uri", scope:"model"};
								var node2 = {name: getPrefix(data[key].object), uri: data[key].object, type: "uri", scope:"model"};
								if (!containsObject(node1, nodes)) {
									nodes.push(node1);
								}
								if (!containsObject(node2, nodes)) {
									nodes.push(node2);
								}
								var source = 0;
								var target = 0;
								$.each(nodes, function(key2, val2) {
									if (nodes[key2].uri === node1.uri) {
										source = key2;
									}
									if (nodes[key2].uri === node2.uri) {
										target = key2;
									}
								});
								links.push({"source": source,"target": target, "name":getPrefix(data[key].predicate), "value":10});
							}
						});
						init({"nodes": nodes, "links": links, "literals": literals});
						/*$.ajax({
							type: "GET",
							url: API_PATH + "/types/dm:Dataset/instances?repo_name=" + REPO_NAME + "&level=model",
							dataType: 'json',
							headers: {
								"Authorization": "Basic " + btoa(username + ":" + password)
							},
							success: function (data){
								$.each(data, function(key, val) {
									var node1 = {name: getPrefix(data[key].instance), uri: data[key].instance, type: "uri", scope:"instance"};
									if (!containsObject(node1, nodes)) {
										nodes.push(node1);
									}
									var source = 0;
									var target = 0;
									$.each(nodes, function(key2, val2) {
										if (nodes[key2].uri === node1.uri) {
											source = key2;
										}
										if (nodes[key2].uri === data[key].type) {
											target = key2;
										}
									});
									links.push({"source": source,"target": target, "name":"rdf:type", "value":10});
								});
								init({"nodes": nodes, "links": links, "literals": literals});
							}
						});*/
					/*},
					error: function(errMsg) {
						alert(errMsg);
				    }
				});*/
			}
		});
	} else if (type == "model" || type == "instance") {
		$.ajax({
			type: "GET",
			url: API_PATH + "/instances/" + url + "/properties?repo_name=" + REPO_NAME + "&level=" + type + "&prefix=" + encodeURIComponent(JSON.stringify(prefix)),
			dataType: 'json',
			headers: {
				"Authorization": "Basic " + btoa(username + ":" + password)
			},
			success: function (data){
				nodes.push({name: url, uri: url, type: "uri", scope:type, color:"#8000FF"});
				var modelNodes = [];
				$.each(data, function(key, val) {
					var scope
					if (getPrefix(data[key].predicate) == "rdf:type") {
						modelNodes.push(getPrefix(data[key].object));
						scope = "model";
					} else {
						scope = type;
					}
					var node1 = {name: getPrefix(data[key].object), uri: data[key].object, type: "uri", scope:(data[key].object.indexOf("<") == 0 ? scope : "literals")};
					if (!containsObject(node1, nodes)) {
						nodes.push(node1);
					}
					var source = 0;
					var target = 0;
					$.each(nodes, function(key2, val2) {
						if (nodes[key2].uri === node1.uri) {
							target = key2;
						}
					});
					links.push({"source": 0,"target": target, "name":getPrefix(data[key].predicate), "value":10});
				});
				$.ajax({
					type: "GET",
					url: API_PATH + "/instances/" + url + "/second_level_properties?repo_name=" + REPO_NAME + "&prefix=" + encodeURIComponent(JSON.stringify(prefix)),
					dataType: 'json',
					headers: {
						"Authorization": "Basic " + btoa(username + ":" + password)
					},
					success: function (data){
						$.each(data, function(key, val) {
							var scope;
							if (getPrefix(data[key].predicate) == "rdf:type") {
								scope = "model";
							} else if (modelNodes.indexOf(getPrefix(data[key].subject)) >= 0) {
								scope = "model";
							} else {
								scope = type;
							}
							var node1 = {name: getPrefix(data[key].subject), uri: data[key].subject, type: "uri", scope:scope};
							var node2 = {name: getPrefix(data[key].object), uri: data[key].object, type: "uri", scope: (data[key].object.indexOf("<") == 0 ? scope : "literals")};
							if (!containsObject(node1, nodes)) {
								nodes.push(node1);
							}
							if (!containsObject(node2, nodes)) {
								nodes.push(node2);
							}
							var source = 0;
							var target = 0;
							$.each(nodes, function(key2, val2) {
								if (nodes[key2].uri === node1.uri) {
									source = key2;
								}
								if (nodes[key2].uri === node2.uri) {
									target = key2;
								}
							});
							links.push({"source": source,"target": target, "name":getPrefix(data[key].predicate), "value":10});
						});
						init({"nodes": nodes, "links": links, "literals": literals});
					}
				});
			}
		});
	} else if (type == "ontology" || type == "resource") {
		
		var urlS;
		if (type == "ontology") {
			urlS = API_PATH + "/ontology/?endpointURL=" + endpoint + "&ontology=" + ontology + "&prefix=" + encodeURIComponent(JSON.stringify(prefix));
		} else {
			urlS = API_PATH + "/ontology/resources/?endpointURL=" + endpoint + "&resource=" + resource + "&prefix=" + encodeURIComponent(JSON.stringify(prefix));
		}
		
		$.ajax({
			type: "GET",
			url: urlS,
			dataType: 'json',
			cache:false,
			headers: {
				"Authorization": "Basic " + btoa(username + ":" + password)
			},
			success: function (data){
				/*ontologyData = data;
				if (type == "ontology") {
					if (url.length != 0){
						ontologyData.push({ "subject": ontology, "predicate": "rdf:type", "object": url});
					}
				} else {
					ontologyData.push({ "subject": resource, "predicate": "rdf:type", "object": url});
				}*/
				$.each(data, function(key, val) {
					var node1 = {name: getPrefix(data[key].subject), uri: data[key].subject, type: "uri", scope:"model"};
					var node2 = {name: getPrefix(data[key].object), uri: data[key].object, type: "uri", scope:"model"};
					if (!containsObject(node1, nodes)) {
						nodes.push(node1);
					}
					if (!containsObject(node2, nodes)) {
						nodes.push(node2);
					}
					var source = 0;
					var target = 0;
					$.each(nodes, function(key2, val2) {
						if (nodes[key2].uri === node1.uri) {
							source = key2;
						}
						if (nodes[key2].uri === node2.uri) {
							target = key2;
						}
					});
					links.push({"source": source,"target": target, "name":getPrefix(data[key].predicate), "value":10});
				});
				init({"nodes": nodes, "links": links, "literals": literals});
				if (url != "null") {
					$("#load_" + type + "_button").append(" with " + url);
					$("#load_" + type + "_button_div").show();
				}
			}
		});
	} else if (type == "lineage") {
		var query = "select ?op ?produce ?use ?user ?time (iri(sql:RDF_DATATYPE_OF_OBJ(?time, 'untyped!'))) as ?datatype from <" + REPO_NAME + "/model> from <" + REPO_NAME + "/instance> where {" +
		"?op ?output ?produce ." +
		"?output rdf:type dm:produces ." +
		"?op ?input ?use ." +
		"?input rdf:type dm:uses ." +
		"optional {" +
		"?op ?by ?user ." +
		"?by rdf:type dm:performBy ." +
		"} optional {" +
		"?op ex:performedWhen ?time ." +
		"}}";
		
		$.ajax({
			type: "GET",
			url: API_PATH + "/sparql?query=" + encodeURIComponent(query) + "&prefix=" + encodeURIComponent(JSON.stringify(prefix)),
			dataType: 'json',
			cache:false,
			headers: {
				"Authorization": "Basic " + btoa(username + ":" + password)
			},
			success: function (data){
				var query = "select ?d ?f from <" + REPO_NAME + "/model> from <" + REPO_NAME + "/instance> where {" +
					"?d ?has ?f . " +
					"?has rdf:type dm:hasFeature" +
					"}";
			
				$.ajax({
					type: "GET",
					url: API_PATH + "/sparql?query=" + encodeURIComponent(query) + "&prefix=" + encodeURIComponent(JSON.stringify(prefix)),
					dataType: 'json',
					cache:false,
					headers: {
						"Authorization": "Basic " + btoa(username + ":" + password)
					},
					success: function (data2){
						var container = [];
						prepareLineage(data, url, container, data2);
						$.each(container, function(key, val) {
							var node1 = {name: getPrefix(container[key].use), uri: container[key].use, type: "uri", scope:"instance"};
							var node2 = {name: getPrefix(container[key].op), uri: container[key].op, type: "uri", scope:"instance", color:"#8000FF"};
							var node3 = {name: getPrefix(container[key].produce), uri: container[key].produce, type: "uri", scope:"instance"};
							//var node4 = null;
							var literal = [];
							if (container[key].user && container[key].user != "NULL") {
								//node4 = {name: getPrefix(container[key].user), uri: container[key].user, type: "uri", scope:"model"};
								literal.push({"p": "byUser", "o": getPrefix(container[key].user)});
							}
							//var node5 = null;
							if (container[key].time && container[key].time != "NULL") {
								//node5 = {name: getPrefix(container[key].time), uri: container[key].time, type: "uri", scope:"model"};
								literal.push({"p": "time", "o": getPrefix(container[key].time)});
							}
							if (!containsObject(node1, nodes)) {
								nodes.push(node1);
							}
							if (!containsObject(node2, nodes)) {
								nodes.push(node2);
							}
							if (!containsObject(node3, nodes)) {
								nodes.push(node3);
							}
							/*if (node4 != null && !containsObject(node4, nodes)) {
								nodes.push(node4);
							}
							if (node5 != null && !containsObject(node5, nodes)) {
								nodes.push(node5);
							}*/
							var source = 0;
							var op = 0;
							var des = 0;
							var user = 0;
							var time = 0;
							$.each(nodes, function(key2, val2) {
								if (nodes[key2].name === node1.name) {
									source = key2;
								}
								if (nodes[key2].name === node2.name) {
									op = key2;
								}
								if (nodes[key2].name === node3.name) {
									des = key2;
								}
								/*if (node4 != null && nodes[key2].name === node4.name) {
									user = key2;
								}
								if (node5 != null && nodes[key2].name === node5.name) {
									time = key2;
								}*/
							});
							if (container[key].op == "hasFeature") {
								links.push({"source": source,"target": des, "name":"hasFeature", "value":10});
							} else {
								links.push({"source": source,"target": op, "name":"input", "value":10});
								links.push({"source": op,"target": des, "name":"output", "value":10});
								literals[getPrefix(container[key].op)] = literal;
								/*if (node4 != null) {
									links.push({"source": op,"target": user, "name":"byUser", "value":10});
								}
								if (node5 != null) {
									links.push({"source": op,"target": time, "name":"time", "value":10});
								}*/
							}
						});
						init({"nodes": nodes, "links": links, "literals": literals});
					}
				});
			}
		});
	} else if (type == "usage") {
		var query = "select ?ex ?endpoint from <" + REPO_NAME + "/instance> where {"
				+ url + " owl:sameAs ?ex . "
				+ "?ex dm:endpoint ?endpoint"
				+ "}";
		
		$.ajax({
			type: "GET",
			url: API_PATH + "/sparql?query=" + encodeURIComponent(query) + "&prefix=" + encodeURIComponent(JSON.stringify(prefix)),
			dataType: 'json',
			cache:false,
			headers: {
				"Authorization": "Basic " + btoa(username + ":" + password)
			},
			success: function (data){
				var query = "select distinct ?subject ?predicate ?object where {"
						+ "{select distinct ?subject ?predicate ?object from <" + REPO_NAME + "/model> from <" + REPO_NAME + "/instance> where {"
						+ "?subject ?has " + url + " . "
						+ "?has rdf:type dm:hasDomainConcept . "
						+ "?subject ?predicate ?object .}} union {"
						+ "select distinct ?subject ?predicate ?object where {"
						+ url + " owl:sameAs ?subject . "
						+ "SERVICE " + data[0].endpoint + "{"
							+ "values (?v) { (owl:ObjectProperty)(owl:DatatypeProperty) }"
							+ "?predicate a ?v ."
							+ "?subject ?predicate ?object"
						+ "}}}"
						+ "}";
			
				$.ajax({
					type: "GET",
					url: API_PATH + "/sparql?query=" + encodeURIComponent(query) + "&prefix=" + encodeURIComponent(JSON.stringify(prefix)),
					dataType: 'json',
					cache:false,
					headers: {
						"Authorization": "Basic " + btoa(username + ":" + password)
					},
					success: function (data2){
						$.each(data2, function(key, val) {
							var node1 = {name: getPrefix(val.subject), uri: val.subject, type: "uri", scope:"instance"};
							var node2 = {name: getPrefix(val.object), uri: val.object, type: "uri", scope:"instance"};
							if (!containsObject(node1, nodes)) {
								nodes.push(node1);
							}
							if (!containsObject(node2, nodes)) {
								nodes.push(node2);
							}
							var source = 0;
							var target = 0;
							$.each(nodes, function(key2, val2) {
								if (nodes[key2].name === node1.name) {
									source = key2;
								}
								if (nodes[key2].name === node2.name) {
									target = key2;
								}
							});
							links.push({"source": source,"target": target, "name":getPrefix(val.predicate), "value":10});
						});
						var source = 0;
						var target = 0;
						$.each(nodes, function(key2, val2) {
							if (nodes[key2].name === url) {
								source = key2;
							}
							if (nodes[key2].name === getPrefix(data[0].ex)) {
								target = key2;
							}
						});
						links.push({"source": source,"target": target, "name":"owl:sameAs", "value":10});
						init({"nodes": nodes, "links": links, "literals": literals});
					}
				});
			}
		});
	}
	
	/*var json = {
			  "nodes":[
			           {"name":"Noon", "uri":"http://localhost:8080/MetadataManagementTool/Noon", "type":"uri"},
			           {"name":"Mom", "uri":"http://localhost:8080/MetadataManagementTool/Mom", "type":"uri"},
			           {"name":"Dad", "uri":"http://localhost:8080/MetadataManagementTool/Dad", "type":"uri"},
			           {"name":"Nink", "uri":"http://localhost:8080/MetadataManagementTool/Nink", "type":"uri"}
			         ],
			         "links":[
			           {"source":0,"target":3, "name":"Sister", "value":10},
			           {"source":1,"target":0, "name":"Mother", "value":10},
			           {"source":2,"target":0, "name":"Father", "value":10}
			         ],
			         "literals":{
	                    "Noon":[{"p":"love", "o":"Montis", "l":"", "d":""},
	                            {"p":"study", "o":"IT", "l":"", "d":""}],
	                    "Mom":[{"p":"love", "o":"York", "l":"", "d":""}]
			         }
			       };*/
	/*d3.json(data, function(json){
		d3.select("#waiting").style("display", "none");
		init(json);
	});*/
}

function prepareLineage(data, node, container, DFRelation) {
	$.each(data, function(key, val) {
		if (getPrefix(val.produce) == getPrefix(node)) {
			container.push(val);
			prepareLineage(data, val.use, container, DFRelation);
		}
	});
	$.each(DFRelation, function(key2, val2) {
		if (getPrefix(val2.f) == getPrefix(node)) {
			var dexist = false;
			for (var i = 0; i < container.length; i++) {
		        if (getPrefix(container[i].use) === getPrefix(val2.d)) {
		            dexist = true;
		        }
		    }
			if (!dexist) {
				container.push({"op":"hasFeature", "use":val2.d, "produce":node})
				prepareLineage(data, val2.d, container, DFRelation);
			}
		}
	});
	$.each(DFRelation, function(key2, val2) {
		if (getPrefix(val2.d) == getPrefix(node)) {
			var dexist = false;
			for (var i = 0; i < container.length; i++) {
		        if (getPrefix(container[i].produce) === getPrefix(val2.f)) {
		            dexist = true;
		        }
		    }
			if (!dexist) {
				container.push({"op":"hasFeature", "use":node, "produce":val2.f})
				prepareLineage(data, val2.f, container, DFRelation);
			}
		}
	});
}

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].name === obj.name) {
            return true;
        }
    }

    return false;
}

d3.select("#properties").on('click', function(){
	if(preds){
		d3.selectAll("text.link").style("display", "none")	;
		preds = false;
	}else{
		d3.selectAll("text.link").style("display", "inline")	;
		preds = true;
	}
});
d3.select("#hidePredicates").on('click', function(){
	var menu = d3.select("#preds");
	if(menu.style("display") == "none"){
		menu.style("display", "inline")	;
	}else{
		menu.style("display",  "none")
	}
});
function updateFilters(){


	d3.selectAll(".pred-filter").on('change', function(){
		predType = d3.select(this).attr("id").replace(":", "\\:");
		var l = d3.selectAll("g."+predType);
		if(uniquePredicates[predType] == 1){
			d3.selectAll("g."+predType).style("display", "inline")	;
			uniquePredicates[predType] = 0;
		}else{
			d3.selectAll("g."+predType).style("display", "none")	;
			uniquePredicates[predType] = 1;
		}
	});
}

function nodeClick(e, uri) {
	var rightclick;
    if (!e) var e = window.event;
    if (e.which) rightclick = (e.which == 3);
    else if (e.button) rightclick = (e.button == 2);
    if (rightclick) {
    	editNode(uri);
    } else {
    	viewGraph(uri, "instance");
    }
}

function viewGraph(uri, scope) {
	if (scope == "model") {
		window.top.location.href = "./?model=" + encodeURIComponent(uri);
	} else if (scope == "instance") {
		window.top.location.href = "./?instance=" + encodeURIComponent(uri);
	}
}

function editNode(uri, scope) {
	if (scope == "model") {
		window.top.location.href = "./?model=" + encodeURIComponent(uri);
	} else if (scope == "instance") {
		window.top.location.href = "./?instance=" + encodeURIComponent(uri);
	}
	return false;
}

function loadOntology(level) {
	
	/*if (level == "model") {
		var query = "select * from <" + REPO_NAME + "/model> where {" +
		"?subject rdfs:subClassOf dm:Dictionary}";
		
		$.ajax({
			type: "GET",
			url: API_PATH + "/sparql?query=" + encodeURIComponent(query) + "&prefix=" + encodeURIComponent(JSON.stringify(prefix)),
			dataType: 'json',
			async:false,
			cache:false,
			headers: {
				"Authorization": "Basic " + btoa(username + ":" + password)
			},
			success: function (data){
				$.each(ontologyData, function(key, val) {
					$.each(data, function(key2, val2) {
						if (getPrefix(val.subject) == getPrefix(val2.subject)) {
							old_triple = [{ "subject": val2.subject, "predicate": "rdfs:subClassOf", "object": "dm:Dictionary"}];
							var url = API_PATH + "/triples?repo_name=" + REPO_NAME + "&level=" + level + "&prefix=" + encodeURIComponent(JSON.stringify(prefix));
							$.ajax({
							    type: "DELETE",
							    url: url,
							    headers: {
									"Authorization": "Basic " + btoa(username + ":" + password)
								},
							    data: JSON.stringify(old_triple),
							    contentType: "application/json; charset=utf-8",
							    success: function(data){
							    },
							    error: function(errMsg) {
							    	alert(errMsg.responseText);
							    }
							});
						}
					});
				});
			}
		});
	}*/
	
	var reqURL = "";
	if (level == "model") {
		reqURL = API_PATH + "/ontology/link?repo_name=" + REPO_NAME + "&endpointURL=<" + endpoint + ">&ontology=" + ontology + "&localElement=" + url + "&prefix=" + encodeURIComponent(JSON.stringify(prefix));
	} else {
		reqURL = API_PATH + "/ontology/resource/link?repo_name=" + REPO_NAME + "&level=" + level + "&endpointURL=<" + endpoint + ">&resource=" + resource + "&localElement=" + url + "&prefix=" + encodeURIComponent(JSON.stringify(prefix));
	}
	
	$.ajax({
	    type: "POST",
	    url: reqURL,
	    headers: {
			"Authorization": "Basic " + btoa(username + ":" + password)
		},
	    success: function(data){
	    	window.top.location.reload();
	    },
	    error: function(errMsg) {
	        alert(errMsg.responseText);
	    }
	});	
}

function printhtml(data) {
	return data.replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
	return url;
}

loadPrefix();
restart(url, type, endpoint, resource);

