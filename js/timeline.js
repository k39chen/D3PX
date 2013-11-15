Raphael.fn.timeline = function (width, height, gap, data) {
	var paper = this,
		timeline = this.set(),
		nodes = this.set(),
		lines = this.set(),
		cx = width / 2,
		cy = 48,
		strokeWidth = 8,
		opacity = 0.8,
		lineColor = "rgb(230,230,230)",
		nodeColor = "rgb(200,200,200)",
		prevNode = null,
		cropOffX = 8;
	
	// create the starting node
	var start = paper.set();
	start.push(paper.circle(cx,cy,39).attr({fill:"#fff",stroke:"transparent"}));
	var startNode = paper.circle(cx,cy,36).attr({opacity:opacity,fill:"rgb(248,196,116)","stroke-width":strokeWidth,stroke:lineColor});
	var startText = paper.text(cx,cy,data.length).attr({opacity:opacity,fill:"rgb(255,255,255)","font-family":"HelveticaNeueLt","font-size":32});
	
	start.push(startNode,startText);
	
	prevNode = startNode;
	cy += gap*1.25;
	
	// create the fallen images
	var nodes = paper.set();
	for (var i=0; i<data.length; i++) {
	
		var line = paper.path("M" + [cx,prevNode.attr("cy")] + "L" + [cx,cy]).attr({"stroke-width":strokeWidth,stroke:lineColor});
		
		nodes.push(paper.circle(cx,cy,36).attr({fill:"#fff",stroke:"transparent"}));
		var node = paper.circle(cx,cy,33).attr({opacity:opacity,"stroke-width":strokeWidth,stroke:nodeColor,fill:"url(assets/images/classes/"+data[i].class.value+"/portrait_sm_"+data[i].gender.value+".jpg)"});
		
		var x = cx + (i%2? 96 : -96);
		var xBuf = i%2 ? -16 : 16;
		var anchor = i%2 ? "start" : "end";
		var dateObj = new Date(data[i].death.time*1000);
		var dateText = padZero(dateObj.getMonth()+1) + "-" + padZero(dateObj.getDate()) + "-" + dateObj.getFullYear();
		
		var dateLine = paper.path("M"+[cx,cy]+"L"+[cx,cy]).attr({"stroke-width":strokeWidth,stroke:"rgb(163,182,206)"});
		
		var labels = paper.set();
		var dateLabel = paper.text(x,cy-16,dateText).attr({fill:"rgb(180,180,180)","font-family":"HelveticaNeue","font-size":12,"text-anchor":anchor});
		var infoLabel = paper.text(x,cy,data[i].name + " (Level " + data[i].level + ")").attr({fill:"rgb(150,150,150)","font-family":"HelveticaNeue","font-size":14,"text-anchor":anchor});
		var killsLabel = paper.text(x,cy+16,formatNumber(data[i].kills.elites) + " Elites Killed").attr({fill:"rgb(142, 154, 172)","font-family":"HelveticaNeue","font-size":14,"text-anchor":anchor});
		labels.push(dateLabel,infoLabel,killsLabel);
		
		labels.attr({opacity:0});
		
		// create interactivity
		node.data("dateLine",dateLine).data("lineDest",{x:x+xBuf,y:cy}).data("labels",labels);
		node.mouseover(function(e) {
			var dest = this.data("lineDest");
			var dateLine = this.data("dateLine");
			var labels = this.data("labels");
			var x = this.attr("cx");
			var y = this.attr("cy");
			
			this.animate({opacity:1.0,transform: "s1.15 1.15",stroke:"rgb(163,182,206)"},400,"bounce");
			
			dateLine.animate({path:"M"+[x,y]+"L"+[dest.x,dest.y]},400,"ease-out");
			labels.animate({opacity:1},400,"ease-out");
		})
		.mouseout(function(e) {
			var dateLine = this.data("dateLine");
			var labels = this.data("labels");
			var x = this.attr("cx");
			var y = this.attr("cy");
		
			this.animate({opacity:opacity,transform: "s1.0 1.0",stroke:nodeColor},400,"bounce");
			
			labels.animate({opacity:0},400,"ease-out");
			dateLine.animate({path:"M"+[x,y]+"L"+[x,y]},400,"ease-out");
		});
		
		lines.push(line);
		nodes.push(node);
		prevNode = node;
		cy += gap;
	}
	
	// create interactivity
	start.mouseover(function(e) {
		startNode.animate({opacity:1.0,transform: "s1.15 1.15",stroke:"rgb(220,220,220)"},400,"bounce");
		startText.animate({opacity:1.0,transform: "s1.15 1.15"},400,"bounce");
	})
	.mouseout(function(e) {
		startNode.animate({opacity:opacity,transform: "s1.0 1.0",stroke:lineColor},400,"bounce")
		startText.animate({opacity:opacity,transform: "s1.0 1.0"},400,"bounce")
	});
	
	start.toFront();
	nodes.toFront();
	
	timeline.push(nodes);
	timeline.push(lines);
		
	return timeline;
};