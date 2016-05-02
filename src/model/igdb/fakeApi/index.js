module.exports = (path) => (params) => {
    const req = (path === 'search') ? 'supersmash' : path;
    return Promise.resolve(require('./'+req));   
}