// SERVER-ONLY LIBRARIES
import { Persistable,
         Persister, 
         Field,
         LinkField,
         FieldValuePair,
         Link }              from            '../design.server';
import { GremlinConnection } from './gremlin-connection.server';
//import { BoundParameters }   from   './bound-parameters.server';
import { Promise }           from '../../utils/promises.server';


// SHARED LIBRARIES
// none

export class GremlinPersister implements Persister {
    
    constructor(
        private gremlin :GremlinConnection
    ) {}
    
    public persist(
        group      :string, 
        properties :FieldValuePair[]
    ) :Promise<Persistable> {
        
        let params = { bp_label: group };
        let bp_list = [];
        
        
        properties.forEach((property : FieldValuePair)=>{
            let key = property.getPropertyKey();
            params[key] = property.getValue();
            bp_list.push(`'${key}',${key}`)
        });
        
        let paramListString :string = bp_list.join(',');
        
        let query :string = `
            graph.addVertex(
                label, bp_label,
                ${paramListString}
            )
        `;
        
        return this.gremlin.execute(query, params)
            .then(GremlinPersister.FirstResult)
            .then(GremlinPersister.VertexToPersistable);  
    }
    
    public remove(p :Persistable) : Promise<void> {
        let query:string = `g.V(bp_id).drop()`
        return this.gremlin.execute(query, {
            bp_id : p.getPersistenceKey()
        });
    }
    
    public update(
        p       :Persistable, 
        changes :FieldValuePair[]
    ) :Promise<Persistable> {
        let query:string = `g.V(bp_id).haslabel(bp_label)`;
        let params:Object = {}
        changes.forEach((change)=>{
           let key = change.getPropertyKey();
           query += `.property('${key}',bp_${key})`;
           params['bp_'+key] = change.getValue();
        });
        return this.gremlin.execute(query, params).then((changeResults)=>{
            console.log(changeResults);
        }); //TODO
    }
    
    public relate(link :Link, p1 :Persistable, p2 :Persistable) :Promise<void> {
        let query :string = `
            v_1 = g.V(bp_id_1).hasLabel(bp_label_1).next();
            v_2 = g.V(bp_id_2).hasLabel(bp_label_2).next();
            v_1.addEdge(bp_edge_label, v_2);
        `;
        return this.gremlin.execute(query, {
            bp_id_1       : p1.getPersistenceKey(),
            bp_label_1    : p1.getPersistenceGroup(),
            bp_id_2       : p2.getPersistenceKey(),
            bp_label_2    : p2.getPersistenceGroup(),
            bp_edge_label : GremlinPersister.LinkToEdgeLabel(link)
        });
    }
    
    public unrelate(link :Link, p1 :Persistable, p2 :Persistable) :Promise<void> {
        let query :string = `
            v_2 = g.V(bp_id_2).hasLabel(bp_label_2).next();
            g.V(bp_id_1)
              .hasLabel(bp_label_1)
              .outE(bp_edge_label)
              .as('e')
              .inV()
              .where(__.is(v_2))
              .select('e')
              .drop();
        `;
        return this.gremlin.execute(query, {
            bp_id_1       : p1.getPersistenceKey(),
            bp_label_1    : p1.getPersistenceGroup(),
            bp_id_2       : p2.getPersistenceKey(),
            bp_label_2    : p2.getPersistenceGroup(),
            bp_edge_label : GremlinPersister.LinkToEdgeLabel(link)
        });
    }
    
    public traverse(
        p         :Persistable, 
        selection :Field[]
    ) :Promise<Array<Persistable>> {
        let query:string = `g.V(bp_id).haslabel(bp_label).valueMap(true)`;
        return this.gremlin.execute(query, {
            bp_id    : p.getPersistenceKey(),
            bp_label : p.getPersistenceGroup()
        }).then((results) => {
           return results;  // TODO: probably do more here. 
        });
    }
    
    ///////////////////////// UTILITY METHODS //////////////////////////////////
    
 
    
    public static LinkToEdgeLabel(link :Link) {
        return link.getLinkParentGroup()
             + '.' + link.getLinkParentField()
             + ':' 
             + (link.getLinkParentIsMany() ? 'MANY' : 'ONE')
             + '--'
             + (link.getLinkChildIsMany() ? 'MANY' : 'ONE')
             + ':'
             + link.getLinkChildGroup()
             + '.' + link.getLinkChildField();
    }
    
    public drop() :Promise<void> {
        return this.gremlin.execute('g.V().drop()');
    }
    
    public directQuery(query :string, params? :Object) :Promise<any> {
        return this.gremlin.execute(query, params);
    }
    
    private static VertexToPersistable(v :Vertex) {
        let key = v.id.toString();
        let label = v.label;
        delete v.id;
        delete v.label;
        Object.defineProperty(v, 'getPersistenceGroup', { value:() => label });
        Object.defineProperty(v, 'getPersistenceKey', { value:() => key });
        return v;
    }
    
    private static FirstResult(results :Vertex[]) :Vertex {
        return results[0];
    }
    
    public static Factorify(library :Object, methodKeys :string[]) :Object {
        var outLib = {};
        methodKeys.forEach((methodKey) => {
            outLib[methodKey] = function() {
               let args = arguments;
               return () => {
                   return library[methodKey].apply(library, args);
               }
           }    
        });
        return outLib;
    }
    
    public factorify() {
        return GremlinPersister.Factorify(this, ['drop', 'persist', 'relate']);
    }
    
    
}

interface Vertex {
    id    :number;
    label :string;
}