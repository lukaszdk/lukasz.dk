---
layout: default
title: An Introduction to PS2DEV
---

# Overview 
This article is an introduction to homebrew PlayStation 2 Development also know as PS2DEV. The term PS2DEV covers both homebrew hardware and software development and is often associated with the website 

[PS2DEV.org][1], which hosts many PS2 software projects in its Subversion repository, and is the official home of the PS2SDK (PlayStation 2 Software Development Kit), which is one of the core parts of PS2DEV. PS2DEV.org is just a gathering point for people to get help, discuss ideas, announce releases, etc. regarding PS2 and lately also PSP and PS3. Just think of PS2DEV has a general term and not necessarily associated with PS2DEV.org. The great thing about PS2DEV is that all the software you need to get started is free and most of it is open source. The core parts of PS2DEV are open source and produced by skilled people over long period of time, which means that PS2DEV is quite mature and almost anything can be created with the free information available. Lets have a closer look at the PS2 architecture. 

# PS2 Architecture

## Documentation 
The EE, VUs and GS are fully documented in the manuals from Sony, these come with the PlayStation 2 Linux Kit. I bought the PlayStation 2 Linux Kit just to get the manuals :-) The following manuals are included 

*   EE Core Instruction Set Manual
*   EE Core Users Manual
*   EE Users Manual
*   GS Users Manual
*   VU Users Manual Getting these manuals is a must, as you will find yourself looking for information contained in them again and again. 

## Emotion Engine (EE) 
The term Emotion Engine (EE) actually covers the main MIPS R5900 processor, the Vectors Units (VUs) and the Graphics Synthesizer. The EE Core is the R5900 processor, I will just use 'EE' to denote the MIPS R5900. 

![PS2 Block Diagram][2] 

As already explained, the EE is a MIPS R5900 processor clocked at around 294 MHz with 32 MB memory attached to it. You might already be familiar with MIPS processors from the Nintendo 64, PSOne or PSP. The EE FPU does not support 64-bit doubles, only 32-bit floats. The reason behind this is that the VUs only supports 32-bit floats and it would not be efficient performance-wise to do calculations with doubles, if you had to cast them to floats before sending them off to the VU's, not to mention the lost precision. What makes the EE different from other MIPS processors is that it has Multimedia Instructions (MMI), these are specialized instructions that do 128-bit data operations. The EE's General Purpose Registers are 128-bit wide. The MMIs are quite handy when you work with data that gets sent of to to either the VUs or the GS. However I havn't seen much usage of these instructions in PS2DEV. The two VUs are connected to the EE, the VU0 more tightly than the VU1. The VU0 is not connected to the GS, like the VU1. You can use the VU0 in two modes, macro or micro. Macro means that you inline the VU0 instructions along with the rest of your EE code and in micro you create a microprogram which you then upload the the VU0 and execute. The VU1 only works in micro mode. In the first 1 MB region of the EE memory sits the EE kernel, which is loaded from the BIOS at startup. The kernel contains alot of system calls which can be invoked using the *syscall* instruction. Among the system calls are functions for threads, interrupts, thread synchronization, etc. The kernel is very basic and does not contain any system calls for handling I/O, except for a few system calls which are able to load EE programs (extension .ELF) which use I/O internally. PS2SDK supports all the known system calls.

## Vector Units (VUs) 

