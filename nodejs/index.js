var Connect = require('connect'),
    querydecoder = require('./lib/querydecoder'),
    querystring = require('querystring'),
    storage = require('./lib/storage');
    
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
        
        if (!fn) return success();
        
        try {
          fn(query, next);
        } catch (e) {
          return error(e);
        }
      }
      next();
    });
  }
  
  var requirements = checkRequirements(
    function (query, next) {
      var info_hash = query.info_hash;
      if (!info_hash || info_hash.length !== 20) {
        throw Error('info_hash is wrong');
      }
      next();
    },
    function (query, next) {
      var peer_id = query.peer_id;
      if (!peer_id || peer_id.length !== 20) {
        throw Error('peer_id is wrong');
      }
      next();
    },
    function (query, next) {
      var port = query.port = parseInt(query.port);
      if (!port) {
        throw Error('port is wrong');
      }
      next();
    }
  );

  app.get('/announce', function(req, res, next) {
    
    requirements(req.query, function() {    
      storage.getPeersByInfoHash(req.query.info_hash);
      res.writeHead(200);
      res.end('');
    }, function(msg) {
      res.writeHead(400, msg.toString());
      res.end('');
    });
  });
}

server.listen(8080);
