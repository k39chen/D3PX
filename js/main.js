var DIRECTORY = {
	IMAGES: "assets/images/",
	ICONS: "assets/images/icons/"
};

$(document).ready(function(){

	// LOGO
	$(".logo").click(function(){
		showSplash();
	});
	
	// NOTIFICATION BAR 
	$("#notificationbar").notificationbar();
	
	// SEARCHBAR
	$("#searchBar").searchBar({
		searchCB: function(ui,server,battletag){
			var player = new D3.Player(server,battletag);
			
			// update the icon
			ui.setBusy();
			
			// hide all existing data while we attempt to load the player
			if (!player.inCache()) {
				$("#notificationbar").notificationbar("show", "searching", {battletag:battletag,server:server});
			}
			
			D3.fetchPlayer(player, function(playerData){
				if (playerData != null) {
					$("#notificationbar").notificationbar("hide",0,function(){
						showPlayerProfile(playerData);	
					});
				} else {
					$("#notificationbar")
						.notificationbar("show", "error", {battletag:battletag,server:server})
						.notificationbar("hide",2000);
					ui.focus();
				}
				ui.setActive();
			});
		}
	});
	
	// show the splash screen at startup
	showSplash();
});

//========================================================================================================
// * D3PX SPLASH SCREEN
//========================================================================================================

function showSplash() {
	
	var wasHidden = $("#splash").height() < 1;
	
	// center the splash content
	$("#splash .content").css({marginLeft:($(window).width() - 964)/2});
	
	// preconfiguration for the animation sequence
	$("#splash .animatedText .heroText").css({opacity:0});
	$("#splash .animatedText .sidekickText").css({opacity:0});
	$("#splash .mask").css({opacity:0});
	$("#splash .animatedText .heroText .collapsible").css({width:"auto",opacity:1});
	
	// perform the animation sequence
	$("#splash").stop().animate({height:560,opacity:1},wasHidden?1000:0,"swing",function(){
		$("#splash .mask").stop().delay(500).css({opacity:0}).stop().animate({opacity:1},2000,"swing",function(){
			$("#splash .animatedText .heroText").css({opacity:0}).stop().animate({opacity:1},1000,"swing", function(){			
				$("#splash .animatedText .heroText .collapsible").stop().delay(500).stop().animate({width:0,opacity:0},1000,"swing", function(){
					$("#splash .animatedText .sidekickText").css({opacity:0}).stop().animate({opacity:1},1000,"swing");
				});
			});
		});
	});
	
	// hide the player profile sections when the splash screen is shown
	$(".section").stop().animate({opacity:0},wasHidden?1000:0,"swing",function(){
		$(".section").hide();
	});
}

//========================================================================================================
// * PLAYER PROFILE SCREEN
//========================================================================================================

function showPlayerProfile(playerData) {

	console.log(playerData);

	// show the sections and hide the other screens
	$(".section").css({opacity:0}).show().stop().animate({opacity:1},1000,"swing");
	$("#splash").css({opacity:1}).stop().animate({opacity:0,height:0},1000,"swing");
	
	// start loading the player data
	console.log("Loading: ", playerData);
	
	// create the sections on the player profile screen
	createTitlebar(playerData);
	createHeroesSection(playerData);
	createStatisticsSection(playerData);
	createFallenHeroesSection(playerData);
	createProgressionSection(playerData);
}

//========================================================================================================
// * PLAYER PROFILE PANELS
//========================================================================================================