As mentioned above, there are two VU's, VU0 and VU1. Common for the VUs is that they have 32 vector registers, which are 128-bit wide and they run at 150 MHz. Many of the VU instructions work on the vector registers as 4 32-bit floats, denoted as X,Y,Z,W. This terminology is closely related to one used in vector and matrix operations, hence the name Vector Units. There are also registers for storing integer values and other specialized registers. When using the VUs in micro mode, you pair two instructions pr. clock cycle, upper and lower instruction. Therefor the VU instruction are classified in upper and lower instructions. You might have read that writing PS2 programs is difficult, this often refers to the VUs, especially the VU1. However what isn't mentioned is that writing simple VU programs which get the job done isn't hard, what is hard is optimizing and pairing the VU code in order to get close to optimal performance. Instead of programming the VU1 manually, one could use VCL to do all the optimizing automatically. VCL is a tool for writing VU programs in a C like fashion and its outputs optimized VU code for you, so you dont have to do it by hand. Its available at the PS2 Linux website for Windows and Linux. The VU0 is connected to the EE and to use it effectively in micro mode (see above for a description of macro mode), you need upload your micro program, upload your data to the VU0 data memory and then start your micro program. Once its finished, you then need to read the VU0 data memory to get the result. This could be used for asynchronous matrix, lighting, etc. operations. I once read somewhere that most commericial games dont take full advantage of the PS2, because they do not stress the VU0 the same way as they do the VU1. One could see the reason for this, as you would need to consider the VU0 from the very beginning in your game design, in order to make efficient usage of it. The VU1 is different from the VU0 in the sense that it only works in the micro mode and thats its directly connected to the GS. It also has more instructions than the VU0, some specialized for rendering, such as clipping instructions. The main usage of the VU1 is to do polygon operations like applying matrices to the vertices, clipping, creating GS packets which get kicked to the GS. You could however also use it for other things such as animation, procedural generation of models, etc. The VU1 is very flexible. 

Advanced use of the VU1 can be seen in the [sps2 project][3] (PS2LINUX), among things it uses the VU1 for post effects. Programming on the VUs is what makes PS2DEV interesting from a graphics point of view, as the PS2 is only computer which contains them. There is a bit of a steep learning curve with VU programming, which can become even steeper if you have never written your own renderer from scratch. There is a very good article [*Procedural Rendering on PlayStation 2*][4] which goes into great depth of the design issues with using the VU1. <a id="p30" href="http://lukasz.dk/files/rgreen_procedural_renderinggdc2001.pdf"></a> 

## Graphics Synthesizer (GS) 

The Graphics Synthesizer (GS) is the rastering unit of the PS2, connected to 4 MB of VRAM, where both framebuffers and textures have to reside. It supports the basic features of rastering polygons, texturing, alpha blending, basic scissoring, zbuffer, etc. It does not support clipping, so you have to do this manually yourself. You may think that that 4 MB of VRAM isn't alot, however keep in mind that the GS runs 150 MHZ and the bus is 128-bit wide, if you do the math you will see that it is in theory capable of transfering about 76 MB pr. frame at 30 frames/sec, which over twice the size of the EE memory. What this implies is that if you are doing a more involved graphics project on the PS2, you will also need to use a (or make your own) VRAM texture manager, as the textures will get replaced all the time in VRAM during rendering. There are different ways to send rastering data to the GS, these ways are refered to as 

*paths* and there are 3 of them. 
*   Path 1 is where you upload your data to the VU1 through the VU1 Interface (VIF1) and then run your VU1 programs which transforms your data and kicks it of the GS.
*   Path 2 is also through the VIF1, but the data does is not stored in VU1 memory and no VU1 program is executed. The data is transfered directly to the GS through VIF1.
*   Path 3 is through the GS Interface (GIF), this is where you send your data from the EE memory directly to the GS. So why the different paths? So you can use all the resources in parallel. One way to use everything in parallel could be that you use Path 1 for your vertex operations, Path 2 for changing the (rendering) state of the GS and Path 3 for uploading textures. This is of course not easy to do, as you need keep everything synchronized, but the possibility is there. Most renderers in PS2DEV use Path 3, as this the easiest to do. Some graphics libraries also do 3D on Path 3, where they do all the vertex operations on the EE instead of the VU1. I was told that Tekken Tag Tournament used this approach, but did use VU0 in macro mode for some parts. If you do 3D on the PS2, you must use the VU1 to get the performance you expect, the EE is meant to be used for other purposes, such as game logic. There are of course also some renderers in PS2DEV which use the VU1, the first was the demo Funslower by Soopa Doopa, for which the source code is a available, this demo was a milestone in PS2DEV graphics wise. 

## Image Processing Unit (IPU) 
Like the PSOne, the PS2 has a dedicated processor for image processing, used mostly for video playback. I have never used the IPU for anything, so besides from it being completely documented in the PS2 manuals, I dont know that much about it. There are some projects which use it, like 

