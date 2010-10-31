var options = {
  interval: 60,
  min_interval: 60
};

var Connect = require('connect'),
    querydecoder = require('./lib/querydecoder'),
    querystring = require('querystring'),
    storage = new (require('./lib/storage')),
    bencode = require('./lib/bencode'),
    compactPeers = require('./lib/compactpeers');
    
var server = Connect.createServer(
  querydecoder,
  Connect.router(tracker),
  function(req, res) {
    res.writeHead(404);
    res.end('Not found');
  }
);

function tracker(app) {
  function checkRequirements() {
    var middleware = Array.prototype.slice.call(arguments);
    
    return function(query, success, error) {
      var i = 0;
      function next() {
        var fn = middleware[i++];
        
        if (!fn) return success(query);
        
        
        fn(query, next, error);        
      }
      next();
    }
  }
  
  var requirements = checkRequirements(
    function (query, next, error) {
      var info_hash = query.info_hash;
      if (!info_hash || info_hash.length !== 20) {
        error('info_hash is wrong');
      }
      next();
    },
    function (query, next, error) {
      var peer_id = query.peer_id;
      if (!peer_id || peer_id.length !== 20) {
        error('peer_id is wrong');
      }
      next();
    },
    function (query, next, error) {
      var port = query.port = parseInt(query.port);
      if (!port) {
        error('port is wrong');
      }
      next();
    }
  );

  app.get('/announce', function(req, res, next) {
    res.writeHead(200, {
      'Content-Type': 'text/plain'
    });
    requirements(req.query, function(query) {
      storage.updatePeer(query.info_hash, {
        peer_id: query.peer_id,
        port: query.port,
        uploaded: query.uploaded || 0,
        downloaded: query.downloaded || 0,
        left: query.left || 0,
        event: query.event,
        ip: query.ip || req.socket.remoteAddress
      });
      
      var peers = storage.getPeersByInfoHash(query.info_hash, query.peer_id);
      
      var result = {
        'interval': options.interval,
        'min interval': options.min_interval,
        'peers': query.compact ? compactPeers(peers) : peers
      };
      
      res.end(bencode.encode(result));
    }, function(msg) {
     
      res.end(bencode.encode({
        'failure reason': msg.toString()
      }));
    });
  });
}

server.listen(8080);
