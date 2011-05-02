function DetectInIE() {

    // The default Unity generated html has a vbscript that detect the webplayer
    // for IE. Apparently it is better because this code does not immediately destroy
    // the created ActiveX object.     
    // But, since I wanted to move everthing into external script files
    // and I can't for the life of me work out how to call an external client side VB
    // script from javascript this will have to do. 
    
   	var returnVal = false;
	try 
	{
		var tControl = new ActiveXObject("UnityWebPlayer.UnityWebPlayer.1");
	}
	catch (javascriptError) 
	{
		tControl = null;
	}

//    var returnVal = false;
    
    if (tControl != null) {
        if (tControl.GetPluginVersion() == "2.5.0f5") {
            //     2.5.0f5 on Vista and later has an auto-update issue
            //     on Internet Explorer. Detect Vista (6.0 or later)
            //     and in that case treat it as not installed
            var useragent = navigator.userAgent;

            var re = new RegExp("Windows NT (\\d+)\\.");

            var matches = re.exec(useragent);

            alert("MATCHES " + matches);
            if (matches.length == 2) {
                var major = Number(matches[1]);
                    
                if (major < 6) {
                    returnVal = true;
                }
            }
        }
        else {
            returnVal = true;
        }
    }
    return returnVal;
}


function GetUnity() {
    if (navigator.appVersion.indexOf("MSIE") != -1 && navigator.appVersion.toLowerCase().indexOf("win") != -1)
        return document.getElementById("UnityObject");
    else if (navigator.appVersion.toLowerCase().indexOf("safari") != -1)
        return document.getElementById("UnityObject");
    else
        return document.getElementById("UnityEmbed");
}

function DetectUnityWebPlayer() {
    var tInstalled = false;
    if (navigator.appVersion.indexOf("MSIE") != -1 && navigator.appVersion.toLowerCase().indexOf("win") != -1) {
        //        		    tInstalled = DetectUnityWebPlayerActiveX();
        tInstalled = DetectInIE();
    }
    else {
        if (navigator.mimeTypes && navigator.mimeTypes["application/vnd.unity"]) {
            if (navigator.mimeTypes["application/vnd.unity"].enabledPlugin && navigator.plugins && navigator.plugins["Unity Player"]) {
                tInstalled = true;
            }
        }
    }
    return tInstalled;
}

function GetInstallerPath() {
    var tDownloadURL = "";
    var hasXpi = navigator.userAgent.toLowerCase().indexOf("firefox") != -1;

    // Use standalone installer
    if (1) {
        if (navigator.platform == "MacIntel")
            tDownloadURL = "http://webplayer.unity3d.com/download_webplayer-2.x/webplayer-i386.dmg";
        else if (navigator.platform == "MacPPC")
            tDownloadURL = "http://webplayer.unity3d.com/download_webplayer-2.x/webplayer-ppc.dmg";
        else if (navigator.platform.toLowerCase().indexOf("win") != -1)
            tDownloadURL = "http://webplayer.unity3d.com/download_webplayer-2.x/UnityWebPlayer.exe";
        return tDownloadURL;
    }
    // Use XPI installer
    else {
        if (navigator.platform == "MacIntel")
            tDownloadURL = "http://webplayer.unity3d.com/download_webplayer-2.x/UnityWebPlayerOSX.xpi";
        else if (navigator.platform == "MacPPC")
            tDownloadURL = "http://webplayer.unity3d.com/download_webplayer-2.x/UnityWebPlayerOSX.xpi";
        else if (navigator.platform.toLowerCase().indexOf("win") != -1)
            tDownloadURL = "http://webplayer.unity3d.com/download_webplayer-2.x/UnityWebPlayerWin32.xpi";
        return tDownloadURL;
    }
}

function AutomaticReload() {
    navigator.plugins.refresh();
    if (DetectUnityWebPlayer())
        window.location.reload();

    setTimeout('AutomaticReload()', 500)
}