[Simple Media System (SMS)][5]. 
## I/O Processor (IOP) 
The IOP processor is a MIPS R3000 connected to the EE by the Sub-system Interface (SIF), which is just a couple of DMA channels. It is called the IOP because it is connected to all I/O devices such as CD/DVD, HDD, Memory Card, Controllers, Sound, USB, etc. Drivers for theses devices are made on the IOP and can then be used on the EE using a Remote Procedure Call (RPC) protocol called SIFRPC. The IOP is quite a interesting part of the PS2, this is mostly because there is alot of functionality available for it already in the BIOS, in the form of IOP modules (file extension .IRX), similar to PRX modules on the PSP. The IOP on startup sets up it own custom system for loading modules and importing and exporting functions from these modules. An IOP module is selfcontained and most of them have an import section where functions from other modules are defined and some also have section of exported functions. All the IO drivers and the SIFRPC interface is not open source for licensed developers and therefor alot of reverse engineering work has been done, in order to make the IOP work in PS2DEV. The IO drivers and the SIFRPC library is the core part of PS2SDK, which is open source. Not all IOP modules have been reversed, such as modules for threading, interrupts and other "kernel" parts of the IOP, however [RO]man had a website where he published some reversed IOP modules in pseudo-C code, I've mirrored the files from his website 

[here][6]. As already mentioned the IOP is MIPS R3000, which is the same processor as the CPU in the PSOne and therefor this is used for executing PSOne games. Sony probably included the IOP for PSOne compatability and then made it the processor for handling IO in PS2 mode afterwards. An interesting "rumour" I've heard regarding the IOP, is that the Geometry Engine (GTE), which is the "3D" processor of the PSOne, also exists in atleast the early PS2 models and can be accessed the same way as on the PSOne, however I've never tried to use it nor seen anyone do so. 

## BIOS 

The PS2 BIOS is a 4 MB ROM, where the EE Kernel, OSD (the "operating system" you see when you start your PS2 without any game in it) and IOP modules are stored. There are a couple of different versions of the BIOS, which are just additions to previous versions. For instance the first Japanese PS2 models had a BIOS which did not contain the LIBSD IOP module, which is a IOP module interface to the SPU2 (Sound Processing Unit 2), but was the added to later PS2 models. However to have LIBSD available for all PS2 models in PS2DEV, freesd is available in PS2SDK, which is a free replacement module for LIBSD made by TyRaNiD and myself. Likewise there also free driver modules for the network adapter, HDD, controllers and other IO devices available in PS2SDK. Commercial games contain a IOP replacement image file, where newer versions of various modules are loaded and replace the BIOS versions. PS2SDK supports the IOP modules which are in the BIOS, since these are available for "free", where as the IOP replacement images are not. Besides it would quite alot of work to update PS2SDK each time new versions of the modules became available, not to mention the hassle for the users of PS2SDK keeping track of versions. 

# Development Software

## PlayStation 2 Linux vs PS2DEV 
There is quite a difference between programming using the PS2DEV tools and using the PlayStation 2 Linux (PS2Linux) kit provided by Sony. In PS2DEV you get the same access to the hardware as you could if you were an licensed developer, although the PS2DEV software is a bit different, you can with the tools available make complete games with all the features of commericial games. PS2Linux is different in the sense that the programs you make, only work within the PS2Linux environment, and you do not have direct access to the IOP as you do in PS2DEV. The purpose of PS2Linux is mostly to play around with the GS og VUs, which you can program on a low level, which is quite interesting if you are into graphics programming. But if you want to have complete control over the hardware and want to be able to execute your programs directly on the PS2, then PS2DEV is the right option for you. 

## Toolchain 
The compiler used for PS2DEV is a port of GCC and associated tools, ported by people in PS2DEV and is not part of the official GCC releases. There are seperate GCC compilers and assemblers for EE, IOP and VU. The toolchains have been used for a long time and alot of different projects and have been proven over time to be stable. To get the toolchains, you need to download, patch, configure and compile them yourself. Luckily this process has become very easy because of the famous toolchain script by ooPo, which you just execute and it does everything for you. If you are using Windows, I've written a two tutorials on how to setup the toolchains in [Cygwin][7] and [MinGW][8].

