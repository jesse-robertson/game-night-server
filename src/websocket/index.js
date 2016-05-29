const ws = require('ws');
const wss = new ws.Server({ port: 8081 });
const CONNECTION = 'connection';
const MESSAGE = 'message';

module.exports = (next) => {
    wss.on(CONNECTION, (ws) => {
        next({
            receive: (next) => 
                ws.on(MESSAGE, (message) => next(JSON.parse(message))),
            send: (payload) => 
                ws.send(JSON.stringify(payload))
        });
    });
};