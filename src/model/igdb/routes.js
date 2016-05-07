const util = require('./util');

module.exports = (api) => ({
    search : (q)  => api('search')({q}).then(res => res.games.map(util.toGame)),
    read   : (id) => api(id)().then(res => res.game).then(util.toGame)
});