## PS2Link 
To execute programs, you use your PC to communicate with the PS2, and then transfer and execute your programs. For this you need both PS2 side and PC (client/host) side tools. The are two main options on the PS2, either Naplink or PS2Link. Naplink uses an USB cable and PS2Link uses the official network adapter. Naplink was released before the network adapter was available and was a milestone in PS2DEV. However most people use PS2Link now, as the network adapter is more common than the USB cable needed by Naplink, and it also has higher transfer rates. PS2Link on its own is only a PS2 side application using TCP and UDP for communication, the protocol has been documented by ooPo and is quite simple. There are many different PC clients for PS2Link, however ps2client by ooPo has become the defacto standard client to use and is also downloaded and compiled with the toolchain script. PS2Link uses both the EE and IOP, SIF is used for communication between two processors. The IOP is used mostly for TCP/IP and UDP communication through the network adapter (also called smap) . The EE parts executes the PS2 programs and handles screen output. Besides from the fact that you can run your program without having to burn it to a CD-R or DVD-R to test it, there are two other features which make PS2Link extremely useful. One is that you use the host (PC) to load and store files and also use printf to host to debug your programs. The other feature is that PS2Link is able to display exception information, which appears when your program crashes and this can be used effectively to track down the problem. I have written two tutorials on how to use this information to debug your program, check them out 

[here][9] and [here][10]. 
## PS2SDK 
PS2SDK is the core part of almost all PS2DEV applications today, since it provides access to IO. Many dedicated and talented people have been working on PS2SDK for many years and as a whole PS2SDK is of very high quality. However, there is not that much documentation on PS2SDK, so it requires some studying of samples and source code in order to learn how everything works. Most of the APIs in PS2SDK are quite simple and there is source code available which uses almost every part of PS2SDK. There were a few binary releases of PS2SDK a long time ago, but now people just get it directly from the Subversion repository and compile it themselves. When you run the toolchain script by ooPo, it also downloads, compiles and installs PS2SDK for you. The script also has an option for updating PS2SDK, check the README. 

## Graphics Libraries 
A funny thing about PS2DEV is that there probably is more source code for undocumented parts than there is for documented parts of the PS2. There is an ongoing joke among the most passionate PS2DEV developers, which is "We only to tools(TM)". What this refers to is that we only make low level tools for developers and not high level libraries which are easy to use. Since the core of PS2DEV (PS2SDK) developers has been more interested in low level programming, there have not been many graphics libraries for the PS2. I think the reason for this is that anyone who sat down and read the GS and VU manuals, would be able to do it and therefor it is not an interesting challenge, just hard work. The really hardcore PS2 developers would write custom graphics libraries which are specialized for every part of their application, to get the maximum performance out of the PS2, especially the VUs. Since the PS2 is so flexible it is very difficult to make a powerful graphics library which works well for everything. The graphics library that most people use is 

[gsKit][11] by Neovanglist, this is a Path 3 library and it is occasionally still being worked on. There are unfortunately no Path 1 graphics libraries available in PS2DEV, so unless you write your own, you wont get the performance you expect. I highly recommend PS2DEV to anyone who wants to mess around with graphics programming on a low level. 

# PS2DEV History 
For everyone who is new to PS2DEV, it is always nice to have some knowledge of what has happend the in the past and how turned out as they are today. So the following section will give an overview of most significant events in PS2DEV, in my opinion. If you want the full news coverage on the events listed below, you can read them all at

<span class="postbody"><a href="http://ps2dev.org/News" target="_blank"> http://ps2dev.org/News</a></span> 
## Year 2000

**October/November 2000 - PlayStation 2 released** 

## Year 2001

**01.02.01 - EE GCC 2.95.2 released**

A port of GCC 2.95.2 by SNSYS was released into the public, it had support for MMI instructions and the VUs. 

**17.03.01 - 3 Stars Demo released with sourcecode**
 
![3stars.jpg][12]

