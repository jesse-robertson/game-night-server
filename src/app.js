"use strict";

const actionTypes = require('./action/types');
const actionCreators = require('./action/creators'); 

const toIdMap = (thing) => {
    // If a reducible object (array) was passed...
    if (typeof thing.reduce === 'function') {
        return thing.reduce( 
            (soFar, current) => Object.assign(soFar,toIdMap(current))
        , {});
    }
    
    const idMap = {};
    const newThing = Object.assign({},thing);
    delete newThing.id;
    idMap[thing.id] = newThing
    return idMap;
}

module.exports = (socket, model) => {
   
    const dispatch = (action) => socket.send({
        type: actionTypes.ACTION,
        payload: action
    });
   
    const log = (x) => {
        console.log(JSON.stringify(x));
        return x;
    }
       
    const first = (n) => (results) => results.slice(0, n);   
       
    const actor = {};
    
    const actionMap = {
        [actionTypes.SUGGEST_GAME] : (model, actor, action) => console.log(action),
        [actionTypes.SEARCH_REQUEST] : (model, actor, action) => 
            model.igdb.search(action.payload.query)
                .then(first(5))
                .then(actionCreators.searchSuccess(action.payload.query))  
    }
    
    socket.receive( message => {
        if (message.type === actionTypes.ACTION) {
            const action = message.payload;        
            const handler = actionMap[action.type];
            if (handler) {
                const prom = handler(model, actor, action);
                if (prom && prom.then) {
                    prom.then(dispatch)    
                }
            } 
        }
    });
    
    var entity = {};
    
    const addToEntity = (obj) => {
        entity = Object.assign(entity, obj);
        return entity;    
    } 
     
    addToEntity({
        group : {
            games : ['1627','1628','1629','1626']
        }
    })
    
    Promise.all(entity.group.games.map( id => model.igdb.read(id)))
        .then(toIdMap)
        .then(idMap => ({game:idMap}))
        .then(addToEntity)
        .then( entity => dispatch(actionCreators.refreshEntity(entity)))
        .catch(console.error);
}