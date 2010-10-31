var INCOMPLETE = 0,
    COMPLETE = 1;

var Storage = module.exports = function() {
  this.info_hashes = {};
};

function createTorrent() {
  return {
    peers: [],
    peersById: {},
    complete: 0,
    incomplete: 0
  };
}

function createPeer(torrent, peer_id) {
  var index = torrent.peers.length
  return torrent.peers[index] = {
    index: index,
    peer_id: peer_id,
    ip: '',
    port: '',
    status: INCOMPLETE
  };
}

Storage.prototype.getTorrent = function(info_hash) {
  var torrent = this.info_hashes[info_hash];
  
  return torrent ?
             torrent :
             this.info_hashes[info_hash] = createTorrent(torrent);
 
}

function getPeer(torrent, peer_id) {
  var peer = torrent.peersById[peer_id];
  
  return peer ? peer: torrent.peersById[peer_id] = createPeer(torrent, peer_id);
}

Storage.prototype.getPeersByInfoHash = function(info_hash, peer_id) {
  
  var peers = this.getTorrent(info_hash).peers.map(function(peer) {
    return {
      peer_id: peer.peer_id,
      ip: peer.ip,
      port: peer.port
    };
  });
  
  for (var i = 0, len = peers.length; i < len; i++) {
    if (peers[i].peer_id === peer_id) {
      peers.splice(i, 1);
      break;
    }
  }
  
  return peers;
  
}

Storage.prototype.getStats = function(info_hash) {
  var torrent = this.getTorrent(info_hash);
  return {
    incomplete: torrent.incomplete,
    complete: torrent.complete
  };
}

Storage.prototype.updatePeer = function(info_hash, peer_data) {
  var torrent = this.getTorrent(info_hash),
      peer = getPeer(torrent, peer_data.peer_id);
  
  peer.ip = peer_data.ip;
  peer.port = peer_data.port;
  if (peer_data.event === 'started') {
    peer.status = INCOMPLETE;
  }
  if (peer_data.event === 'completed') {
    peer.status = COMPLETE;
  }
}
