const api = require('./api');
const routes = require('./routes');

//module.exports = routes(api);

const fakeApi = require('./fakeApi');
module.exports = routes(fakeApi);
