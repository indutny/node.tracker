var encode = exports.encode = function(obj, recursion) {
  var _type = typeof obj; // simple caching;
  
  recursion++;
  
  if (recursion > 100) {
    throw Error('bencode::encode - Maximum recursion exceeded');
  }
  
  if (_type === 'string') {
    return obj.length + ':' + obj
  } else if (_type === 'number') {
    return 'i' + obj + 'e';
  } else if (_type === 'array') {
    var output = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      output[i] = encode(obj[i], recursion);
    }
    return 'l' + output.join('') + 'e';
  } else if (obj) {
    var output = [];
    for (var i in obj) {
      if (!obj.hasOwnProperty(i)) continue;
      output.push(encode(i.toString()) + encode(obj[i]));
    }
    return 'd' + output.join('') + 'e';
  }
  
  return '0:';
}