//--------------------------------------------------------------------------------------------------------
// * TITLEBAR
//--------------------------------------------------------------------------------------------------------
function createTitlebar(playerData) {
	$("#titlebar .server").html(playerData.server.label);
	$("#titlebar .battletag").html(playerData.battletag);
}
//--------------------------------------------------------------------------------------------------------
// * HEROES
//--------------------------------------------------------------------------------------------------------
function createHeroesSection(playerData) {
	var boutique = $("#heroBoutiqueContainer");
	if (boutique.hasClass("boutique")) boutique.boutique("destroy");
	boutique.boutique({heroesData: playerData.heroes});
}
//--------------------------------------------------------------------------------------------------------
// * STATISTICS
//--------------------------------------------------------------------------------------------------------
function createStatisticsSection(playerData) {

	// create charts
	createTimePlayed(playerData);
	createKillCountChart(playerData);
	
	// load statistics
	$("#lifetimeKills").html(formatNumber(playerData.kills.monsters));
	$("#eliteKills").html(formatNumber(playerData.kills.elites));
	$("#hardcoreKills").html(formatNumber(playerData.kills.hardcoreMonsters));
	
	createClassCounters(playerData);

	//+++++++++++++++++++
	// HELPER FUNCTIONS
	//+++++++++++++++++++
	
	function createClassCounters(playerData) {
		// set up the counters
		var counters = {
			"barbarian": [], 
			"demon-hunter": [],
			"monk": [],
			"witch-doctor": [],
			"wizard": []
		};
		// count the heroes and qualify them by classes
		for (var i=0; i<playerData.heroes.length; i++) {
			var hero = playerData.heroes[i];
			counters[hero.class.value].push(hero);
		} for (var i=0; i<playerData.fallenHeroes.length; i++) {
			var hero = playerData.heroes[i];
			counters[hero.class.value].push(hero);
		}
		// convert the counters hashmap to an array so we can sort it
		var data = [];
		for (var type in counters) {
			var obj = {};
			obj.type = type;
			obj.averageLevel = 0;
			for (var i=0; i<counters[type].length; i++) 
				obj.averageLevel += (counters[type][i].level + counters[type][i].paragonLevel);
			obj.list = counters[type];
			data.push(obj);
		}
		data.sort(function(a,b){
			if (b.list.length == a.list.length) {
				return b.averageLevel - a.averageLevel;
			}
			return b.list.length-a.list.length;
		});
		
		// create the interface
		var container = $("#timePlayedContainer .statsGroup").empty();
		for (var i=0; i<data.length; i++) {
			
			var stat = $("<div>").addClass("stat").appendTo(container);
			var counter = $("<div>").addClass("counter").appendTo(stat);
			var value = $("<div>").addClass("value").append(data[i].list.length).appendTo(counter);
			var label = $("<div>").addClass("label").append(capitalize(data[i].type.replace(/-/g," ")) + ((data[i].list.length == 1) ? "" : "s")).appendTo(counter);
			var portraits = $("<div>").addClass("portraits").appendTo(stat);
			
			for (var j=0; j<data[i].list.length; j++) {
				var hero = data[i].list[j];
				var portrait = $("<div>").addClass("portrait xsm " + hero.class.value + " " + hero.gender.label)
					.attr("title", hero.name)
					.tooltip({
						show: null,
						hide: null,
						position: {my: "center bottom", at: "center top-5"
					 }})
					.appendTo(portraits);
				if (hero.hardcore) portrait.addClass("hardcore");
			}
			
			if (i == data.length - 1) stat.addClass("last");
		}
	}

	function createTimePlayed(playerData) {
		
		// define specifications for the chart
		var w = 500, h = 400, r = 100, s = 18;
		
		$("#timePlayedChart").empty();
		
		// aggregate the chart data
		var chartData = [];
		
		// calculate the total time
		var total = 0;
		for (var type in playerData.timePlayed) total+=playerData.timePlayed[type];
		
		// calculate the percentage amount each datum has in relation to the total
		for (var type in playerData.timePlayed) {
			var data = {label: "", color: "", text: "", value: 0.0};
			var pct = playerData.timePlayed[type] / total;
			data.text = (pct*100).toFixed(1) + "%";
			
			data.value = (pct == 0) ? 0 : Math.max(0.01,pct);
			
			switch (type) {
				case D3.Class.BARBARIAN.value: 		data.label = "Barbarian"; data.color = "#F13535"; break;
				case D3.Class.DEMONHUNTER.value: 	data.label = "DH"; data.color = "#C954C4"; break;
				case D3.Class.MONK.value: 			data.label = "Monk"; data.color = "#FFAD00"; break;
				case D3.Class.WITCHDOCTOR.value: 	data.label = "WD"; data.color = "#4ADD3E"; break;
				case D3.Class.WIZARD.value: 		data.label = "Wizard"; data.color = "#6C83FC"; break;
				default: break;
			}
			chartData.push(data);
		}
		
		// create the actual chart
		Raphael("timePlayedChart",w,h).pieChart(w,h,r,chartData,"Time\nPlayed",s);
	}

	function createKillCountChart(playerData) {

		// define specifications for the chart
		var w = 500, h = 400, r = 100, s = 18;
		
		$("#killCountChart").empty();

		// aggregate the chart data
		var chartData = [];
		
		// calculate the total elite kills
		var total = playerData.kills.elites;
		var hsv = {
			"barbarian"		: {h: 0, s: 80, v: 60},
			"demon-hunter"	: {h: 300, s: 60, v: 60},
			"monk"			: {h: 36, s: 100, v: 60},
			"witch-doctor"	: {h: 120, s: 60, v: 60},
			"wizard"		: {h: 240, s: 80, v: 70}
		};
		
		var unaccountable = {
			label: "Unaccountable",
			color: "rgb(179,179,179)",
			text: total,
			value: 0.0,
			hClass: "zzzzzz"
		};
		for (var i=0; i<playerData.heroes.length; i++) chartData.push(aggregateData(playerData.heroes[i]));
		for (var i=0; i<playerData.fallenHeroes.length; i++) chartData.push(aggregateData(playerData.fallenHeroes[i]));
		
		unaccountable.value = (unaccountable.text == 0) ? 0 : Math.max(0.01,unaccountable.text / total);
		unaccountable.text = formatNumber(unaccountable.text);
		chartData.push(unaccountable);
		
		// order the chart data by class, with a second order of number of greatest value
		chartData.sort(function(a,b){
			if (b.hClass === a.hClass) {
				return b.value - a.value;
			}
			if(a.hClass < b.hClass) return -1;
			if(a.hClass > b.hClass) return 1;
			return 0;
		});
		
		// create the actual chart
		Raphael("killCountChart",w,h).pieChart(w,h,r,chartData, "Elite Kills",s);
		
		// helper function for aggregating the kill count data
		function aggregateData(hero) {
			var data = {label: "", color: "", text: "", value: 0.0};
			var raw = hero.kills.elites;
			var pct = raw / total;
			
			unaccountable.text -= raw;
			
			var hue = hsv[hero.class.value].h, 
				sat = hsv[hero.class.value].s, 
				lgt = hsv[hero.class.value].v
			
			data.hClass = hero.class.value;
			data.label = hero.name;
			data.color = "hsl(" + [hue,sat,lgt] + ")";
			data.text = formatNumber(raw);
			data.value = (pct == 0) ? 0 : Math.max(0.01,pct);
		
			return data;
		}
	}
}
//--------------------------------------------------------------------------------------------------------
// * FALLEN HEROES
//--------------------------------------------------------------------------------------------------------
function createFallenHeroesSection(playerData) {

	var nodes = playerData.fallenHeroes,
		g = 96,
		w = 900,
		h = 48 + g*(1.25+nodes.length);
	
	$("#fallenHeroesTimeline").empty();
	
	
	// create the timeline
	Raphael("fallenHeroesTimeline",w,h).timeline(w,h,g,nodes);
}
//--------------------------------------------------------------------------------------------------------
// * PROGRESSION
//--------------------------------------------------------------------------------------------------------
function createProgressionSection(playerData) {

	// define specifications for the chart
	var w = 482, h = 350, r = 110, s = 16;
	
	$("#regularProgressionChart").empty();
	$("#hardcoreProgressionChart").empty();
	
	// create the actual chart
	Raphael("regularProgressionChart",w,h).pieChart(w,h,r,getProgressionChartData("progression",18,119),"Regular\nCompletion",s);
	Raphael("hardcoreProgressionChart",w,h).pieChart(w,h,r,getProgressionChartData("hardcoreProgression",280,360),"Hardcore\nCompletion",s);
	
	//+++++++++++++++++++
	// HELPER FUNCTIONS
	//+++++++++++++++++++
	
	function getProgressionChartData(type,start,end) {
		var chartData = [];
	
		var totalActs = 0, actsCompleted = 0, totalQuests = 0;
		for (var difficulty in playerData[type]) {
			var actNum = 1;
			for (var act in playerData[type][difficulty]) {
				var data = {label: "", color: "", text: "", value: 0.0};
				
				chartData.push({
					label: capitalize(difficulty) + "\nAct " + actNum,
					color: "hsl(119,100,44)",
					text: playerData[type][difficulty][act].completedQuests.length + " Quests\nCompleted",
					value: 0.0
				});
				
				if (playerData[type][difficulty][act].completed) {
					actsCompleted++;
				}
				
				totalQuests += playerData[type][difficulty][act].completedQuests.length;
				actNum++;
				totalActs++;
			}
		}
		// recalibrate the data based on the number of acts completed
		var pct = actsCompleted / totalActs;
		for (var i=0; i<chartData.length; i++) {
			var notcomplete = i>=actsCompleted;
			chartData[i].color = "hsl(" + [start+(end-start)*(i/totalActs),notcomplete?0:100,notcomplete?70:44] + ")";
			chartData[i].value = 1 / totalActs;
		}
		
		var value = (pct*100).toFixed(0) + "%";
		
		switch (type) {
			case "progression": 
				$("#regularProgressionPct").html(getVL(value,"Completion")); 
				$("#regularProgressionQuests").html(getVL(totalQuests,"Quests")); 
				break;
			case "hardcoreProgression": 
				$("#hardcoreProgressionPct").html(getVL(value,"Completion")); 
				$("#hardcoreProgressionQuests").html(getVL(totalQuests,"Quests")); 
				break;
			default: 
				break;
		}
		
		function getVL(value,label) {
			return "<div class='label'>" + label + "</div><div class='value'>" + value + "</div>";
		}
		
		return chartData;
	}
}