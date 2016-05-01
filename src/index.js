const app       = require('./app');
const websocket = require('./websocket');
const model     = require('./model');

websocket( socket => {
    app(socket, model);
});