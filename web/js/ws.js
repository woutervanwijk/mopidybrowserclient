/**
 * @author Wouter van Wijk
 * 
 * communication with ws server
 * 
 */

//process results of list of playlists of the user
function handleGetplaylists (resultArr) {
/*<p><ul><li>Donec id elit non mi porta</li><li>Gravida at eget metus. Fusce dapibus.</li><li>Tellus ac cursus commodo</li></p>
              <p><a class="btn" href="#">More &raquo;</a></p>	
*/
	$('#playlistslist').empty();
	playlists.length = 0;
	//console.log(resultArr);
	resultToPlaylists(resultArr, playlists);
	//console.log(playlists);
	tmp = '';
	for(var i=0; i < playlists.length; i++) {
		var child = '<li><a href="#" id="' + playlists[i].uri + '"">' + playlists[i].name + '</a></li>';
		tmp += child;
	};
	$('#playlistslist').html(tmp);
	$('#playlistslist a').click( function() { return setPlaylist(this.id) } );
}

//process results of a returned playlist
function handlePlaylist (resultArr) {
	//cache
	newplaylisturi = resultArr["uri"];
	playlists[ newplaylisturi ] = resultArr;
	playlisttotable(playlists[newplaylisturi], CURRENT_PLAYLIST_TABLE);
	currentviewuri = newplaylisturi;
}

//process results of a returned playlist
function handleCurrentPlaylist (resultArr) {
	console.log(resultArr)
	//$("#result").html(resultArr);
}

function handleSearchResults (searchtype, resultArr) {
	//div id is albumresulttable
	console.log(searchtype);
	console.log(resultArr["uri"]);
	tableid = '#' + searchtype + 'resulttable'
	playlists[resultArr["uri"]] = resultArr;
	playlisttotable(resultArr, tableid);
}

function handleAlbumResults (resultArr) {
	console.log(resultArr["uri"]);
	console.log(resultArr);
	playlists[resultArr["uri"]] = resultArr;
	playlisttotable(resultArr, ALBUM_TABLE);
}

function handleArtistResults (resultArr) {
	console.log(resultArr);
	playlists[resultArr["uri"]] = resultArr;
	playlisttotable(resultArr, ARTIST_TABLE);
}
