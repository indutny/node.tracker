var qs = require('querystring');

module.exports = function(req, res, next) {
  if (match = req.url.match(/\?(.+)$/)) {

    var data = qs.parse(match[1]);
    req.query = data;

  }
  next();
}
