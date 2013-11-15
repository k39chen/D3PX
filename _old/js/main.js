$(document).ready(function(){

//================================================================================
// * ENUMERATIONS/TYPES
//================================================================================

	var SCREEN_SPLASH = 0;
	var SCREEN_PLAYER = 1;
	var SCREEN_HERO = 2;
	var NUM_SCREENS = 3;
	
	var SECTION_GEAR = "gear";
	var SECTION_SKILLS = "skills";
	var SECTION_FOLLOWERS = "followers";
	var SECTION_MONSTERS = "monsters";
	var SECTION_SHRINES = "shrines";
	var SECTION_PARAGON = "paragon";

//================================================================================
// * STATES
//================================================================================

	var currentScreen = SCREEN_SPLASH;
	
	var currentPlayer = null;
	var currentHero = null;

//================================================================================
// * MAIN EXECUTION
//================================================================================

	// initialize the application
	initialize();
	
	$(".classCrest").each(function(){$(this).classCrest((Math.floor(Math.random()*1000) / 10).toFixed(1) + "%")});
	
	// initialize all search bars
	$(".searchBar").searchBar(function(ui,server,battletag){
		// issue player profile request
		$(".loader", ui).show();
		$(".icon", ui).hide();
		
		D3.fetchPlayer(new D3.Player(server,battletag), function(playerData){
			if (playerData != null) {
				currentPlayer = playerData;
				switchScreen(SCREEN_PLAYER, playerData);
			} else {
				showDialog(server,battletag);
			}
			$(".loader", ui).hide();
			$(".icon", ui).show();
		});
	});
	
	$("#goBackBtn").click(function(){
		switchScreen(SCREEN_SPLASH);
	});
		 
	/*
	var attributesContainer = $("#attributesContainer");
	
	var attributes = {
		"Summary": ["Level", "Paragon Level", "Damage per Second", "Effective Health Points"],
		"Core Attributes": ["Strength", "Dexterity", "Intelligence", "Vitality", "Armor"],
		"Offense": ["Attacks per Second (Main Hand)", "Attacks per Second (Off Hand)", "Weapon Damage (Main Hand)", "Weapon Damage (Off Hand)", "Attack Speed Bonus", "Critical Hit Chance", "Critical Hit Damage", "Damage Against Elites"],
		"Defense": ["Average Block Amount", "Block Chance", "Dodge Chance", "Damage Reduction", "Crowd Control Reduction", "Missile Damage Reduction", "Melee Damage Reduction", "Elite Damage Reduction", "Thorns"],
		"Resistances": ["Physical Resistance", "Cold Resistance", "Fire Resistance", "Lightning Resistance", "Poison Resistance", "Arcane Resistance", "Holy Resistance"],
		"Life": ["Maximum Life", "Total Life Bonus", "Life per Second", "Life Steal", "Life per Kill", "Life per Hit", "Health Globe Healing Bonus"],
		"Resource": ["Maximum Spirit", "Spirit Regenerated per Second"]
	};
	
	for (var sectionName in attributes) {
		var section = $("<div>").addClass("attributeSection").appendTo(attributesContainer);
		var header = $("<div>").addClass("attributeSectionName wrapper").appendTo(section);
	
		var icon = $("<img class='icon left' />");
	
		switch (sectionName) {
			case "Summary":			icon.attr("src", "assets/icons/summary.png"); break;
			case "Core Attributes":	icon.attr("src", "assets/icons/attributes.png"); break;
			case "Offense":			icon.attr("src", "assets/icons/axe.png"); break;
			case "Defense":			icon.attr("src", "assets/icons/shield.png"); break;
			case "Resistances":		icon.attr("src", "assets/icons/nuclear.png"); break;
			case "Life": 			icon.attr("src", "assets/icons/potion.png"); break;
			case "Resource": 		icon.attr("src", "assets/icons/energy.png"); break;
		}
		header.append(icon);
		header.append("<span class='text left'>" + sectionName + "</span>");
		
		for (var i=0; i<attributes[sectionName].length; i++) {
			var field = $("<div>").addClass("attributeField wrapper").appendTo(section);

		
			var name = $("<div>").addClass("text left").append(attributes[sectionName][i]).appendTo(field);
			var number = $("<div>").addClass("number right").append(Math.floor(Math.random()*10000).toFixed(Math.floor(Math.random()*2)) + ((Math.floor(Math.random()*5) == 0) ? "%" : "")).appendTo(field);
		
			if (i%2 == 0) {
				field.addClass("even");
			} else {
				field.addClass("odd");
			}
		}	
	}
	enableHoverState($(".attributeField"));
	*/
	
//================================================================================
// * ELEMENT CREATION METHODS
//================================================================================	
	
	// ...
	
//================================================================================
// * APPLICATION METHODS
//================================================================================	

	/**
	 * Initializes the application
	 * 
	 * @method initialize
	 */
	function initialize() {
		calculateDimensions();
		$(window).resize(function(){
			calculateDimensions();
		});
				
		// initialize the dialog
		initDialog();
		
		// initialize the screens
		initScreens();
	}
	
	/**
	 * Calculate dimensions for objects in the DOM.
	 *
	 * @calculateDimensions
	 */
	function calculateDimensions() {
		var centerPanelWidth = $(window).width() - 240 - 360;
		var centerPanelHeight= $(window).height();
		
		$("#centerPanel").width(centerPanelWidth);
		$("#centerPanel").height(centerPanelHeight);
	}
	
//================================================================================
// * SCREENS
//================================================================================
	
	function initScreens() {
		$(".screen").hide();
		$(".screen[value=" + currentScreen + "]").show();
		
		$("body").keyup(function(e){
			e.stopPropagation();
			e.preventDefault();
			
			if (e.keyCode == 8 && !$("input").is(":focus")) {
				switchScreen(Math.max(currentScreen-1,0));
			}
		});
	}
	function switchScreen(screen) {
		var oldScreen = currentScreen;
		var newScreen = screen;
	
		if (oldScreen == newScreen) return;
	
		// assign the current screen to the new screen
		currentScreen = screen;
		
		// establish the animation specifications
		var width = $(window).width();
		var duration = 1000;
		var easing = "swing";
		
		// create the screen that will be displayed before we animate it in
		switch (screen) {
			case SCREEN_PLAYER:	createPlayerScreen(); break;
			case SCREEN_HERO:	createHeroScreen(); break;
			case SCREEN_SPLASH:	// fall-through
			default: break;
		}
		
		// perform the animation
		if (newScreen > oldScreen) {
			getScreen(oldScreen).css({left:0}).stop().animate({left:-width},duration, easing, function(){$(this).hide();});
			getScreen(newScreen).show().css({left:width}).stop().animate({left:0}, duration, easing);
		} else {
			getScreen(oldScreen).css({left:0}).stop().animate({left:width},duration, easing, function(){$(this).hide();});
			getScreen(newScreen).show().css({left:-width}).stop().animate({left:0},duration,easing);
		}
	}
	function createPlayerScreen(){
		var screen = $("#playerScreen");
		
		console.log(currentPlayer);
		
		$(".battletag", screen).html(currentPlayer.battletag);
	}
	function createHeroScreen(heroData){
	}
	function getScreen(screen) {
		return $(".screen[value='" + screen + "']");
	}

});
	
