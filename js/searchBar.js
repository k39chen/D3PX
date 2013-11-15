$.widget("D3PX.searchBar", {
	options: {
		searchCB: null
	},
	_create: function(){
		var self = this;
		self.element.addClass("searchBar");
		
		// construct the widget
		var icon = $("<img>").addClass("icon").attr("src", "assets/images/icons/search.png");
		var loader = $("<img>").addClass("loader").attr("src", "assets/images/icons/loading.gif").hide();
		var input = $("<input>").addClass("battletag").attr("type","text").attr("placeholder", "Search battletag...");
		var server = $("<button>").addClass("server tiny");
		
		self.element.append(icon,loader,input,server);
		
		// create the mini bar pop-up
		var miniMenu = $("<div>").addClass("miniMenu dismissable").appendTo("body").hide();
		for (var name in D3.Server) {
			var item = $("<div>").addClass("item").attr("value",D3.Server[name].value).append(name).appendTo(miniMenu) 	;
		}
		
		// bind mouse hover events for the mini menu trigger
		$(".item", miniMenu).hover(
			function() { $(this).addClass("hovered"); },
			function() { $(this).removeClass("hovered"); }
		);
		
		// assign a default server
		self.assignServer(D3.Server.US);
		
		// bind events
		$(".battletag",self.element)
			.data("parent", self)
			.keyup(function(e){
				var parent = $(this).data("parent");
				if (e.keyCode == 13) {
					if (self.options.searchCB) {
						// forward the server and battletag
						self.options.searchCB(
							parent,
							D3.Server[$(".server",parent.element).val().toUpperCase()],
							$(".battletag",parent.element).val()
						);
					}
					$(this).val("").blur();
				}
			 });
		$(".server",self.element)
			.data("parent",self.element)
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
			self.assignServer(D3.Server[$(this).val().toUpperCase()]);
		});
		
		// make any non-dismissable click target set to hide all
		// dismissable elements in the DOM
		$("html").click(function(){
			$(".dismissable").hide();
		});
		
		this.focus();
	},
	// focus the battletag text input field
	focus: function(){
		this.setActive();
		$(".battletag",this.element).focus();
	},
	// set the status of the search bar to busy
	setBusy: function(){
		$(".loader", this.element).show();
		$(".icon", this.element).hide();
		
		$(".battletag", this.element).attr("disabled","disabled");
	},
	// allow user to enter battletag searches
	setActive: function(){
		$(".loader", this.element).hide();
		$(".icon", this.element).show();
		
		$(".battletag", this.element).removeAttr("disabled");
	},
	// assign a server for the battletag search
	assignServer: function(server){
		var self = this;
		$(".server",self.element).html(server.value.toUpperCase()).attr("value", server.value);
	},
	// 
	simulateSearch: function(server, battletag) {
		this.assignServer(server);
		$(".battletag", this.element).val(battletag);
		
		// simulate keyup from keyboard
		e = $.Event('keyup');
		e.keyCode = 13;
		$(".battletag", this.element).trigger(e);
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
		self.element.removeClass("searchBar");
	}
});