3 Stars Demo by Duke of Napalm was the first free open source demo for the PS2, it was written in assembler. 

**05.04.01 - ps2dev.livemedia.com.au was put online**

This is the website which later became PS2DEV.org (On 04.03.03 to be exact). It was started by Oobles (David Ryan) and to this day, he still maintains it. Needless to say, this website has had great importance as the gathering point for PS2DEVing. 

**12.07.01 - Duke's GCC library**

First small PS2 graphics library to be used together with GCC. I dont think anyone really used it and I recall it to be quite buggy.

**01.07.01 - PS2 Linux Kit Beta released**

The PS2 Linux Kit gets released in Japan, but more importantly is that it comes with the PS2 Manuals, which documents the EE, VUs and GS. 

**23.07.01 - Pillgen released** 

![pills.jpg][13] 

Pillgen by Vzzrzzn is the first demo written completely in C. It came with the source code and had very good performance for its time. I used this source code as a reference for many things back when it was released. 

**17.09.01 - PS(x)lib released** 

Psx2lib, later ps2lib and eventually ps2sdk, by Gustav Scotti is released. This is the first public attempt to reverse the SIFRPC libraries, which was a milestone in getting I/O (IOP) support. It later turned out that this code was quite buggy and it was completely replaced in PS2SDK by Marcus R. Browns SIFRPC code, which is still used today and has proven over time to be stable. 

**15.10.01 - Funslower released** 

![funslower.jpg][14] 

Demo by Danish demo group Soopa Doopa, first PS2DEV program to use VU1 for rendering. A milestone in PS2DEV. 

**11.12.01 - Naplink released** 

![naplink.jpg][15] Yet another major milestone in PS2DEV, Napalm release an tool for loading PS2 programs from your PC, often refered to as a *loader*. The source for Naplink was never released. **21.12.01 - Padlib released** Pukko reversed the EE SIFRPC library (padlib) for joypads for usage together with ps2lib, first real usage of the SIFRPC code in ps2lib. The first code to actually use joypads in PS2DEV. Later many other SIFRPC libraries followed, most of them are a part of PS2SDK. 
## Year 2002

**06.03.02 - First Dreamtime Tutorials** The tutorials by Dreamtime got quite alot of attention (and still do) and got alot people introduced to PS2DEV. However the code is quite outdated and would require some porting efforts to make it work with the current toolchains and libraries. **20.04.02 - IOP GCC outputs IRX** Karmix patched the IOP GCC port to output IRX files directly. Before this period the quite buggy elf2irx was used and this patch really improved the quality of GCC for the IOP. **22.04.02 - PSMS 0.1 Alpha released** PSMS is a Sega Master System emulator by Sjeep. what makes this interesting is that it was one of the first PS2 programs with support for file loading, joypads and sound. **21.05.02 - The Third Creation Round #1** The Third Creation started as a demo competition started by some people in the #PS2DEV IRC channel on EFNet (now on freenode). The "competition" was basically started just get some PS2DEV programs released on a regular basics. The competition ran on a monthly basis for over 2 years. Very few of the people who submitted the demos were actually real demo sceners, they were just people interested in an alternative platform. The Third Creation website is no longer available, I've mirrored the The Third Creation archive [here][16]. **31.05.02 - Libito released** Libito was my graphics library, it was one of the first real graphics libraries. The project is now discontiuned and now most people used [gsKit by Neovanglist][17]. **22.05.02 - PS2 Linux Kit PAL/NTSC released** The PS2Linux is released in PAL/NTSC territories and the website [playstation2-linux.com][18] opens. With this kit you could program the VUs, check out the [sps2 project][19] for advanced VU programming. The VU code can also be used in PS2DEV, if ported. **17.06.02 - Amigamod released** Amigamod by Vzzrzzn was a .MOD music player which ran entirely on the IOP, the first advanced IOP module. **15.10.02 - LIBCDVD released** The original CD/DVD driver for the PlayStation 2 only supported very limited CD/DVD formats. LIBCDVD by Hiryu and Sjeep sits a layer on top of the original driver and gives support for far more CD/DVD formats. This project was mostly used in the emulators. **20.10.02 - SjPCM released** Sound programming on the PS2 was a bit difficult in the beginning, as it required a IOP module which used LIBSD module (lowlevel sound library). SjPCM was a simple module with a EE RPC library, which made it easy to feed PCM data to the SPU2. This module became quite popular and is used in many PS2 programs. There is also a variant available, iSjPCM which does not require LIBSD. **03.11.02 - [RO]man opens website** [RO]man maintained a website called "PS2DEV: Bios Details for Developers", where he posted code for reversed IOP modules among other things. The code actually doesn't compile, but it shows what is going on inside IOP modules. The website is no longer available, I've mirrored some of the files [here][6]. **20.12.02 - PS2Reality release DivX player** A spanish group of coders release a media player which plays DivX movies, it got alot of attention in the press. There is another DivX player available called [Simple Media System][20] 
## Year 2003

