const getKeywords = (g) => {
    genres = g.genres || [];
    themes = g.themes || [];
    return genres.concat(themes).map(x=>x.name).join(' ');
}

const getCoverId = (g) => {
    if (g.cover_id) return g.cover_id;
    return g.cover && g.cover.id
}

const getCover = (g) => {
    if (typeof g.cover === 'string') return g.cover;
    if (g.cover.url) return g.cover.url;
    return '';
}

const toGame = (g) => ({
    //_:console.log(g),
    id: g.id.toString(),
    name: g.name,
    keywords: getKeywords(g),
    cover: getCover(g),
    coverId: getCoverId(g),
    detail: g.summary || '',
    releaseYear: g.release_date && g.release_date.split('-')[0]
});

module.exports = {
    toGame:toGame
}