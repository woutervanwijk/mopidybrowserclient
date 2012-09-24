/* gui interactions here
 * set- functions only set/update the gui elements
 * do- functions interact with the server
 * show- functions do both
 */

function showartist(uri) {
    $(ARTIST_TABLE).empty();
    //fill from cache
    if (playlists[uri]) {
        playlisttotable(playlists[uri], ARTIST_TABLE)
    } else {
        $('#artistsloader').show();
    }        

    //show
    switchContent('artists', uri);

    //send event if the list is updated in between (sporadic of course)
    socket.emit('getartist', uri);
    return false;
}

function showalbum(uri) {
    $(ALBUM_TABLE).empty();
    //fill from cache
    if (playlists[uri]) {
        playlisttotable(playlists[uri], ALBUM_TABLE)
    } else {
        $('#albumsloader').show();
    }        

    //show
    switchContent('albums', uri);

    //send event if the list is updated in between (sporadic of course)
    socket.emit('getalbum', uri);
    return false;
}



//play uri, update playlist to player if needed
function playtrack(uri, playlisturi) {
    trackslist = new Array();
    console.log('play uri:' + uri);
    $(CURRENT_PLAYLIST_TABLE).empty();
    pl = playlists[playlisturi];
    playlisttotable(pl, CURRENT_PLAYLIST_TABLE);
    switchContent('current', uri);

    //TODO not copy whole list each time
    //custom, not stored playlist
    with (pl) {
        for (var i = 0; i < tracks.length; i++) {
            trackslist.push(tracks[i].uri)
        }
    }
    socket.emit('loadtracklist', trackslist);
    var track;
    //find track
    for (var i = 0; i < pl.tracks.length; i++) {
        if (pl.tracks[i].uri == uri) {
            track = pl.tracks[i];
            break;
        }
    }
    if (track) {
        setSongInfo(track);
        $("#trackslider").attr("value", 0);
    }
    socket.emit('playtrack', uri);
    return false;
}

function setSongInfo(track) {
    console.log(track);
    $("#infoname").html(track.name);
    var artists = '';
    for (var j = 0; j < track.artists.length; j++) {
        artists += track.artists[j].name;
        if (j != track.artists.length - 1) {
            artists += ' - ';
        }
    }
    $("#trackslider").attr("max", track.length);
    $("#infoartist").html(artists);
    $("#songlength").html(timeFromSeconds(track.length));
}

function setPlaystate(nwplay) {
    if (!nwplay) {
        $("#playbt").attr('src', 'img/icons/play_alt_32x32.png');
    } else {
        $("#playbt").attr('src', 'img/icons/pause_12x16.png');
    }
    play = nwplay;
    if (play) { 
        initTimer();
    } else {
        clearInterval(postimer);
    }
}

//play or pause
function doPlayPause() {
    if (play) {
        socket.emit('play', true);
    } else {
        socket.emit('play', false);
    }
    console.log('play emitted');
    setplay(!play);
}

function setPlaylist(uri) {
    $(PLAYLIST_TABLE).empty();
     $('#playlisttablediv').show();
     $('#playlistloader').show();
//get if pl not in cache
    if (playlists[uri]) {
        playlisttotable(playlists[uri], PLAYLIST_TABLE);
    } else {
        socket.emit('getplaylisttracks', uri);
    }
    return false;
}

function searchPressed(key) {
    value = $('#searchinput').val();
    console.log(value);
    console.log(key);

    if (key == 13) {
        $('#artistresultloader').show();
        $('#allresultloader').show();
        $('#albumresultloader').show();

        $('#artistresulttable').empty();
        $('#albumresulttable').empty();
        $('#trackresulttable').empty();
        
        switchContent('search');
        initSearch(value);
        return false;
    }
    return true;
}

//init search
function initSearch(value) {
    if ((value.length < 100) && (value.length > 0)) {
        //seperate requests for now
        socket.emit('search', 'all', value);
        //socket.emit('search', 'track', value);
        //socket.emit('search', 'artist', value);
        //socket.emit('search', 'album', value);
    }
}

function doMute() {
    //only emit the event, not the status
    setMute(!mute);
    socket.emit('mute', !mute);
}

function setMute(nwmute) {
    if (mute == nwmute) {
        return
    }
    if (nwmute) {
        $("#mutebt").attr('src', 'img/icons/volume_mute_24x18.png');
    } else {
        $("#mutebt").attr('src', 'img/icons/volume_24x18.png');
    }
    mute = nwmute;
}

function setRepeat(nwrepeat) {
    if (repeat == nwrepeat) {
        return
    }
    if (!nwrepeat) {
        $("#repeatbt").attr('src', 'img/icons/reload_alt_18x21.png');
    } else {
        $("#repeatbt").attr('src', 'img/icons/reload_18x21.png');
    }
    repeat = nwrepeat;
}

function setShuffle(nwshuffle) {
    if (shuffle == nwshuffle) {
        return
    }
    if (!nwshuffle) {
        $("#shufflebt").attr('src', 'img/icons/loop_alt2_24x21.png');
    } else {
        $("#shufflebt").attr('src', 'img/icons/loop_24x24.png');
    }
    shuffle = nwshuffle;
}