**02.01.03 - PS2IP Released** PS2IP along with the SMAP driver was the beginning of what would become Pukklink, now PS2Link. **23.01.03 - SMAP Driver released** The PS2Linux network adapter driver ported to PS2DEV. **23.02.03 - Inlink by InPulSe Team released** [<img class="alignnone size-full wp-image-64" style="vertical-align: text-bottom;" title="Inlink" src="http://lukasz.dk/files/inlinkscr.jpg" alt="" width="250" height="306" />][21] Inlink is a Windows Pukklink/PS2Link client which had built-in TV-Tuner support. It was a great tool if you had your PS2 connected to your TV-Tuner (like me), then you only had one tool for uploading and testing your PS2 programs. The client is now quite old and might not be compatible with all PS2Link features. **02.03.03 - EE GCC 3.2.2 released** The EE toolchain used in PS2DEV was version 2.95 and quite dated, MrHTFord began the effort of porting it over to GCC 3.2.2. This is the toolchain used in all PS2DEV projects today. **24.03.03 - Pukklink released** ![pukklink.jpg][22] Up until this point Naplink was used to develop on the PS2DEV. Pukklink by Pukko used the official network adapter to transfer PS2 programs to the PS2 from your PC. Later this was renamed PS2Link, which is the most used loader in PS2DEV. **01.03.03 - PS2Lib SifRpc and SifCmd code gets updated** It was no secret that the SifRpc and SifCmd code in ps2lib was quite buggy. Marcus R. Brown had been working on this own implementation which was more stable and he commited it to ps2lib, replacing the existing code. It has proven over time to be quite stable and was a leap forward in PS2DEV, as people had been fighting with the original implementation. This is one of the core parts in PS2DEV, without it there would be no (stable) I/O. **25.04.03 - gsLib released** Hiyru released a gsLib, a C++ graphics library. He used it in his Snes-Station SNES emulator. **06.05.03 - dreamGL released** dreamtime released a minimal OpenGL implemtentation for PS2Dev. It uses Path 3, so the performance is not great and it also supports doubles, which are software emulated, another performance bottleneck. This library was used in the Plasma Tunnel demo submitted to [The Third Creation][16]. **16.05.03 - PS2lib 2.0 released** Major overhaul in PS2Lib, both in structure and code. This was the beginning of what later would become PS2SDK. **24.05.03 - libGL released** jenova0 released his closed source OpenGL implemtentation, also uses Path 3 as far as I know and I dont it was actually used in any PS2 programs. **03.07.03 - ps2drv released** Marcus R. Brown releases a framework for programming IOP modules, called ps2drv (ps2 driver). This framework made it alot easier to define IOP module imports and exports. This would later be merged with PS2Lib and other libraries to PS2SDK. **04.08.03 - Aura for Laura released** ![aura10.jpg][23] The second demo fro Soopa Doopa, this time with sound. This demo won the Best Effects award at [Scene.org Awards][24] in 2003. ** 16.08.03 - PS2 Independence Exploit** Longtime PS2 hacker Marcus R. Brown releases the Independence Exploit. A buffer overflow exploit which can be triggered using a custom file on the memory card and an original PSOne game. This exploit was patched in later PS2 models. This exploit does not bypass the original PS2 disc protection, it just loads a PS2 program from the memory card into memory. **07.10.03 - Send0r released** Send0r by Oobles was a PS2 program which could download PS2DEV programs from the internet, this project has unfortunately quietly died. **23.10.03 - sbv released** sbv is a small library by Marcus R. Brown with a couple of patches. One patch made it possible to load IOP modules from EE memory, previous only possible to load using I/O. Another patch made it possible to load IOP modules from the memory card. **06.11.03 - libhdd released ** libhdd by Sjeep was library to access the PS2 HDD. The source was later released and is now a part of PS2SDK. **18.12.03 - PS2 Serial Cable** Herben is the originally author of the PS2 serial cable, instructions for building was posted by Marcus R. Brown. [Mirror of the original instructions][25]. 
## Year 2004

