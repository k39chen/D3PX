$.widget("D3PX.notificationbar", {
	options: {
		_hidden: true
	},
	_create: function(){
		var self = this;
		self.element.addClass("notificationbar");
		self.element.append("<div class='content'><div class='message'></div></div>");

		$(window).scroll(function(e){
			if (self.element.css("position") != "fixed") {
				if ($(this).scrollTop() > 84) {
					self.element.css({position: "fixed", top: 0});
				}
			} else {
				if ($(this).scrollTop() <= 84) {
					self.element.css({position: "relative"});
				}
			}
		});
		
		self.hide(0,null,false);
	},
	show: function(type,data){
		var elem = this.element;
		var message;
		
		elem.removeClass("searching").removeClass("loaded").addClass(type);
		
		switch (type) {
			case "searching":
				message = "Searching for " + data.battletag + " on " + data.server.label + ".";
				elem.css({backgroundColor:"rgb(108,137,238)"}).stop().animate({height:71},300);
				break;
			case "error":
				message = "Could not find " + data.battletag + " on " + data.server.label + ".";
				elem.css({backgroundColor:"rgb(243,100,100)"}).stop().animate({height:71},300);
				break;
			default:
				break;
		}
		
		$(".message",elem).html(message).animate({opacity:0.7},300);
	},
	hide: function(delay,cb,isAnimated){
		var elem = this.element;
		var self = this;
		
		$(".message", elem).delay(delay).stop().animate({opacity:0.0},isAnimated?300:0, function(){
			elem.stop().animate({height:0},300, function(){
				self.options._hidden = true;
				if (cb) cb();
			});
		});
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
		self.element.removeClass("notificationbar");
	}
});