//================================================================================
// * UTILITIES
//================================================================================

/**
 * Enable hover state.
 * 
 * @method enableHoverState
 * @param {Object} The result of a selector query.
 * @return {Object} For chained calls
 */
function enableHoverState(objects) {
	return objects.hover(
		function(){
			$(this).addClass("hovered");
		},
		function(){
			$(this).removeClass("hovered");
		}
	);
}

//================================================================================
// * PSEUDO-WIDGETS
//================================================================================
function initDialog() {
	hideDialog();
	
	$("body").keyup(function(e){
		if (e.keyCode == 27) {			
			if (!$("#modalDialog").is(":hidden")) {
				hideDialog();
			}
		}
	});
	$("#modalDialog .icon").icon(function(){
		hideDialog();
	});
	$("#modalDialog .closeBtn").click(function(){
		hideDialog();
	});
}
function showDialog(server, battletag) {
	$("#modalDialog .server").html(server.label);
	$("#modalDialog .battletag").html(battletag);
	
	$("#modalDialog").css({top: ($(window).height() - $("#modalDialog").height())/2});
	
	$("#modalBg").show();
	$("#modalDialog").show();

}
function hideDialog() {
	$("#modalBg").hide();
	$("#modalDialog").hide();
}

//================================================================================
// * WIDGETS
//================================================================================
$("html").click(function(){
	$(".dismissable").hide();
});