**02.01.04 - PS2Link released** [<img class="alignnone size-medium wp-image-65" title="ps2link" src="http://lukasz.dk/files/ps2link-300x214.jpg" alt="" width="300" height="214" />][26] Pukklink was renamed PS2Link and released. The source code for PS2Link is quite dated and could use an overhaul. There are still updates being made to it and it works very well, despite the code being dated. **05.02.04 - Toolchain script released** ooPo releases the first version of his toolchain script, which automatically setups the toolchains, ps2sdk and ps2client. **27.02.04 - freesd released** TyRaNiD and I worked together and released freesd, a free replacement module for LIBSD. **02.05.04 - PS2SDK announced** PS2LIB and PS2DRV were merged into PS2SDK and the project was announced. **23.04.04 - gsKit announced** This graphics library by Neovanglist was announced and later became the most popular graphics library in PS2DEV. **05.04.04 - Oddment Demo released** [<img class="alignnone size-medium wp-image-67" title="oddment1" src="http://lukasz.dk/files/oddment1-300x232.jpg" alt="" width="300" height="232" />][27] adresd, emoon, jar, raizor and TyRaNiD worked together to create this demo for [Breakpoint 2004][28]. Music by Trinodia. It finished #7 in the Console/Real Wild category. [Download here][6] **06.09.04 - PS2SDK 1.1 released** First updated version of PS2SDK was released as a binary, not many binary release were made after this one. I always recommend to build PS2SDK yourself, as there are many changes from the last official binary release. **24.10.04 - OpenVCL released** emoon and chip release their own free variant of VCL, a tool available for licensed developers were you could write VU programs in a C like language and it would the generate optimized VU code for you. Linux and Windows binaries of VCL were released a few months later and this project hasn't been updated since. **12.12.04 - PlayStation Portable released** When the PSP was released, many PS2 developers moved over to it and PS2DEV began to slow down. **23.12.04 - VCL binaries released** VCL binaries released, a tool for writing VU code in a C-like language. [Download here][29] 
## Year 2005 
2005 was quite a slow year for PS2DEV, many projects got updated, but nothing major happend. 2005 was the year PSPDEV took off and has in a much shorter periode of time proven to be much more popular than PS2DEV. 

**09.02.05 - Llibplanar released** Llibplanar is a graphics library by neofar. The library seems quite advanced, however all documentation is written in Spanish, so besides it being used in some of neofars own projects, I havn't seen much usage of this library anywhere else. [neofars PS2Dev website][30] 
## Year 2006

**26.01.06 - USBD added to PS2SDK** USB Driver by cody56 gets added to PS2SDK. **17.04.06 - 4 Edges Demo released** Demo by The Black Lotus (TBL) released at Breakpoint 2006. Very advanced demo, showing the potential of PS2DEV. [Poüet link][31] **20.06.06 - PS2 Racer released** ![ps2-racer.jpg][32] Ps2 Racer by jbit was the game that won the PS2DEV.org game competition. It uses VU1 renderer and is quite playable, I recommend checking it out. [Download here][33], [original forum post by jbit][34]. **06.11.06 - PS3 released** When the PS3 got released, then most of the remaining PS2DEV developers who didnt switch to PSP, switched to PS3. After the PS3 was released, PS2 became "old" and PS2DEV slowed down dramatically. 
## Year 2007