function LoadUnityAfterClick(unityFilePath, sizex, sizey, id) {
    var hasUnity = DetectUnityWebPlayer();
    var brokenUnity = false;
    if (hasUnity) {

        // This will insert the created document back into the 'box' element so it will replace the image. 
        var divId= document.getElementById(id)

        var theHtml = "";
        theHtml += '<object id="UnityObject" classid="clsid:444785F1-DE89-4295-863A-D46C3A781394" width="' + sizex + '" height="' + sizey + '"> \n';
        theHtml += '  <param name="src" value="' + unityFilePath + '" /> \n';
        theHtml += '<embed id="UnityEmbed" src="' + unityFilePath + '" width="' + sizex + '" height="' + sizey + '" type="application/vnd.unity" pluginspage="http://www.unity3d.com/unity-web-player-2.x" /> \n';
        theHtml += '</object>';
        divId.innerHTML = theHtml;

        // if Unity does not define to GetPluginVersion on Safari on 10.6, we presume the plugin
        // failed to load because it is not compatible with 64-bit Safari.
        if (navigator.appVersion.indexOf("Safari") != -1
						&& navigator.appVersion.indexOf("Mac OS X 10_6") != -1
						&& document.getElementById("UnityEmbed").GetPluginVersion == undefined)
            brokenUnity = true;

        // 2.5.0 cannot auto update on ppc. Treat as broken.
        else if (document.getElementById("UnityEmbed").GetPluginVersion() == "2.5.0f5"
						&& navigator.platform == "MacPPC")
            brokenUnity = true;

    }
    if (!hasUnity || brokenUnity) {

        var installerPath = GetInstallerPath();
        if (installerPath != "") {
            // Place a link to the right installer depending on the platform we are on. The iframe is very important! Our goals are:
            // 1. Don't have to popup new page
            // 2. This page still remains active, so our automatic reload script will refresh the page when the plugin is installed
            document.write('<div align="center" id="UnityPrompt"> \n');
            if (brokenUnity)
                document.write('  <a href= ' + installerPath + '><img src="http://webplayer.unity3d.com/installation/getunityrestart.png" border="0"/></a> \n');
            else
                document.write('  <a href= ' + installerPath + '><img src="http://webplayer.unity3d.com/installation/getunity.png" border="0"/></a> \n');
            document.write('</div> \n');

            // By default disable ActiveX cab installation, because we can't make a nice Install Now button
            //						if (navigator.appVersion.indexOf("MSIE") != -1 && navigator.appVersion.toLowerCase().indexOf("win") != -1)
            if (0) {
                document.write('<div id="InnerUnityPrompt"> <p>Title</p>');
                document.write('<p> Contents</p>');
                document.write("</div>");

                var innerUnityPrompt = document.getElementById("InnerUnityPrompt");

                var innerHtmlDoc =
								'<object id="UnityInstallerObject" classid="clsid:444785F1-DE89-4295-863A-D46C3A781394" width="320" height="50" codebase="http://webplayer.unity3d.com/download_webplayer-2.x/UnityWebPlayer.cab#version=2,0,0,0">\n' +
							    '</object>';

                innerUnityPrompt.innerHTML = innerHtmlDoc;
            }

            document.write('<iframe name="InstallerFrame" height="0" width="0" frameborder="0"></iframe>\n');
        }
        else {
            document.write('<div align="center" id="UnityPrompt"> \n');
            if (brokenUnity)
                document.write('  <a href="javascript: window.open("http://www.unity3d.com/unity-web-player-2.x"); "><img src="http://webplayer.unity3d.com/installation/getunityrestart.png" border="0"/></a> \n');
            else
                document.write('  <a href="javascript: window.open("http://www.unity3d.com/unity-web-player-2.x"); "><img src="http://webplayer.unity3d.com/installation/getunity.png" border="0"/></a> \n');
            document.write('</div> \n');
        }

        // hide broken player
        if (brokenUnity)
            document.getElementById("UnityEmbed").height = 0;

        // Reload when detected unity plugin - but only if no previous plugin is installed 
        // - in that case a browser restart is needed.
        if (!brokenUnity)
            AutomaticReload();
    }
}
