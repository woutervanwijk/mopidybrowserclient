/* all  gui interactions here 
 * 
 */
	
//process updated playlist to gui
function playlisttotable(playlist, table) {
	/*  <tr>
			<td>Title</td>
			<td>Artist</td>
			<td>Album</td>
			<td>Length</td>
		</tr>
	*/
	tmp = '';
	with(playlist) {
		for(var i=0; i < tracks.length; i++) {
			var child = '<tr><td><a href="#" class="name" id="' + tracks[i].uri + '">' + tracks[i].name + "</a></td><td>";
				for(var j=0; j < tracks[i].artists.length; j++) {
					//console.log(j);
					child += '<a href="#" class="artist" id="' + tracks[i].artists[j].uri + '">' + tracks[i].artists[j].name + "</a>";
				}
				 child += '</td><td><a href="#" class="album" id="' + tracks[i].albumuri + '">' + tracks[i].albumname + 
				 '</a></td><td><a href="#" class="time" id="' + tracks[i].uri + '">' + timeFromSeconds (tracks[i].length) + '</a></td></tr>';
			tmp += child;
		};
	}
	//if (currentviewuri != pluri) {return}
	
	$(table).empty();
	
	//console.log(playlists[pluri]);
	
	$(table).html( tmp );
	
	//set click handlers
	$(table + ' .name').click( function() { return playtrack(this.id) } );
	$(table + ' .album').click( function() { return showalbum(this.id) } );
	$(table + ' .artist').click( function() { return showartist(this.id) } );
}

function showalbum(uri) {
    socket.emit('getalbum', uri);
	switchContent('albumspane');
	currentviewuri = uri;
}

function showartist(uri) {
    socket.emit('getartist', uri);
	switchContent('artistspane')
	currentviewuri = uri;
}

//play uri, update playlist to player if needed
function playtrack (uri) {
	trackslist = new Array();
	console.log('uri:'  + uri);
	console.log('cv:' + currentviewuri)
/*	if (currentviewuri != nowplayinguri) { 
		if (currentviewuri.indexOf(":playlist:") != -1 ) {
			console.log('cv' + currentviewuri)
			socket.emit('playplaylist', currentviewuri);
		} else if (currentviewuri.indexOf(":album:") != -1 ) {
			socket.emit('playalbum', currentviewuri);
		} else if (currentviewuri.indexOf(":artist:") != -1 ) {
			socket.emit('playartist', currentviewuri);
		} else {
	*/		
			//custom (search) playlist
			with(playlists[currentviewuri]) {
				for(var i=0; i < tracks.length; i++) {
					trackslist.push(tracks[i].uri)
				}
			}
		    socket.emit('newtracklist', trackslist);
//		}	
//	}
    socket.emit('playtrack', uri);
}

function setplay (nwplay) {
	if (play == nwplay) { return }
	if (!nwplay) {
		$("#playbt").attr('src', 'img/icons/play_alt_32x32.png');
	} else {
		$("#playbt").attr('src', 'img/icons/pause_12x16.png');		
	}
	play = nwplay;
}

//play or pause
function playpause () {
    if (play) {
        socket.emit('play', true);
	} else {
	    socket.emit('play', false);
    }
    console.log('play emitted');
	setplay(!play);
}

function setPlaylist (uri) {
	$('#currentplaylisttable').empty();
	//get if pl not in cache	
	if(playlists[ uri ]) {
		playlisttotable(playlists[uri], '#currentplaylisttable');
		currentviewuri = uri;
	} else {
		socket.emit('getplaylisttracks', uri);
	}
	switchContent('currentpane');
	currentviewuri = uri;
}

function newPlaylist(pl, name, plid) {
	socket.emit('clear');
	currentplaylist.length = 0;
	currentplaylist = pl;
	currentplaylistid = -1; 
	if(name) {
		currentplaylistname = name;
	} else {
		currentplaylistname = '';
	}
	currentSongId = -1;
	socket.emit('clear');
	for(var i=0; i < pl.length; i++) {
		socket.emit('add', pl[i].file);
	}
	playid(plid);
	switchContent('currentpane');
}

function setVolume (vol) {
	currentVolume = vol;
	$("#volume").html(vol);
}

function setSong (id) {
	console.log("pl id: " + id);
	currentSongId = id;
	if ((id>=0) && (id < currentplaylist.length)) {
		$("#songname").html(currentplaylist[id].title);
		$("#artist").html(currentplaylist[id].artist);
		$("#songlength").html(currentplaylist[id].getTime);
	}
}

