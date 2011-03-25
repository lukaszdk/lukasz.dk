---
layout: post
title: Doom - PlayStation 2 Port
---

# {{ page.title }} 

*2008-02-11*

**Update 28/2/09:**

[Cosmito](http://forums.ps2dev.org/profile.php?mode=viewprofile&u=8970) has been doing alot of addition work on my quick PS2 port of doom lately, [recently adding sound support](http://ps2homebrewing.wordpress.com/2009/02/24/ps2doom-with-proper-sound-at-last/). To keep updated on the latest PS2Doom changes, check Cosmitos [website](http://ps2homebrewing.wordpress.com/).

**Original post:**

[Doom by id Software](http://en.wikipedia.org/wiki/Doom_%28video_game%29) seems to available for every platform known to man, except for the PlayStation 2. So I wondered how long it would take to port it over to PS2 and the answer to that question turned out to be less than 3 hours. Using the PS2 port of SDL, gsKit (SDL requires it for video) and PS2SDK, all available from <a href="http://svn.ps2dev.org">PS2dev.org Subversion repository</a> and a SDL port of Doom [available here](http://www.libsdl.org/projects/doom/), I managed to get a very basic (read: hackish) port of Doom running on the PS2 without much effort.

I've only tested the port over PS2Link and it will most likely not run from a CD-R. There is no sound, however there is support for sound in PS2 SDL, but does not appear to work with Doom and I havn't investigated the cause. Saving and loading of games works, as they just save to host/PC. The Dualshock controls are as follow (USB keyboard and mouse are untested)


	Left Analog Stick : Move
	Cross             : Enter
	Square/R1         : CTRL / Fire
	Circle/R2         : Space / Open doors
	Triangle          : Escape
	L1                : x
	L2                : y
	L1 and L2 are for entering savegame names


I will not continue to work on this port, it was just a quick nostalgic proof of concept port :-)

*Download:* <a title="ps2doom-src.zip" href="http://lukasz.dk/files/ps2doom-src.zip">ps2doom-src.zip</a> <a title="ps2doom-bin.zip" href="http://lukasz.dk/files/ps2doom-bin.zip">ps2doom-bin.zip</a> (Binary includes shareware data)

*Update:* Follow <a href="http://forums.ps2dev.org/viewtopic.php?t=9798">this thread</a> for further work on this port.

*Update 2:* A <a href="http://firehead.org/~jessh/lsdldoom/">lsdldoom</a> PS2 port by <a href="http://www.jasonyu.net/">Jason Yu</a> with sound effect support has <a href="http://forums.ps2dev.org/viewtopic.php?p=66358#66358">surfaced</a>. I've compiled the source into a single ELF with the DOOM shareware data included, which should run from CD-ROM, USB, etc (not tested). Included in the archive is also a <a href="http://ps2dev.org/ps2/Tools/Packers/Unpackers/PS2-Packer_0.4.4">ps2-packer</a> compressed version of DOOM.ELF named DOOMP.ELF.* *

*Download:* <span class="postbody"><a href="http://lukasz.dk/files/lsdldoom-ps2-bin.zip" target="_blank">lsdldoom-ps2-bin.zip</a></span>

<span class="postbody"> </span>