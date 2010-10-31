var chr = function(i) {
  return String.fromCharCode(parseInt(i) || 0);
}

function ipToBinary(ip) {
  ip = ip.split('.');
  
  return chr(ip[0]) + chr(ip[1]) + chr(ip[2]) + chr(ip[3]);
}

function portToBinary(port) {
  var lo = port % 256, hi = (port - lo) >> 8;
  
  return chr(hi) + chr(lo);
}

module.exports = function(peers) {
  var output = [];
  
  peers.forEach(function(peer) {
  
    var ip = ipToBinary(peer.ip),
        port = portToBinary(peer.port);
    output.push(ip + port);
  });
  
  console.log(output.join('').length);
  
  return output.join('');
};
