# Truthseeker
A discord bot for Starfinder info!

The bot relies on local files, and to avoid potential copyright issues, they've been simplified in the Github version. They should still allow the bot to function.

There are also other things (such as the bot's password) that are kept away.

# Tools used:

phantom.js: Headless browser
Fuse.js: Fuzzy string search

# How stuff works:

!tht <query> / !tft <query>:

The bot uses the website's built-in Google search. This, however, has a short delay between the page loading and the results displaying. Javascript can't 'wait' for this delay to end, so I use phantom.js as a workaround.

!thtspell <name> / !thtweapon <name>:

First, the bot looks into weaponTypesList.json, a local file that stores each item's name and category. This is necessary because of how the website's database is organized. Once it has the name and the category, it looks into the category's file and fetches the name's results.

For example: You type !thtweapon Laser Pistol Azimuth. The bot looks into weaponTypesList.json and sees that it's a Small Arm. It then looks into ranged.json and fetches all the info of Laser Pistol Azimuth.

!thtspell is a different command because its results are different.


Invite the bot to your server! 
https://discordapp.com/oauth2/authorize?client_id=667694501598461990&scope=bot
