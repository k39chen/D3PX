Raphael.fn.pieChart = function (width, height, r, data, defaultLabel, fontSize) {
	var paper = this,
		cx = width / 2,
		cy = height / 2,
		rad = Math.PI / 180,
		chart = this.set(),
		darkColor = "#3a3d45",
		greyColor = "#999",
		center,
		valueTxt,
		defaultTxt,
		linePos = [];
	
	function sector(cx, cy, r, startAngle, endAngle, params) {
		var x1 = cx + r * Math.cos(-startAngle * rad),
			x2 = cx + r * Math.cos(-endAngle * rad),
			y1 = cy + r * Math.sin(-startAngle * rad),
			y2 = cy + r * Math.sin(-endAngle * rad);
		return paper.path(["M", cx, cy, "L", x1, y1, "A", r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2, "z"]).attr(params);
	}
	function lineSegment(cx,cy,r,length,startAngle,endAngle,params) {
		var midAngle = (startAngle + endAngle) / 2,
			x1 = cx + r * Math.cos(-midAngle * rad),
			y1 = cy + r * Math.sin(-midAngle * rad),
			x2 = cx + (r+length) * Math.cos(-midAngle * rad),
			y2 = cy + (r+length) * Math.sin(-midAngle * rad);
			
		// within 15 pixels of the same height and in the same hemisphere
		var tolerance = 15;
		for (var k=0;k<linePos.length;k++){
			if ((x2-cx<0 && linePos[k].x-cx<0) ||
				(x2-cx>0 && linePos[k].x-cx>0))
			{
				if (Math.abs(y2-linePos[k].y) < tolerance) {
					if (y2>cy) {
						y2+=tolerance;
					} else if (y2<cy){
						y2-=tolerance;
					}
				}
			}
		}
			
		var x = x2, y = y2;
			
		if (x1 > cx) {
			x = x2 + length;
		} else if (x1 < cx) {
			x = x2 - length;
		}
		
		paper.path(["M", x1, y1, "L", x2, y2]).attr(params);
		paper.path(["M", x2, y2, "L", x, y]).attr(params);
		
		linePos.push({x:x2,y:y2});
		
		return {x:x,y:y};
	}
	
	var angle = 90, //20
		total = 0,
		start = 0,
		process = function (j) {

			if (data[j].value == 0) return;
		
			var value = data[j].value,
				displayText = data[j].text,
				color = data[j].color,
				angleplus = 360 * value / total,
				popangle = angle + (angleplus / 2),
				ms = 500,
				delta = 10,
				bcolor = Raphael.hsb(start, 1, 1),

				ls = lineSegment(cx, cy, r, 20, angle, angle + angleplus, {stroke: data[j].label == "" ? "rgba(255,255,255,0)" : "#ddd", "stroke-width": 1}),
				p = sector(cx, cy, r, angle, angle + angleplus, {fill: color, stroke: "white", "stroke-width": 2, opacity: 0.8,  filter:"url(#dropshadow)"}),
				
				txt = paper.text(
					ls.x, 
					ls.y, 
					data[j].label
				).attr({
					fill: greyColor, 
					"font-family":"HelveticaNeueLt",
					stroke: "none", 
					opacity: 0.5, 
					"font-size": 14
				}),
				txtWidth = txt.getBBox().width,
				trans = ["t",(ls.x<cx ? -1 : 1) * (txtWidth/2 + 5),0];
				txt.transform(trans);
				
			var txtX = ls.x + (ls.x<cx ? -1 : 1) * (txtWidth/2 + 5),
				txtY = ls.y;
			
			p.data("text",displayText);
			
			p.mouseover(function () {
				valueTxt.attr("text",p.data("text"));
				
				valueTxt.animate({opacity: 1.0},200);
				defaultTxt.animate({opacity: 0.0},200);
				
				p.animate({transform: "s1.10 1.10 " + cx + " " + cy}, 400, "bounce");
				p.animate({fill: color}, 120);
				p.animate({opacity: 1.0}, 120, "easeIn");
				p.animate({boxShadow:"0 1px 30px rgba(0,0,0,.2)"}, 120, "easeIn");
				
				txt.animate({transform: "s1.05 1.05 " + trans}, 120, "easeIn");
				txt.animate({opacity: 1.0}, 150, "easeIn");
				txt.animate({fill: color}, 150, "easeIn");
				txt.animate({'font-weight': 'bold'}, 150, "easeIn");
				txt.animate({'font-size': '15'}, 150, "easeIn");
				
			})
			.mouseout(function () {
				valueTxt.animate({opacity: 0.0},200);
				defaultTxt.animate({opacity: 1.0},200);
		
				p.animate({transform: ""}, 400, "bounce");
				p.animate({fill: color}, 400);
				p.animate({opacity: 0.8}, 120, "easeIn");
				
				txt.animate({transform: trans}, 120, "backOut");
				txt.animate({opacity: 0.5}, 400, "easeOut");
				txt.animate({fill: greyColor}, 400, "easeOut");
				txt.animate({'font-weight': 'regular'}, 400, "easeOut");
				txt.animate({'font-size': '14'}, 400, "easeOut");
			});

			angle += angleplus;
			chart.push(p);
			chart.push(txt);
			start += .1;
		};
		
	for (var i = 0, ii = data.length; i < ii; i++) {
		total += data[i].value;
	}
	for (i = 0; i < ii; i++) {
		process(i);
	}
	center = paper.circle(cx,cy,r/2).attr({"fill":"white","stroke":"white"});
	defaultTxt = paper.text(cx,cy,defaultLabel).attr({width:50,"fill":darkColor,"font-size":18,"font-family":"HelveticaNeueLt"});
	valueTxt = paper.text(cx,cy,"").attr({opacity:0,"fill":darkColor,"font-size":fontSize,"font-family":"HelveticaNeueLt"});
	
	return chart;
};