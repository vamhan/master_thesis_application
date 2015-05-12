var REPO_NAME = "http://localhost:8890/noon";
var username = "dba";
var password = "dba";
var prefix;
var ontologyData;
var dicNS = "ns:Dictionary";
var w = document.getElementById("chart").offsetWidth-2,
h = document.getElementById("chart").offsetHeight;

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
					td = "<tr><td>"+item['p']+"</td><td>"+item['o']+datatype+language+"</td></tr>"
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
	if (type == "model") {
		$.ajax({
			type: "GET",
			url: API_PATH + "/triples?repo_name=" + REPO_NAME + "&level=model",
			dataType: 'json',
			headers: {
				"Authorization": "Basic " + btoa(username + ":" + password)
			},
			success: function (data){
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
				$.ajax({
					type: "GET",
					url: API_PATH + "/types/ns:Dataset/instances?repo_name=" + REPO_NAME + "&level=model",
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
				});
			}
		});
	} else if (type == "instance") {
		$.ajax({
			type: "GET",
			url: API_PATH + "/instances/" + url + "/properties?repo_name=" + REPO_NAME + "&level=instance",
			dataType: 'json',
			headers: {
				"Authorization": "Basic " + btoa(username + ":" + password)
			},
			success: function (data){
				nodes.push({name: url, uri: url, type: "uri", scope:"instance", color:"#8000FF"})
				$.each(data, function(key, val) {
					var node1 = {name: getPrefix(data[key].object), uri: data[key].object, type: "uri", scope:"instance"};
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
					url: API_PATH + "/instances/" + url + "/second_level_properties?repo_name=" + REPO_NAME,
					dataType: 'json',
					headers: {
						"Authorization": "Basic " + btoa(username + ":" + password)
					},
					success: function (data){
						$.each(data, function(key, val) {
							var node1 = {name: getPrefix(data[key].subject), uri: data[key].subject, type: "uri", scope:"instance"};
							var node2 = {name: getPrefix(data[key].object), uri: data[key].object, type: "uri", scope: (data[key].object.indexOf("<") == 0 ? "instance" : "literals")};
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
			urlS = API_PATH + "/ontology/?endpointURL=" + endpoint + "&ontology=" + ontology;
		} else {
			urlS = API_PATH + "/ontology/resources/?endpointURL=" + endpoint + "&ontology=" + ontology + "&resource=" + resource;
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
				ontologyData = data;
				if (type == "ontology") {
					ontologyData.push({ "subject": "<" + ontology + ">", "predicate": "rdfs:subClassOf", "object": url});
				} else {
					ontologyData.push({ "subject": "<" + resource + ">", "predicate": "rdf:type", "object": url});
				}
				$.each(data, function(key, val) {
					var node1 = {name: getPrefix(data[key].subject), uri: data[key].subject, type: "uri", scope:"model"};
					node2 = {name: getPrefix(data[key].object), uri: data[key].object, type: "uri", scope:"model"};
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
				$("#load_" + type + "_button_div").show();
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

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].uri === obj.uri) {
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
	var url = API_PATH + "/triples?repo_name=" + REPO_NAME + "&level=" + level;
	$.ajax({
	    type: "POST",
	    url: url,
	    headers: {
			"Authorization": "Basic " + btoa(username + ":" + password)
		},
	    data: JSON.stringify(ontologyData),
	    async: false,
	    contentType: "application/json; charset=utf-8",
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

initPrefix("main.json");
restart(url, type, endpoint, resource);

