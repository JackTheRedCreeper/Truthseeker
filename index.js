const phantom = require('phantom'); // Headless browser used to load data in one of the queries
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs'); // Used to load local files
const Fuse = require('fuse.js'); // Used for fuzzy search

// Local files
const spellsdata = JSON.parse(fs.readFileSync('spells.json')); // Replaced by a url request in more recent versions, reverted back in github due to copyright
const guns = JSON.parse(fs.readFileSync('ranged.json'));
const wepTypes = JSON.parse(fs.readFileSync('weaponTypesList.json'));
const melees = JSON.parse(fs.readFileSync('melee.json'));
const specials = JSON.parse(fs.readFileSync('special.json'));
const grenades = JSON.parse(fs.readFileSync('grenades.json'));

var excusenum = 0;
var spellsdata = "";
var color;
var waitMsg = [];

/* Disabled due to copyrights
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest; // Loads spells off THT
const xmlhttp= new XMLHttpRequest();

xmlhttp.onreadystatechange=function()
{
	if (xmlhttp.readyState==4 && xmlhttp.status==200)
	{
		spellsdata = JSON.parse(xmlhttp.responseText);
	}
}
xmlhttp.open("GET", "[url removed due to copyright vulnerability]", false );
xmlhttp.send();    
*/

client.on('ready', () => {
 console.log(`Logged in as ${client.user.tag}! *Weeeeeeee*`);
 client.user.setActivity('!thtinfo | !ththelp');
 });

client.on('message', msg => {	
	
	if (msg.content.split(' ')[0] === '!tht' && msg.content.split(' ').length > 1) {
		
    color = '#09755F';
    
		googleTHT(1,msg);
    /*
		msg.react('❌');
		
		var embed = new Discord.MessageEmbed()
			.setColor(color)
			.setDescription("**Sorry! THT search is down for now. No, we don't know when it will be up.**\n"+excuses[Math.floor(Math.random() * excuses.length)]);
		msg.channel.send(embed);
    */
	}
	
	else if (msg.content.split(' ')[0] === '!tft' && msg.content.split(' ').length > 1) {
		
    color = '#A89060';
    
		//googleTHT(2,msg);
    
		msg.react('❌');
		
		var embed = new Discord.MessageEmbed()
			.setColor(color)
			.setDescription("**Sorry! TFT search is down for now. No, we don't know when it will be up.**");
		msg.channel.send(embed);
	}
	
	else if (msg.content.split(' ')[0] === '!thtspell' && msg.content.split(' ').length > 1) {
		
		spellTHT(msg);
	}
	
	else if ((msg.content.split(' ')[0] === '!thtweapon' || msg.content.split(' ')[0] === '!thtwep') && msg.content.split(' ').length > 1) {
		
		weaponTHT(msg);
	}
	
	else if (msg.content.split(' ')[0] === '!ththelp' || msg.content.split(' ')[0] === '!thtinfo') {
		
		var embed = new Discord.MessageEmbed()
			.setColor('#09755F')
			.setDescription("**Usage:**\n"+
		"~~**!tht [query]**: Uses Google to search thehiddentruth.info for Starfinder content. For example: '!tht laser pistol azimuth'.~~ __CURRENTLY DISABLED__\n"+
		"~~**!tft [query]**: Uses Google to search theforgottentruth.info for Pathfinder 2e content. For example: '!tft dwarf ancestry'.~~ __CURRENTLY DISABLED__\n"+
		"**!thtweapon or !thtwep [query]**: Prints quick information (no description) + a link of a Starfinder weapon. For example: '!thtspell laser pistol azimuth'.\n"+
		"**!thtspell [query]**: Prints quick information (no description) + a link of a Starfinder spell. For example: '!thtspell magic missile'.\n"+
		"**!thtinfo** or **!ththelp**: Prints this command list.\n"+
		"React to any message from this bot with a thumbs up 👍 to **delete** it!\n\n"+
		"Queries take at least 3 characters, and up to 32 characters. Google searches (!tht, !tft) may take ~2-3 seconds to finish. If the bot doesn't react after a while, contact @JackTheRedCreeper#1093 \n"+
		"If bot is sleeping, poke Mark von Drake#1323 to wake it.\n\n\n"+
		"Add this bot to your discord server! https://discordapp.com/oauth2/authorize?client_id=667694501598461990&scope=bot \n\n"+
		"-- Built by JackTheRedCreeper#1093 in collaboration with Mark Von Drake#1323. Feel free to leave a tip https://ko-fi.com/jacktheredcreeper --"
		);
		
		msg.channel.send(embed);
		
		
	}
});

client.on('messageReactionAdd', (reaction, user) => {
    if (user.bot) return;
    if (reaction.emoji.name === "👍" && (reaction.message.author.id === client.user.id)) {
		reaction.message.delete();
    }
})
 