(function($){

	$.fn.classCrest = function(caption) {
		var self = $(this);
		var dir = "";
		var text = "";
		
		if (self.hasClass("barbarian")) {dir = "barbarian"; text = "BARBARIAN"; }
		if (self.hasClass("demon-hunter")) {dir = "demon-hunter"; text = "DEMON HUNTER"; }
		if (self.hasClass("monk")) {dir = "monk"; text = "MONK"; }
		if (self.hasClass("witch-doctor")) {dir = "witch-doctor"; text = "WITCH DOCTOR"; }
		if (self.hasClass("wizard")) {dir = "wizard"; text = "WIZARD"; }
		if (dir == "") return;
		
		dir = "assets/images/classes/" + dir + "/";
		
		var crest = $("<img>").addClass("crest").attr("src", dir + "crest.png").appendTo(self);
		var textContainer = $("<div>").addClass("textContainer").appendTo(self);
		var glow = $("<img>").addClass("glow").attr("src", dir + "glow.png").appendTo(textContainer);
		var text = $("<div>").addClass("text").append(text).appendTo(textContainer);
		var caption = $("<div>").addClass("caption").append(caption).appendTo(textContainer);
	
	};

	$.fn.icon = function(clickCB) {
		var self = $(this);
		
		var defaultImg = $("<img>").addClass("default").attr("src", self.attr("src")).appendTo(self);
		var hoveredImg = $("<img>").addClass("hovered").attr("src", self.attr("src")).appendTo(self);
		
		hoveredImg.css({left: -self.width(), opacity: 0.0});
		
		self.hover(
			function(){
				hoveredImg.css({opacity:0.0}).stop().animate({opacity:1.0},300);
			},
			function(){
				hoveredImg.css({opacity:1.0}).stop().animate({opacity:0.0},300);
			}
		);
	};

	$.fn.searchBar = function(searchCB){
		var self = $(this);
		
		// construct the widget
		var icon = $("<img>").addClass("icon").attr("src", "assets/icons/search.png");
		var loader = $("<img>").addClass("loader").attr("src", "assets/loading.gif").hide();
		var input = $("<input>").addClass("battletag").attr("type","text").attr("placeholder", "Search battletag...");
		var server = $("<span>").addClass("server");
		
		var miniMenu = $("<div>").addClass("miniMenu dismissable").appendTo("body").hide();
		for (var name in D3.Server) {
			var item = $("<div>").addClass("item").attr("value",D3.Server[name].value).append(name).appendTo(miniMenu) 	;
		}
		enableHoverState($(".item", miniMenu));
		enableHoverState(server);
		
		self.append(icon,loader,input,server);
		
		// default server
		assignServer(D3.Server.US);
		
		// bind events
		$(".battletag",this)
			.data("parent", self)
			.keyup(function(e){
				var parent = $(this).data("parent");
				if (e.keyCode == 13) {
					if (searchCB) {
						// forward the server and battletag
						searchCB(
							parent,
							D3.Server[$(".server",parent).val().toUpperCase()],
							$(".battletag",parent).val()
						);
					}
					$(this).val("").blur();
				}
			 });
		$(".server",this)
			.data("parent",self)
			.click(function(event){
				event.stopPropagation();
				
				$(".miniMenu .item").show();
				$(".miniMenu .item[value=" + $(this).val() + "]").hide();
				
				$(".miniMenu").css({
					left: $(this).offset().left - 2,
					top: $(this).offset().top + 22
				}).show();
			 });
		$(".miniMenu .item").click(function(){
			assignServer(D3.Server[$(this).val().toUpperCase()]);
		});
		
		function assignServer(server) {
			$(".server", self).html(server.value.toUpperCase()).attr("value", server.value);
		}
	};

})(jQuery);
