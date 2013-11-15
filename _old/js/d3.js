// the master D3 module
var D3 = {	
//================================================================================
// * GLOBALS
//================================================================================
	// API destinations
	secure: true,
	host: ".battle.net/d3/",
	api: ".battle.net/api/d3/",
	media: "media.blizzard.com/d3/",

//================================================================================
// * REEQUEST STATE
//================================================================================	
	numPending: 0,
	
//================================================================================
// * CACHES
//================================================================================	
	cache: {
		players: {},
		heroes: {}
		//,items: {}
	},
	
//================================================================================
// * ENUMERATIONS/TYPES
//================================================================================
	Server: {
		US: {value: "us", label: "American Server"},
		EU: {value: "eu", label: "Europen Server"},
		KR: {value: "kr", label: "Korean Server"},
		TW: {value: "tw", label: "Taiwanese Server"}
	},
	Gender: {
		MALE: {value: 0, label: "Male"},
		FEMALE: {value: 1, label: "Female"},
		
		isMale: function(gender) { return gender.value == this.MALE.value; },
		isFemale: function(gender) { return gender.value == this.FEMALE.value; },
		which: function(gender) {
			switch (gender) {
				case this.MALE.value: return this.MALE;
				case this.FEMALE.value: return this.FEMALE;
				default: return this.MALE;
			}
		}
	},
	Class: {
		MONK		: {value: "monk", label: "Monk"},
		DEMONHUNTER	: {value: "demon-hunter", label: "Demon Hunter"},
		WITCHDOCTOR	: {value: "witch-doctor", label: "Witch Doctor"},
		WIZARD		: {value: "wizard", label: "Wizard"},
		BARBARIAN	: {value: "barbarian", label: "Barbarian"},
		
		isMonk: function(d3class) { return d3class.value == this.MONK.value; },
		isDemonHunter: function(d3class) { return d3class.value == this.DEMONHUNTER.value; },
		isWitchDoctor: function(d3class) { return d3class.value == this.WITCHDOCTOR.value; },
		isWizard: function(d3class) { return d3class.value == this.WIZARD.value; },
		isBarbarian: function(d3class) { return d3class.value == this.BARBARIAN.value; },
		which: function(d3class) {
			switch (d3class) {
				case this.BARBARIAN.value: return this.BARBARIAN;
				case this.MONK.value: return this.MONK;
				case this.DEMONHUNTER.value: return this.DEMONHUNTER;
				case this.WITCHDOCTOR.value: return this.WITCHDOCTOR;
				case this.WIZARD.value: return this.WIZARD;
				default: return this.BARBARIAN;
			}
		}
	},

//================================================================================
// * CLASSES
//================================================================================
	/**
	 * @class Player
	 * @param server {String} The server that the player exists on.
	 * @param battletag {String} The raw battletag string.
	 * @param heroes {D3.Hero} The array of heroes.
	 * @param fallenHeroes {Array} The array of fallen heroes.
	 * @param kills {Object} The information on monster kills.
	 * @param progression {Object} The information on game progression.
	 * @param timePlayed {Object} The information on play time on each class.
	 * @param artisans {Array} An array of artisan information.
	 * @param hardcoreArtisans {Array} The array of hardcore artisans.
	 * @param lastHeroPlayed {Number} The id of the last hero played.
	 * @param lastUpdated {Number} The last update time.
	 */
	Player: function(_server, _battletag, _heroes, _fallenHeroes, _kills, _progression, _timePlayed, _artisans, _hardcoreArtisans, _lastHeroPlayed, _lastUpdated) {
		this.server = _server;
		this.battletag = _battletag;
		this.heroes = _heroes;
		this.fallenHeroes = _fallenHeroes;
		this.kills = _kills;
		this.progression = _progression;
		this.timePlayed = _timePlayed;
		this.artisans = _artisans;
		this.hardcoreArtisans = _hardcoreArtisans;
		this.lastHeroPlayed = _lastHeroPlayed;
		this.lastUpdated = _lastUpdated;
		
		this.formatBattletag = function() { return this.battletag.replace(/#/g, "-"); }
		
		this.getHash 	= function() { return this.server.value + ":" + this.battletag.toLowerCase(); }
		this.addToCache = function() { D3.cache.players[this.getHash()] = this; }
		this.inCache 	= function() { return D3.cache.players[this.getHash()] != null; }
		this.getCached 	= function() { return this.inCache(this) ? D3.cache.players[this.getHash()] : null; }
	},
	/**
	 * @class Hero
	 * @param id {Number} The id of the hero.
	 * @param class {String} The class of the hero.
	 * @param gender {Number} The gender of the hero.
	 * @param name {String} The name of the hero.
	 * @param hardcore {Boolean} Flag for hardcore heroes.
	 * @param dead {Boolean} Flag for dead hardcore heroes.
	 * @param level {Number} The level of the hero.
	 * @param paragonLevel {Number} The paragon level of the hero.
	 * @param lastUpdated {Number} The last update time.
	 */
	Hero: function(_id, _class, _gender, _name, _hardcore, _dead, _level, _paragonLevel, _lastUpdated) {
		this.id = _id;
		this.class = _class;
		this.gender = _gender;
		this.name = _name;
		this.hardcore = _hardcore;
		this.dead = _dead;
		this.level = _level;
		this.paragonLevel = _paragonLevel;
		this.lastUpdated = _lastUpdated;
	},

//================================================================================
// * API
//================================================================================
	/**
	 * @method fetchPlayer
	 * @param player {D3.Player} The player object.
	 * @param callback {Function} The callback for the request.
	 */
	fetchPlayer: function(player, callback) {
		
		// ignore malformed request specifications
		if (!player || !player.server || !player.battletag) {
			console.log("Could not get player profile.");
			if (callback) {
				callback(null);
			}
			return;
		}
		
		// check the cache to see if we've loaded this player before
		if (player.inCache()) {
			console.log("Retrieved from cache.");
			if (callback) {
				callback(player.getCached());
			}
			return;
		}
	
		// construct the request url
		var url = player.server.value + this.api + "profile/" + player.formatBattletag() + "/";
		
		// send request to the D3 server
		this._sendRequest(url, function(response){
		
			var cPlayer;
		
			// if we receive an unsuccessful response, then we perform an early abort.
			if (!response || response.code == "NOTFOUND") {
			
				console.log("The account for " + player.battletag + " could not be found on " + player.server.label + " servers.");
				player = null;
				
			} else {
				// construct the player object
				cPlayer = new D3.Player(
					player.server,
					response.battleTag,
					response.heroes,
					response.fallenHeroes,
					response.kills,
					response.progression,
					response.timePlayed,
					response.artisans,
					response.hardcoreArtisans,
					response.lastHeroPlayed,
					response.lastUpdated
				);
				// construct each hero associated with the player
				for (var i=0; i<cPlayer.heroes.length; i++) {
					var hero = cPlayer.heroes[i];
					cPlayer.heroes[i] = new D3.Hero(
						hero.id,
						D3.Class.which(hero.class),
						D3.Gender.which(hero.gender),
						hero.name,
						hero.hardcore,
						hero.dead,
						hero.level,
						hero.paragonLevel,
						hero["last-updated"]
					);
				}
				cPlayer.addToCache();
				
				player = $.extend(player, {}, cPlayer);
			}
		
			// forward the request to the source of this request
			if (callback) {
				callback(player);
			}
		});
	},
	/**
	 * @method fetchHero
	 * @param player {D3.Player} The player object.
	 * @param hero {D3.Hero} The hero info object.
	 * @param callback {Function} The callback for the request.
	 */
	fetchHero: function(player, hero, callback) {
		// ...
	},
	/**
	 * @method _sendRequest
	 * @param url {String} The url of the request.
	 * @param callback {Function} The callback for the request
	 */
	_sendRequest: function(url, callback) {
	
		// add on the type of security http header
		url = (this.secure ? "https" : "http") + "://" + url;
	
		// construct and dispatch the AJAX request
		$.ajax({
			type: "GET", 
			dataType: "jsonp", 
			url: url,
			beforeSend: function() { D3.numPending++; },
			error: function() {
				D3.numPending--;
				if (callback) {
					callback(null);
				}
			},
			success: function(response) {
				D3.numPending--;
				if (callback) {
					callback(response);
				}
			}
		});
	}
}