function searchPressed(key) {
	value = $('#searchinput').val();
	console.log(value);
	console.log(key);
	
	if (key == 13) {
		initSearch(value);
		$('#artistresulttable').empty();
		$('#albumresulttable').empty();
		$('#trackresulttable').empty();
		switchContent('searchpane');
		currentviewuri = 'search';
	}
	return true;
}

//init search 
function initSearch(value) {
	if ((value.length < 100) && (value.length > 0)) {
		//seperate requests for now
		socket.emit('search', 'all', value);
		socket.emit('search', 'track', value);
		socket.emit('search', 'artist', value);
		socket.emit('search', 'album', value);
	}
}

function volumeMute () {
/*	console.log('currentvolume' + currentVolume);
	var vol = 0;
	if (currentVolume > 0) {
		//mute
		muteVol = currentVolume;
	} else {
		//unmute if mutevol > 0
		if(muteVol > 0) {
			vol = muteVol;
			muteVol = -1;
		}
	}
	*/
	//only emit the event, not the status
	socket.emit('muteunmute');
}

function volumeUp () {
	console.log(currentVolume);
	var vol = currentVolume + 10;
	if(vol > 100) {vol = 100}
	socket.emit('setvolume', vol);
}

function volumeDown () {
	var vol = currentVolume - 10;
	if(vol < 0) {vol = 0}
	socket.emit('setvolume', vol);
}

function setrepeat (nwrepeat) {
	if (repeat == nwrepeat) { return }
	if (!nwrepeat) {
		$("#repeatbt").attr('src', 'img/icons/reload_alt_18x21.png');
	} else {
		$("#repeatbt").attr('src', 'img/icons/reload_18x21.png');		
	}
	repeat = nwrepeat;
}

function setshuffle (nwshuffle) {
	if (shuffle == nwshuffle) { return }
	if (!nwshuffle) {
		$("#shufflebt").attr('src', 'img/icons/loop_alt2_24x21.png');
	} else {
		$("#shufflebt").attr('src', 'img/icons/loop_24x24.png');		
	}
	shuffle = nwshuffle;
}

function doprevious () {
    //setplay(true);
    socket.emit('previous');
}

function donext () {
        socket.emit('next', 'next test');
}

function doshuffle () {
    if (shuffle == false) {
    	socket.emit('random', '1');
    } else {
    	socket.emit('random', '0');
    }
    setshuffle(!shuffle);
}

function dorepeat () {
    if (repeat == false) {
    	socket.emit('repeat', '1');
    } else {
    	socket.emit('repeat', '0');
    }
    setrepeat(!repeat);
}

function setvol (vol) {
    socket.emit('setvolume', vol);
}

function seek (val) {
    socket.emit('seek', val);
}

function getPlaylists() {
    socket.emit("getplaylists");
}

//timer function to update interface
function updateTime() {
	
}

function switchContent (divid) {
	$('.content').hide();
	$('#' + divid).show();
	//$('#' + divid).load(divid + '.html');
	$('.nav li').removeClass('active');
	$('#li' + divid).addClass('active');
	switch(divid) {
		case 'current':
			//getCurrentPlaylist();
			break;
		case 'mymusic':
			getPlaylists();
			break;	
		case 'search':
			break;	
	}
}

function initSocketEvents() {
	// Update the status 
	socket.on('status_change', function(data) {
		$("#result").html(data);
	});
	
	// List of Playlists arrived
	socket.on('playlists', handleGetplaylists );

	// Tracks of Playlist arrived
	socket.on('playlist', handlePlaylist );

	// Tracks of CurrentPlaylist arrived
	socket.on('currentplaylist', handleCurrentPlaylist );

	// Results of search for tracks arrived
	socket.on('searchresults', handleSearchResults );

	// Results of album request
	socket.on('albumresults', handleAlbumResults );

	// Results of artist request
	socket.on('artistresults', handleArtistResults );

}

$(document).ready(function(){
	// Socket.io specific code
	socket = io.connect(baseurl);
	initSocketEvents();
	getPlaylists(); 
	
	$('.content').hide();
    $('.sidebar-nav a').bind('click', function (e) {
		var thistab = e.target; // activated tab
		var divid = $(thistab).attr('href').substr(1);
		console.log(divid);
		switchContent(divid);
    });
	
	//getCurrentPlaylist();

	// Update the graph when we get new data from the server
	socket.on('status_change', function(data) {
		$("#result").html(data);
	});

	$("#mymusicpane").show();

});