**30.08.07 - freepad and freemtap added to PS2SDK** freepad and freemtap are free controller and multi-tap drivers for the IOP, compatible with PADMAN and MTAPMAN, released by me. 
## Year 2008

**19.05.08 - Free McBoot released** Originally released as "Free OsDatel Boot MC 1.0 BETA" on the [PSX-Scene][35] forums, Free McBoot enables you to boot a ELF directly from a memory card. This is possible to due to the fact the OSD looks for OSD updates in the form Magic Gate encrypted ELFs on the memory card. The people behind the Free McBoot project have been able to take an existing encrypted ELF and inject their own minimal ELF loader into it and have the OSD load it as an update from the memory card. Their minimal ELF loader then loads an unencrypted ELF from the memory card or another device such as an USB pendrive. Once Free McBoot is installed on a memory card, it will boot on any PS2 its inserted into, as long as the PS2 looks for OSD updates on the memory card. Which I believe all PS2 models up until atleast the release of Free McBoot do. From a development point of view, this is interesting because you do not need to modify your PS2 hardware in order to boot a development tool like PS2Link and get started with PS2DEV. The only downside to this tool is that in order for you to install Free McBoot on a memory card, you need a PS2 capable of booting the installer ELF. As an alternative you can buy the Datel Memory Plus 64MB memory card which comes with a preinstalled OSD update ELF. It uses the same method as Free McBoot to boot ELFs of a memory card or USB pendrive. The ELF loader used in Datels memory card has some limitations and issues, which you can read more about and get a solution for in my blog post about the memory card [here][36].

 [1]: http://ps2dev.org/
 [2]: http://lukasz.dk/files/ps2_block_diagram.gif
 [3]: http://playstation2-linux.com/projects/sps2/
 [4]: http://lukasz.dk/files/rgreen_procedural_renderinggdc2001.pdf
 [5]: http://home.casema.nl/eugene_plotnikov/
 [6]: http://lukasz.dk/playstation-2-programming/file-mirror/
 [7]: http://lukasz.dk/playstation-2-programming/cygwin-tutorial/
 [8]: http://lukasz.dk/playstation-2-programming/mingw-tutorial/
 [9]: http://lukasz.dk/playstation-2-programming/using-the-ps2link-exception-screen/
 [10]: http://lukasz.dk/playstation-2-programming/ps2link-debugging/
 [11]: http://ps2dev.org/ps2/Projects/Libraries/gsKit
 [12]: http://lukasz.dk/files/3stars.jpg
 [13]: http://lukasz.dk/files/pills.jpg
 [14]: http://lukasz.dk/files/funslower.jpg
 [15]: http://lukasz.dk/files/naplink.jpg
 [16]: http://lukasz.dk/playstation-2-programming/the-third-creation/
 [17]: http://ps2dev.org/PS2/Projects/Libraries/gsKit
 [18]: http://www.playstation2-linux.com
 [19]: http://http//playstation2-linux.com/projects/sps2
 [20]: http://sms.psx-scene.com/eng/index.htm
 [21]: http://lukasz.dk/files/inlinkscr.jpg
 [22]: http://lukasz.dk/files/pukklink.jpg
 [23]: http://lukasz.dk/files/aura10.jpg
 [24]: http://en.wikipedia.org/wiki/Scene.org_Awards
 [25]: http://www.kanshima.net/mirrors/ee-sio/ps2-ee-sio.html
 [26]: http://lukasz.dk/files/ps2link.jpg
 [27]: http://lukasz.dk/files/oddment1.jpg
 [28]: http://breakpoint.untergrund.net/2004/index.php
 [29]: http://playstation2-linux.com/projects/vcl
 [30]: http://ps2dev.ofcode.com
 [31]: http://www.pouet.net/prod.php?which=24552
 [32]: http://lukasz.dk/files/ps2-racer.jpg
 [33]: http://ps2dev.org/The_Fourth_Creation/PS2-Racer
 [34]: http://forums.ps2dev.org/viewtopic.php?p=42478#42478
 [35]: http://www.psx-scene.com
 [36]: http://lukasz.dk/2008/04/22/datel-memory-plus-64-mb/