function doPrevious() {
    socket.emit('previous');
}

function doNext() {
    socket.emit('next', 'next test');
}

function doShuffle() {
    if (shuffle == false) {
        socket.emit('random', '1');
    } else {
        socket.emit('random', '0');
    }
    setShuffle(!shuffle);
}

function doRepeat() {
    if (repeat == false) {
        socket.emit('repeat', '1');
    } else {
        socket.emit('repeat', '0');
    }
    setRepeat(!repeat);
}

function doVolume(value) {
    console.log(value);
    if (!initgui) {
         socket.emit('setvolume', value);
    }   
}

function doSeekPos(value) {
    console.log(value);
    if (!initgui) {
        socket.emit('seekpos', value);
    }
}

function getPlaylists() {
    socket.emit("getplaylists");
}

function getCurrentPlaylist() {
    socket.emit("getcurrentplaylist");
}

//timer function to update interface
function updateTime() {

}

//update everything as if reloaded
function updateStatusOfAll() {
    socket.emit('getvolume');   
    socket.emit('getpos');   
    //socket.emit('getcurrenttrack');   
    //socket.emit('getcurrentplaylist');   
    //socket.emit('getplaylists');   
}

function initSocketEvents() {
    // Update the status
    socket.on('status_change', function(data) {
        $("#result").html(data);
    });

    // List of Playlists arrived
    socket.on('playlists', handleGetplaylists);

    // Tracks of Playlist arrived
    socket.on('playlist', handlePlaylist);

    // Tracks of CurrentPlaylist arrived
    socket.on('currentplaylist', handleCurrentPlaylist);

    // Results of search for tracks arrived
    socket.on('searchresults', handleSearchResults);

    // Results of album request
    socket.on('albumresults', handleAlbumResults);

    // Results of artist request
    socket.on('artistresults', handleArtistResults);

    // Results of statusses
    socket.on('getvolume', setVolume );
    socket.on('getpos', setPos );

}

function setVolume(value) {
    $("#volumeslider").attr("value", value);

}


function switchContent(divid, uri) {
    //TODO
    //    History.pushState({viewpane:divid, state:uri}, divid, "?" + divid + "/" + uri);
    hash = divid;
    console.log("switchc hash:" + hash);
    if (uri) {
        hash += "/" + uri;
    }
    location.hash = hash;
}

function setPos(value) {
    $("#trackslider").attr("value", value);
}

function initTimer () {
        postimer = setInterval(updatePos(), 1000);
}

$(document).ready(function() {

     // fdSlider.addEvent(document.getElementById("fd-slider-volume"), "change", function(e) { alert("e");  });
    

    // Socket.io specific code
    socket = io.connect(baseurl);
    initSocketEvents();
    getPlaylists();

    $('.content').hide();
    $('.sidebar-nav a').bind('click', function(e) {
        var divid = $(e.target).attr('href').substr(1);
        var uri = $(divid + "table").attr('data');
        
        switchContent(divid, uri);
    });

    //getCurrentPlaylist();

    // Update the graph when we get new data from the server
    socket.on('status_change', function(data) {
        $("#result").html(data);
    });

    //TODO
    //setVolume(50);
   
        //history
        // Bind an event to window.onhashchange that, when the hash changes, gets the
        // hash and adds the class "selected" to any matching nav link.
        $(window).hashchange( function(){
            var hash = location.hash.split("/");
            
            //remove #
            divid = hash[0].substr(1);
            uri = hash[1];

            // Set the page title based on the hash.
            document.title = divid;

            console.log('divid: ', divid);
            console.log('uri: ', uri);
            
            switch(divid) {
                case 'current':
                    //getCurrentPlaylist();
                    break;
                case 'playlists':
                    getPlaylists();
                    break;
                case 'search':
                    break;
                case 'artist':
                    break;
            }

            
            $('.content').hide();
            $('.nav li').removeClass('active');
            $('#li' + divid).addClass('active');
            $('#' + divid + 'pane').show();
            return false;
        })
        
        $(window).hashchange();
        
        console.log(location.hash);
        if (location.hash.length < 2) {
             switchContent("playlists");
        }
          
    
/*    (function(window, undefined) {
        // Establish Variables
        var History = window.History, // Note: We are using a capital H instead of a lower h
        State = History.getState(), $log = $('#log');

        // Log Initial State
        History.log('initial:', State.data, State.title, State.url);

        // Bind to State Change
        History.Adapter.bind(window, 'statechange', function() {// Note: We are using statechange instead of popstate
            // Note: We are using History.getState() instead of event.state
            var State = History.getState();
            History.log('statechange:', State.data, State.title, State.url);
            divid = State.data.viewpane;
            console.log(divid);
            $('.content').hide();
            $('.nav li').removeClass('active');
            $('#li' + divid).addClass('active');
            $('#' + divid + 'pane').show();
        });
    })(window);
*/
        updateStatusOfAll();
  initgui = false;
});

function test() {
        updateStatusOfAll();
}
