var config, get, request;

request = require('request');

config = require('./config');

get = function(url, callback, opts) {
  var filter, filterValue, optUrl, options, param, paramValue;
  if (opts == null) {
    opts = false;
  }
  url = config.endpoint + url;
  if (opts) {
    optUrl = [];
    for (param in opts) {
      paramValue = opts[param];
      if (param === "filters") {
        for (filter in paramValue) {
          filterValue = paramValue[filter];
          optUrl.push("filters[" + filter + "]=" + filterValue);
        }
      } else {
        optUrl.push(param + "=" + paramValue);
      }
    }
    url += "?" + optUrl.join('&');
  }
  options = {
    url: url,
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Token token="' + config.apikey + '"'
    }
  };
  return request(options, function(error, response, body) {
    if (error) {
      throw error;
    }
    if (response.statusCode === 200) {
      if (callback) {
        return callback(JSON.parse(body));
      }
    } else {
      throw response.statusCode;
    }
  });
};

module.exports = {
  games: {
    index: function(opts, callback) {
      return get('games', callback);
    },
    get: function(id, callback) {
      return get('games/' + id, callback);
    },
    meta: function(callback) {
      return get('games/meta', callback);
    },
    search: function(opts, callback) {
      return get('games/search', callback, opts);
    }
  }
};
