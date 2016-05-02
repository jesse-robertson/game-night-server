const ws = require('ws');
const wss = new ws.Server({ port: 8081 });

module.exports = (next) => {
    wss.on('connection', (ws) => {
        const socket = {};
        socket.receive = (next) => ws.on('message', message => next(JSON.parse(message)));
        socket.send = (payload) => ws.send(JSON.stringify(payload));
        socket.broadcast = () => console.log('so far this does nothing');
        next(socket);
    });
};


///// YAGNI BELOW

// var instanceIndex = 0;

// var clients = {};


    // const wsIndex = instanceIndex++;
    
    // clients[wsIndex] = ws;
    
    // ws.on('close', event => {
    //     delete clients[wsIndex];
    // });