const api = require('./api');

exports.search = (q) => api('search')({q});

exports.read = (id) => api(id)();