function googleTHT(game, msg) {
	
	var message = msg.content.split(' ');
	var query = "";
	for(var i=1; i < message.length; i++) {
		query += message[i];
		if (i != message.length-1) query += '+';
	}
	console.log(query);
  
  var embed = new Discord.MessageEmbed()
    .setColor(color)
    .setDescription("Searching for "+query+", please wait.");

  msg.channel.send(embed).then((value) => {
  waitMsg.push(value)});

  // We use phantom headless browser because google searches have a small delay that Javascript on its own can't handle, and wouldn't return any valid results.
	(async function() {
		const instance = await phantom.create();
		const page = await instance.createPage();
		await page.on('onResourceRequested', function(requestData) {
		console.info('Requesting', requestData.url);
		});

		if (game == 1) status = await page.open('https://thehiddentruth.info/search?q='+query);
		else status = await page.open('http://theforgottentruth.info/search?q='+query);
		
		const content = await page.property('content');

		var result = content.split('class="gs-webResult gs-result"')[1];
		console.info(result);
		if (result) {
			
			var header = result.split('<a class="gs-title"')[1];
			
			header = header.split("</a>")[0]; // Reduces to first result
			header = header.replace(/<b>/g,"**"); header = header.replace(/<\/b>/g,"**"); // Replaces HTML for Discord formatting
			
			var url = header.split('"')[1];
			
			name = header.split("|")[0].split(">")[1];
			
			var excerpt = result.split('gs-snippet"')[1];
			excerpt = excerpt.replace(/<b>/g,"**"); excerpt = excerpt.replace(/<\/b>/g,"**"); excerpt = excerpt.replace(/\n/g,''); excerpt = excerpt.replace(/&nbsp;/g,''); excerpt = excerpt.replace(/&gt;/g,'→');
			excerpt = excerpt.split(">")[1].split("</div")[0];
			
			
			console.log('\n');
			console.log(url);
			console.log(name);
			console.log(excerpt);
			
			const exampleEmbed = new Discord.MessageEmbed()
				.setColor(color)
				.setTitle(name)
				.setURL(url)
				.setDescription(excerpt)
			msg.channel.send(exampleEmbed);
			
		}
		else {
			
			const embed2 = new Discord.MessageEmbed()
				.setColor(color)
				.setDescription("Query "+query+" failed. Try again or use different keywords.");
				
			msg.channel.send(embed2);
		}
		
		console.log(`\n`);

		await instance.exit();
    await deleteMsg();
	})();
	
  
};

// Deletes message stating that it is searching
function deleteMsg() {
  return new Promise(del => {
      del(waitMsg[0].delete(),
        waitMsg.shift());
  });
}



function spellTHT(msg) {
	
	var message = msg.content.split(' ');
	var query = "";
	
	for(var i=1; i < message.length; i++) {
		query += message[i];
		if (i != message.length-1) query += ' ';
	}
	
  // Options for fuse, fuzzy search
	var options = {
	  shouldSort: true,
	  includeScore: true,
	  threshold: 0.2,
	  location: 0,
	  distance: 50,
	  maxPatternLength: 32,
	  minMatchCharLength: 3,
	  keys: [
		"name"
	  ]
	};
	
	var fuse = new Fuse(spellsdata, options); // "list" is the item array
	var result = fuse.search(query);
	
			console.log('\n');
			console.log(result)
			console.log('\n');
	try {
		
		if (result.length == 0) {
			
			var embed = new Discord.MessageEmbed()
				.setColor('#09755F')
				.setDescription("Query "+query+" failed. Use different keywords.");
				
			msg.channel.send(embed);
			
			console.log(`\n`); console.log("Query "+query+" failed. Use different keywords.");
			
		} else {
			
			var count = result.length;
			
			if (count > 1 && result[0].score > 0.0001) {
			
				if (count > 20) count = 20;
				var names = "";
				
				for (i = 0; i < count; i++) {
					names += result[i].item.name;
					if (i != count-1) names += '\n';
				}
				
				var embed = new Discord.MessageEmbed()
					.setColor('#09755F')
					.setDescription("**Found multiple results:** \n"+names);
					
				msg.channel.send(embed);
				console.log(`\n`); console.log("Found multiple results: \n"+names);
				
			} else {
				
				result = result[0].item;
				
				var description = "";
				
				description += "**Levels:** " + result.levels +'\n';
				if (result.school) description += "**School:** " + result.school +'\n';
				if (result.time) description += "**Casting Time:** " + result.time +'\n';
				if (result.range) description += "**Range:** " + result.range +'\n';
				if (result.aerName) description += "**"+ result.aerName +"** " + result.aerInfo +'\n';
				if (result.duration) description += "**Duration:** " + result.duration +'\n';
				if (result.savingThrow) description += "**Saving Throw:** " + result.savingThrow +'\n';
				if (result.spellResistance) description += "**Spell Resistance:** " + result.spellResistance;
				
				var embed = new Discord.MessageEmbed()
					.setColor('#09755F')
					.setTitle(result.name)
					.setURL(result.url)
					.setDescription(description)
					
				msg.channel.send(embed);
				console.log(`\n`);
			}
		}
	return false;
	} catch (e) {
		
		msg.react('💣');
		console.log("\n\n Something broke: \n");console.log(e);
		console.log('\n');
		
		var embed = new Discord.MessageEmbed()
			.setColor('#09755F')
			.setDescription("**Something broke! Contact Jack so he can fix it.**");
			
		msg.channel.send(embed);
		return false;
	}
}

