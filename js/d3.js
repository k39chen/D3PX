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
		US: {value: "us", label: "American Servers"},
		EU: {value: "eu", label: "Europen Servers"},
		KR: {value: "kr", label: "Korean Servers"},
		TW: {value: "tw", label: "Taiwanese Servers"}
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
		BARBARIAN	: {index: 0, value: "barbarian", label: "Barbarian"},
		DEMONHUNTER	: {index: 1, value: "demon-hunter", label: "Demon Hunter"},
		MONK		: {index: 2, value: "monk", label: "Monk"},
		WITCHDOCTOR	: {index: 3, value: "witch-doctor", label: "Witch Doctor"},
		WIZARD		: {index: 4, value: "wizard", label: "Wizard"},
		
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
	 * @param hardcoreProgression {Object} The information on hardcore game progression.
	 * @param timePlayed {Object} The information on play time on each class.
	 * @param artisans {Array} An array of artisan information.
	 * @param hardcoreArtisans {Array} The array of hardcore artisans.
	 * @param lastHeroPlayed {Number} The id of the last hero played.
	 * @param lastUpdated {Number} The last update time.
	 */
	Player: function(_server, _battletag, _heroes, _fallenHeroes, _kills, _progression, _hardcoreProgression, _timePlayed, _artisans, _hardcoreArtisans, _lastHeroPlayed, _lastUpdated) {
		this.server = _server;
		this.battletag = _battletag;
		this.heroes = _heroes;
		this.fallenHeroes = _fallenHeroes;
		this.kills = _kills;
		this.progression = _progression;
		this.hardcoreProgression = _hardcoreProgression;
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
	 * @param order {Number} The order that the hero appears in the array.
	 * @param id {Number} The id of the hero.
	 * @param class {String} The class of the hero.
	 * @param gender {Number} The gender of the hero.
	 * @param name {String} The name of the hero.
	 * @param hardcore {Boolean} Flag for hardcore heroes.
	 * @param dead {Boolean} Flag for dead hardcore heroes.
	 * @param level {Number} The level of the hero.
	 * @param paragonLevel {Number} The paragon level of the hero.
	 * @param lastUpdated {Number} The last update time.
	 * @param kills {Number} The number of elite kills.
	 * @param followers {Array} The array of followers.
	 * @param items {Array} The array of items.
	 * @param stats {Array} The array of stats.
	 * @param skills {Array} The array of skills.
	 * @param progress {Object} The information on game progression.
	 */
	Hero: function(_order, _id, _class, _gender, _name, _hardcore, _dead, _death, _level, _paragonLevel, _lastUpdated, _kills, _followers, _items, _stats, _skills, _progress) {
		this.order = _order;
		this.id = _id;
		this.class = _class;
		this.gender = _gender;
		this.name = _name;
		this.hardcore = _hardcore;
		this.dead = _dead;
		this.death = _death;
		this.level = _level;
		this.paragonLevel = _paragonLevel;
		this.lastUpdated = _lastUpdated;
		this.kills = _kills;
		this.followers = _followers;
		this.items = _items;
		this.stats = _stats;
		this.skills = _skills;
		this.progress = _progress;
		
		this.getHash 	= function() { return this.id; }
		this.addToCache = function() { D3.cache.heroes[this.getHash()] = this; }
		this.inCache 	= function() { return D3.cache.heroes[this.getHash()] != null; }
		this.getCached 	= function() { return this.inCache(this) ? D3.cache.heroes[this.getHash()] : null; }
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
		this._sendRequest(url, function(playerData){
			var cPlayer;
		
			// if we receive an unsuccessful response, then we perform an early abort.
			if (!playerData || playerData.code == "NOTFOUND") {
			
				console.log("The account for " + player.battletag + " could not be found on " + player.server.label + " servers.");
				cPlayer = null;
				
				if (callback) {
					callback(cPlayer);
				}
				
			} else {
				// construct the player object
				cPlayer = new D3.Player(
					player.server, playerData.battleTag, playerData.heroes, playerData.fallenHeroes, playerData.kills, playerData.progression, playerData.hardcoreProgression,
					playerData.timePlayed, playerData.artisans, playerData.hardcoreArtisans, playerData.lastHeroPlayed, playerData.lastUpdated
				);
				// construct each hero associated with the player
				for (var i=0; i<cPlayer.heroes.length; i++) {
					var hero = cPlayer.heroes[i];
					
					// we must now fetch all the heroes associated with this player
					D3.fetchHero(cPlayer, new D3.Hero(i,hero.id), function(heroData) {
						// register the hero
						cPlayer.heroes[heroData.order] = heroData;
						
						// check if all the heroes have been loaded, otherwise, keep waiting
						if (D3.numPending == 0) {
							// add the player to the cache
							cPlayer.addToCache();
							
							// forward the request to the source of this request
							if (callback) {
								callback(cPlayer);
							}
						}
					});
				}
				// construct each fallen hero associated with the player
				cPlayer.fallenHeroes.sort(function(a,b){return b.death.time-a.death.time;});
				for (var i=0; i<cPlayer.fallenHeroes.length; i++){
					var fallenHero = cPlayer.fallenHeroes[i];
					var cFallenHero = new D3.Hero(
						i,  fallenHero.id, D3.Class.which(fallenHero.class), D3.Gender.which(fallenHero.gender), fallenHero.name, true, true, 
						fallenHero.death, fallenHero.level, -1, -1, fallenHero.kills, [], fallenHero.items, fallenHero.stats, [], null
					);
					cPlayer.fallenHeroes[i] = cFallenHero;
				}
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
		
		// ignore malformed request specifications
		if (!player || !player.server || !player.battletag || !hero || !hero.id) {
			console.log("Could not get hero profile.");
			if (callback) {
				callback(null);
			}
			return;
		}
		
		// check the cache to see if we've loaded this player before
		if (hero.inCache()) {
			console.log("Retrieved from cache.");
			if (callback) {
				callback(hero.getCached());
			}
			return;
		}
		
		// construct the request url
		var url = player.server.value + this.api + "profile/" + player.formatBattletag() + "/hero/" + hero.id;
		
		// send request to the D3 server
		this._sendRequest(url, function(heroData){
		
			var cHero;
		
			// if we receive an unsuccessful response, then we perform an early abort.
			if (!heroData || heroData.code == "NOTFOUND") {
			
				console.log("The hero with id " + heroData.id + "on the account " + player.battletag + " could not be retrieved.");
				cHero = null;
				
			} else {
				// construct the hero object
				cHero = new D3.Hero(
					hero.order,
					heroData.id,
					D3.Class.which(heroData.class),
					D3.Gender.which(heroData.gender),
					heroData.name,
					heroData.hardcore,
					heroData.dead,
					null,
					heroData.level,
					heroData.paragonLevel,
					heroData["last-updated"],
					heroData.kills,
					heroData.followers,
					heroData.items,
					heroData.stats,
					heroData.skills,
					heroData.progress
				);
				cHero.addToCache();
			}
		
			// forward the request to the source of this request
			if (callback) {
				callback(cHero);
			}
		
		});
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