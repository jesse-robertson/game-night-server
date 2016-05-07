/* global fetch */ require('isomorphic-fetch');
const qs = require('qs');

const baseUrl = '//www.igdb.com/api/v1/games/';

const getQueryString = (params) => '?'+qs.stringify(Object.assign({
    token: 'zG9-pfR6SswlCw6m0T63B9tW9KvV4X91CKig_Jgu3lQ'
}, params));

const handleServerErrors = (response) => {
    if (response.status >= 400) {
        throw new Error("Bad response from server");
    }
    return response.json();
};

const api = (path) => (params) => 
    fetch(baseUrl+path+getQueryString(params))
        .then(handleServerErrors);
        
module.exports = api;