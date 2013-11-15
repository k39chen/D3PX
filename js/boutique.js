$.widget("D3PX.boutique", {
	options: {
		heroesData: [],
		width: 964,
		height: 480,
		
		currentIndex: 0,
		items: []
	},
	_create: function(){
		var self = this;
		var heroesData = self.options.heroesData;
		var canvas = self.element;
		
		canvas.addClass("boutique").disableSelection();
		
		// create boutique items
		self.options.items = [];
		
		if (heroesData.length > 0) {
			for (var i=0; i<heroesData.length; i++) {
				var item = $("<div>")
					.boutiqueItem({index: i, boutique: canvas, heroData: heroesData[i]})
					.appendTo(canvas);
				self.options.items.push(item);
			}
		} else {
			// create a placeholder otherwise
			var item = $("<div>")
				.boutiqueItem({index: 0, boutique: canvas, heroData: null})
				.appendTo(canvas);			
			self.options.items.push(item);
		}
		
		// create controls
		var boutiqueControls = $("<div>").addClass("boutiqueControls").disableSelection();
		canvas.after(boutiqueControls);
		var prevBtn = $("<div>").addClass("prevCtrl control").append("<img src='" + DIRECTORY.ICONS + "prev.png'>").appendTo(boutiqueControls);
		var counterContainer = $("<div>").addClass("counterContainer").appendTo(boutiqueControls);
		var currentCount = $("<span>").addClass("currentCount").appendTo(counterContainer);
		var slashCount = $("<span>").addClass("slashCount").append("/").appendTo(counterContainer);
		var totalCount = $("<span>").addClass("totalCount").appendTo(counterContainer);	
		var nextBtn = $("<div>").addClass("nextCtrl control").append("<img src='" + DIRECTORY.ICONS + "next.png'>").appendTo(boutiqueControls);
		
		// set up interactivity
		if (self.options.items.length > 1) {
			prevBtn.hover(
				function(){ $(this).css({opacity:0.1}).stop().animate({opacity:0.3},200,"swing"); },
				function(){ $(this).css({opacity:0.3}).stop().animate({opacity:0.1},200,"swing"); }
			).click(function(e){
				e.stopPropagation();
				self.prev();
			});
			nextBtn.hover(
				function(){ $(this).css({opacity:0.1}).stop().animate({opacity:0.3},200,"swing"); },
				function(){ $(this).css({opacity:0.3}).stop().animate({opacity:0.1},200,"swing"); }
			).click(function(e){
				e.stopPropagation();
				self.next();
			});
		} else {
			prevBtn.css("cursor", "default");
			nextBtn.css("cursor", "default");
		}
		
		// move everything to the intial set up
		self.move(0,false);
	},
	move: function(index,isAnimated) {
		var items = this.options.items;
		var currentIndex = index;
		
		this.options.currentIndex = currentIndex;
		
		// reset display order allocation
		var displayOrder = [-1,-1,-1,-1,-1];
		
		// configure the allocation amounts and placements
		var startOrder, leftAlloc, rightAlloc;
		switch (items.length) {
			case 1:  startOrder = 2; leftAlloc = 0; rightAlloc = 0; break;
			case 2:  startOrder = 2; leftAlloc = 0; rightAlloc = 1; break;
			case 3:  startOrder = 1; leftAlloc = 1; rightAlloc = 1; break;
			case 4:  startOrder = 1; leftAlloc = 1; rightAlloc = 2; break;
			default: startOrder = 0; leftAlloc = 2; rightAlloc = 2; break;
		}
		
		// determine the display order
		for (var i=-leftAlloc,order=startOrder; i<=rightAlloc; i++,order++) {
			var index = (currentIndex + i) % items.length;
			index = index<0 ? index+items.length : index;
			displayOrder[order] = index;
		}
	
		// assign the order and tiers
		for (var i=0; i<items.length; i++) {
			var tier=-1, order=0, foundOrder = false;
			
			// find the corresponding order for this hero item, if it is 
			// in the current display order
			for (; order<displayOrder.length; order++) {
				if (i == displayOrder[order]) {
					foundOrder = true;
					break;
				}
			}
			// determine the tier it belongs to
			if (foundOrder) {
				switch (order) {
					case 0: case 4: tier = 2; break;
					case 1: case 3: tier = 1; break;
					case 2: default: tier = 0; break;
				}
			} else {
				order = -1;
			}
			
			// set the item in the new position
			items[i].boutiqueItem("toPosition", {tier:tier,order:order,isAnimated:isAnimated});
		}
		
		// update the counter
		$(".boutiqueControls .currentCount").html(this.options.heroesData.length == 0 ? 0 : currentIndex+1);
		$(".boutiqueControls .totalCount").html(this.options.heroesData.length);
	},
	to: function(index) {
		this.move(index,true);
	},
	prev: function(){
		var prevIndex = (this.options.currentIndex-1) % this.options.items.length;
		prevIndex = prevIndex<0 ? prevIndex + this.options.items.length : prevIndex;
		this.move(prevIndex,true);
	},
	next: function(){
		var nextIndex = (this.options.currentIndex+1) % this.options.items.length;
		this.move(nextIndex,true);
	},
	getWidth: function() {
		return this.options.width;
	},
	getHeight: function() {
		return this.options.height;
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
		self.element.removeClass("boutique");
		
		$(".boutiqueControls").remove();
	}
});