"use strict";



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

const ACTION = 'ACTION';
const INITIAL_CACHE = 'INITIAL_CACHE'
const SEARCH_REQUEST = 'SEARCH_REQUEST';
const REFRESH_ENTITY = 'REFRESH_ENTITY';
const SEARCH_SUCCESS = 'SEARCH_SUCCESS';
const SUGGEST_GAME = 'SUGGEST_GAME';
const UNSUGGEST_GAME = 'UNSUGGEST_GAME';


module.exports = (socket, model) => {
        
    // const writeToFile = name => obj => fs.writeFile(name, JSON.stringify(obj));
  
    // model.igdb.search('super smash')
    //     .then(toIdMap)
    //     .then(x=>JSON.stringify(x,null,2))
    //     .then(console.log)
    //     .catch(console.error);
    
    //model.igdb.read('1628').then(toIdMap).then(console.log).catch(console.error);
   
    const dispatch = (action) => socket.send({
        //_:console.log(JSON.stringify(action, null, 2)),
        type: ACTION,
        payload: action
    });
   
    const searchSuccess = (query, results) => ({
        type: SEARCH_SUCCESS,
        payload: {
            query: query,
            results: results
        }               
    });
    
    const log = (x) => {
        console.log(JSON.stringify(x));
        return x;
    }
       
    const first = (n) => (results) => results.slice(0, n);   
       
    const actionMap = {
        [SUGGEST_GAME] : (action) => console.log(action),
        [SEARCH_REQUEST] : (action) => 
            model.igdb.search(action.payload.query)
                .then(first(5))
                .then( results => searchSuccess(action.payload.query, results))  
    }
    
    socket.receive( message => {
        if (message.type === ACTION) {
            const action = message.payload;        
            const handler = actionMap[action.type];
            if (handler) {
                const prom = handler(action);
                if (prom && prom.then) {
                    prom.then(dispatch)    
                }
            } 
        }
    });
    
    const refreshEntity = (entity) => ({
        type: REFRESH_ENTITY,
        payload: {
            entity: entity
        }
    })    
    
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
        .then( entity => dispatch(refreshEntity(entity)))
        .catch(console.error);
    
    // model.group.get('brash-shmoes').then(toIdMap).then( game => {
    //     clientDispatch(refreshEntity())        
    // });
}