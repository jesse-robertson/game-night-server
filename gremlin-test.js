const logEnd = (x) => {
    console.log(x);
    process.exit();
};

const log = (x) => {console.log(x); return x;} 

const gremlin = require('gremlin');

const host = 'db.4f150e79.svc.dockerapp.io';

const client = gremlin.createClient(8182, host);

const grem = (query) => new Promise( (resolve) => 
    client.execute(
        query.template, 
        query.params, 
        (err, results) => {
            if (err) throw new Error(err);
            resolve(results);
        }
    )
);

const dropProp = (k) => (o) => {
    const clone = Object.assign({}, o);
    delete clone[k];
    return clone;
}

const delist = (a) => {
    if (typeof a === 'string') return a;
    return a[0] || a;
} 

const stamp =  (a,e) => Object.assign(a,e);
    
const keyMap = (f) => (o) => Object.keys(o).map( 
    (k) => ({ 
        [f(k)] : o[k] 
    }) 
).reduce(stamp, {});

const valueMap = (f) => (o) => Object.keys(o).map( 
    (k) => ({ 
        [k] : f(o[k]) 
    }) 
).reduce(stamp, {});

const toKvb = (o) => Object.keys(o).map( (k) => ({
    key: k,
    value: o[k],
    binding: `_${k}`    
}));
    
const toKeyBindPair = (kvb) => `${kvb.key},${kvb.binding}`;

const toBindValueMap = (kvb) => ({[kvb.binding] : kvb.value});  

const kvbStripKey = (key) => (kvbList) => kvbList.filter( (kvb) => 
    !(key === kvb.key) 
);

const kvbStripId = kvbStripKey('id');
const kvbStripLabel = kvbStripKey('label');

const quoteNonLabelKeys = (kvbList) => kvbList.map( 
    (kvb) => ({
        key: ('label'===kvb.key) ? 'label' : `"${kvb.key}"`, 
        value: kvb.value,
        binding: kvb.binding
    })
);

const kvbJoin = (kvbList) => 
    kvbList.map(toKeyBindPair).join(',')

const kvbListToSaveQuery = (kvbList) => ({
    template: `g.addV(${kvbJoin(kvbList)}).valueMap(true)`,
    params: kvbList.map(toBindValueMap).reduce(stamp, {})
});

const querySingleVertex = (id, label) => 
    `g.V(${id}).hasLabel(${label})`;
    
const requireIdAndLabel = (o) => {
    if (o && o.id && o.label) return o;
    throw new Error('id and label fields are required');
};
    
const pipeline = function() {
    // coerce 'arguments' into an array
    const stages = [].slice.call(arguments);
    
    // Allow stages to be regular functions or promise factories
    const invokeOrThen = (x, f) => (x.then ? x.then(f) : f(x))
     
    // Return composite function  
    return (x) => stages.reduce(invokeOrThen, x);
};  

const saveQuery = pipeline(
    toKvb, 
    kvbStripId,
    quoteNonLabelKeys,
    kvbListToSaveQuery 
);

const loadQuery = (o) => ({
    template: `${querySingleVertex('_id', '_label')}.valueMap(true)`,
    params: {
        _id: o.id,
        _label: o.label || 'vertex'   
    }
});

const dropQuery = (o) => ({
    template: `${querySingleVertex('_id', '_label')}.drop()`,
    params: {
        _id: o.id,
        _label: o.label || 'vertex'
    }
});


const delistObjectProperties = valueMap(delist);
////////////////    

const save = pipeline(
    saveQuery, 
    grem, 
    delist, 
    delistObjectProperties
);
    
const load = pipeline(
    loadQuery, 
    grem, 
    delist, 
    delistObjectProperties
);
    
const drop = (o) => pipeline(
    requireIdAndLabel, 
    dropQuery, 
    grem, 
    () => 0, 
    dropProp('id')
)(o)
   
  
//////////

const jesse = {
    label: 'person',
    firstName: 'Jesse',
    lastName: 'Robertson',
    age: 26,
    isMarried: true
};

const vcount = () => grem({ template: 'g.V().count()'}).then(delist);

const passiveVcount = (x) => vcount().then(log).then(()=>x);

var j;

pipeline(save, log, load, log, passiveVcount, x => {
        j = x;
        return x;
    }, drop, log, ()=>load(j), passiveVcount, logEnd)({a: 1, b:'foo', c:true, label:'cool'}).catch(logEnd);
// save(jesse)
//     .then(log)
//     .then(load)
//     .then(log)
//     .then(passiveVcount)
//     .then( )
//     .then(drop)
//     .then(log)
//     .then( () => load(j))
//     .then(passiveVcount)
//     .then(logEnd)
//     .catch(logEnd);
    
  
    
//drop().then(passiveVcount).then(logEnd);

//load({id: 1}).then(logEnd).catch(logEnd);

// grem({
//     template: `g.V().valueMap(true)`
// }).then((results)=>results.map(valueMap(delist)))