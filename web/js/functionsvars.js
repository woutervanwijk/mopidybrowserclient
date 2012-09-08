/**
 * @author Wouter van Wijk
 * 
 * all kinds functions and vars  
 */

var baseurl = '/mopidy';
var host = window.location.hostname;
var port = window.location.port;
var wsurl = host + ':' + port + baseurl
var intv;
var socket;

//values for controls
var play;
var shuffle; 
var repeat; 
var currentVolume = -1;
var muteVol = -1;

//array of cached playlists (not only user-playlists, also search, artist, album-playlists)
var playlists = new Array();

//constants
ARTIST_TABLE = '#artisttable';
ALBUM_TABLE = '#albumtable';
CURRENT_PLAYLIST_TABLE = '#currentplaylisttable';

WEB_SOCKET_SWF_LOCATION = "/static/WebSocketMain.swf";
WEB_SOCKET_DEBUG = true;

	
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
	$(table).empty();

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
		
	$(table).html( tmp );
	
	//set click handlers
	$(table + ' .name').click( function() { return playtrack(this.id, playlist.uri) } );
	$(table + ' .album').click( function() { return showalbum(this.id, playlist.uri) } );
	$(table + ' .artist').click( function() { return showartist(this.id, playlist.uri) } );
}

//convert time to human readable format  
function timeFromSeconds (length) {
	d = Number(length);
	var h = Math.floor(d / 3600);
	var m = Math.floor(d % 3600 / 60);
	var s = Math.floor(d % 3600 % 60);
	return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s);
}
	
//playlist object
function playlist(name, uri, tracks) {
	this.uri = uri;
	this.name = name;
	//array of track
	this.tracks = tracks;
}

//track object
function track(uri, length, artists, name, albumname, albumuri) {
	this.uri = uri;
	this.name = name;
//  aray of artists
	this.artists = artists;
	this.albumname = albumname;
	this.albumuri = albumuri;
	this.length = length;
}

//convert mopidy results to a playlist list
function resultToPlaylists(resultArr, nwplaylists) {
	//get list of playlists from server result
	for(var i=0; i < resultArr.length; i++) {
		nwplaylists.push (new playlist(resultArr[i][0], resultArr[i][1]));
	}
}

