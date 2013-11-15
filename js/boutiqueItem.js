$.widget("D3PX.boutiqueItem", {
	options: {
		index: -1,
		boutique: null,
		heroData: {},
		width: 272,
		height: 368
	},
	_create: function(){
		var self = this;
		var b = self.options.boutique;
		var bDim = {w:b.boutique("getWidth"), h:b.boutique("getHeight")};
		var dim = {w: this.options.width, h: this.options.height};
		var heroData = self.options.heroData;
		var hero = self.element;
		var canvas = $("<div>").addClass("canvas").appendTo(hero);
		
		hero.addClass("hero boutiqueItem").data("heroData", heroData).data("index", self.options.index).disableSelection();
		
		// create a place holder if there is none specified
		if (heroData == null) {
			canvas.addClass("placeholder");
			var placeholderText = $("<div>").addClass("placeholderText").append("No heroes owned by this player.").appendTo(canvas);
			return; 
		}
		
		var info = $("<div>").addClass("info").appendTo(canvas);
		
		var hHardcore = $("<span>").addClass("hardcore").append("Hardcore ");
		var hClass = $("<div>").addClass("hClass label").append(heroData.class.label).appendTo(info)
		
		var hName = $("<div>").addClass("hName").append(heroData.name).appendTo(info);
		var portrait = $("<div>").addClass("portrait lg").appendTo(info);

		portrait.addClass(heroData.class.value);
		portrait.addClass(heroData.gender.label);
		
		if (heroData.hardcore) {
			hClass.prepend(hHardcore);
			portrait.addClass("hardcore");
		}
		
		var levelContainer = $("<div>").addClass("levelContainer").appendTo(canvas);
		
		var hLevelGroup = $("<div>").addClass("hLevelGroup levelGroup")
			.append("<div class='label'>LEVEL</div>")
			.append("<div class='hLevel value'>" + heroData.level + "</div>")
			.appendTo(levelContainer);
			
		if (heroData.paragonLevel > 0) {
			levelContainer.append("<div class='separator'></div>");
			var hLevelGroup = $("<div>").addClass("hLevelGroup levelGroup")
				.append("<div class='label'>PARAGON</div>")
				.append("<div class='pLevel value'>" + heroData.paragonLevel + "</div>")
				.appendTo(levelContainer);
		}
		
		var inspectBtn = $("<button>").addClass("inspectBtn").append("INSPECT").appendTo(canvas);

		// we will initialize everything to the starting position
		hero.css({
			left: (bDim.w-dim.w)*0.5,
			top: (bDim.h-dim.h)*0.5
		});
		
		// set up interactivity
		hero.hover(
			function(){ $(this).addClass("hovered"); },
			function(){ $(this).removeClass("hovered"); }
		).click(function(){
			b.boutique("to", $(this).data("index"));
		});
		
	},
	toPosition: function(properties) {
		var tier = properties.tier,
			order = properties.order,
			
			// boutique properties
			b = this.options.boutique,
			bDim = {w:b.boutique("getWidth"), h:b.boutique("getHeight")},
			
			// boutique item elements
			hero = this.element, 
			heroOp = hero.css("opacity"),
			canvas = $(".canvas", hero), 
			canvasOp = canvas.css("opacity"),
			info = $(".info", hero), 
			infoOp = info.css("opacity"),
			levels = $(".levelContainer", hero), 
			levelsOp = levels.css("opacity"),
			inspect = $(".inspectBtn", hero), 
			inspectOp = inspect.css("opacity"),
			
			// boutique item properties
			dim = {w: this.options.width, h: this.options.height},
			left = hero.css("left"),
			top = hero.css("top"),
			height = dim.h,
			bgColor = "rgb(255,255,255)",
			zIndex,
			
			// animation properties
			animDuration = properties.isAnimated ? 750 : 0,
			animEasing = "easeOutExpo";
			
		// configure animations based on the order
		switch (order) {
			case 0:  left = (bDim.w-dim.w) * 0.10; break;
			case 1:  left = (bDim.w-dim.w) * 0.25; break;
			case 2:  left = (bDim.w-dim.w) * 0.50; break;
			case 3:  left = (bDim.w-dim.w) * 0.75; break;
			case 4:  left = (bDim.w-dim.w) * 0.90; break;
			default: break;
		} 
		// configure animations based on the assigned tier
		switch (tier) {
			case 0:  zIndex = 1004; height = dim.h*1.00; top = (bDim.h-height)*0.5; canvasOp = 1.0; heroOp = 1.0; infoOp = 1.0; levelsOp = 1.0; inspectOp = 1.0; break;
			case 1:  zIndex = 1003; height = dim.h*0.70; top = (bDim.h-height)*0.5; canvasOp = 0.6; heroOp = 1.0; infoOp = 1.0; levelsOp = 0.0; inspectOp = 0.0; break;
			case 2:  zIndex = 1002; height = dim.h*0.40; top = (bDim.h-height)*0.5; canvasOp = 0.0; heroOp = 1.0; infoOp = 0.0; levelsOp = 0.0; inspectOp = 0.0; break;
			default: zIndex = 1001; height = dim.h*0.00; top = (bDim.h-height)*0.5; canvasOp = 0.0; heroOp = 0.0; infoOp = 0.0; levelsOp = 0.0; inspectOp = 0.0; break;
		}
		hero.attr("tier",tier);
		
		// commit the settings
		if (heroOp == 1.0) hero.show();
		hero.css({
			zIndex: zIndex,
			left: hero.css("left"),
			top: hero.css("top"),
			height: hero.css("height")
		}).stop().animate({
			left: left,
			top: top,
			height: height,
			opacity: heroOp
		}, animDuration, animEasing, function(){
			if (heroOp == 0.0) hero.hide();
		});
		
		canvas.stop().animate({opacity:canvasOp}, animDuration, animEasing);
		info.stop().animate({opacity:infoOp}, animDuration, animEasing);
		levels.stop().animate({opacity:levelsOp}, animDuration, animEasing);
		inspect.stop().animate({opacity:inspectOp}, animDuration, animEasing);
	},
	_setOptions: function(){
		this._superApply(arguments);
		this._create();
	},
	_setOption: function(key, value) {
		this._super(key, value);
	},
	_destroy: function() {
		var self = this;
		self.element.empty();
		self.element.removeClass("boutiqueItem");
	}
});