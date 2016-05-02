const getKeywords = (g) => {
    genres = g.genres || [];
    themes = g.themes || [];
    return genres.concat(themes).map(x=>x.name).join(' ');
}

const getCover = (g) => {
    if (typeof g.cover === 'string') return g.cover;
    if (g.cover.url) return g.cover.url;
    return '';
}

const toGame = (g) => ({
    id: g.id.toString(),
    name: g.name,
    keywords: getKeywords(g),
    cover: getCover(g),
    detail: g.summary || ''
});

module.exports = (api) => ({
    search : (q)  => api('search')({q}).then(res => res.games.map(toGame)),
    read   : (id) => api(id)().then(res=>res.game).then(toGame)
});