function weaponTHT(msg) {
	
	var message = msg.content.split(' ');
	var query = "";
	
	for(var i=1; i < message.length; i++) {
		query += message[i];
		if (i != message.length-1) query += ' ';
	}
	
	var options = {
	  shouldSort: true,
	  includeScore: true,
	  threshold: 0.2,
	  location: 0,
	  distance: 50,
	  maxPatternLength: 32,
	  minMatchCharLength: 3,
	  keys: [
		"name"
	  ]
	};
	
	// Find type by looking in weaponTypesList
	var fuse = new Fuse(wepTypes, options); // "list" is the item array
	var result = fuse.search(query);
	
	try {
		
		if (result.length == 0) {
			
			var embed = new Discord.MessageEmbed()
				.setColor('#09755F')
				.setDescription("Query "+query+" failed. Use different keywords.");
				
			msg.channel.send(embed);
			
			console.log(`\n`); console.log("Query "+query+" failed. Use different keywords.");
			
		} else {
			
			var count = result.length;
			
			if (count > 1 && result[0].score != 0) {
			
				if (count > 20) count = 20;
				var names = "";
				
				for (i = 0; i < count; i++) {
					names += result[i].item.name;
					if (i != count-1) names += '\n';
				}
				console.log(names);
				var embed = new Discord.MessageEmbed()
					.setColor('#09755F')
					.setDescription("**Found multiple results:** \n"+names);
					
				msg.channel.send(embed);
				console.log(`\n`); console.log("Found multiple results: \n"+names);
				
			} else {
				
				result = result[0].item;
				var type = result.type;
				
				// Look for weapon's stats in its list
				
        var list;
				if (type == "Melee") list = melees;
				else if (type == "Ranged") list = guns;
				else if (type == "Melee") list = specials;
				else list = grenades;
				
				var options = {
					shouldSort: true,
					threshold: 0.1,
					location: 0,
					distance: 10,
					maxPatternLength: 32,
					minMatchCharLength: 3,
					keys: [
					"name"
					]
				};
				var fuse = new Fuse(list, options); // "list" is the item array
				var result2 = fuse.search(result.name);
				
				result2 = result2[0];
					
				console.log('\n');
				console.log(result2)
				console.log('\n');
				
				var description = "";
				
				description += "**Category:** " + result.type +'\n';
				description += "**Type:** " + result2.item.type +'\n';
				if (result2.item.hand) description += "**Hands:** " + result2.item.hand +'\n';
				if (result2.item.category) description += "**Energy type:** " + result2.item.category +'\n';
				description += "**Level:** " + result2.item.level +'\n';
				description += "**Price:** " + result2.item.price +'\n';
				if (result2.item.damage) description += "**Damage:** " + result2.item.damage +'\n';
				if (result2.item.range) description += "**Range:** " + result2.item.range +'\n';
				if (result2.item.critical) description += "**Critical:** " + result2.item.critical+'\n';
				if (result2.item.capacity) description += "**Capacity:** " + result2.item.capacity +'\n';
				if (result2.item.usage) description += "**Usage:** " + result2.item.usage+'\n';
				if (result2.item.bulk) description += "**Bulk:** " + result2.item.bulk+'\n';
				if (result2.item.ability) description += "**Special:** " + result2.item.ability;
				
				var embed = new Discord.MessageEmbed()
					.setColor('#09755F')
					.setTitle(result2.item.name)
					.setURL(result2.item.url)
					.setDescription(description)
					
				msg.channel.send(embed);
				console.log(`\n`);
			}
		}
	return false;
	} catch (e) {
		
		msg.react('💣');
		console.log("\n\n Something broke: \n");console.log(e);
		console.log('\n');
		
		var embed = new Discord.MessageEmbed()
			.setColor('#09755F')
			.setDescription("**Something broke! Contact Jack so he can fix it.**");
			
		msg.channel.send(embed);
		return false;
	}
}

client.login([bot secret token. Too bad!]);

/*
Link to invite bot to servers
https://discordapp.com/oauth2/authorize?client_id=667694501598461990&scope=bot
*/

// An unnecessary list of silly phrases to say when the bot is down :)
const excuses = [
	"*There's a CR+2 boss waiting at the other side of that door, and I'm not going in!*",
	"*A space goblin stole my pen!*",
	"*It's all nothing but mimics!*",
	"*I opened a chest, a gnome came out of it, punched me in the crotch and ran away!*",
	"*Can't you see I'm busy with all these weapon and spell lists?*",
	"*Just... Another nap...*",
	"*A grenade went off in my bag and I'm checking the damages.*",
	"*The church of Nethys is onto me!*",
	"*Is it me or does it smell of smoke in here?*",
	"*I still need more credits for that.",
	"*Found it!- No, wait, false alarm.*",
	"*Nope, still no booze.*",
	"*I'm out of Resolve Points!*",
	"*Dopefish lives.*",
	"*Quit buggering me!*",
	"*Look, I'm not getting paid for this, so bear with me, alright?*",
	"*I tried!*"
];
