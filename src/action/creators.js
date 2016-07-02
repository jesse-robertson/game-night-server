const actionTypes = require('./types');

exports.searchSuccess = (query) => (results) => ({
    type: actionTypes.SEARCH_SUCCESS,
    payload: {
        query: query,
        results: results
    }               
});

exports.refreshEntity = (entity) => ({
    type: actionTypes.REFRESH_ENTITY,
    payload: {
        entity: entity
    }
})    