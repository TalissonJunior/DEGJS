import { DEGOptions } from "./models/DEGOptions";
import { Collection } from "./core/collection";
import { RestService } from "./core/services/rest.service";
import { BehaviorSubject } from "rxjs";
const levenshtein = require('js-levenshtein');

class App extends RestService {
    options: DEGOptions;
    _collections: Array<Collection>;
    _serverCollections: Array<any>;
    _hasCollections = new BehaviorSubject<boolean>(false);
    _hasProcess = new BehaviorSubject<boolean>(false);

    constructor(options: DEGOptions) {
        super(options.serverDomain);

        this.options = options;

        this._validateOptions();
    }

    private _validateOptions(): void {
        if(!this.options || !this.options.serverDomain) {
            throw "Invalid Options, { serverDomain: null }";
        }

        if(
            this.options.serverDomain.indexOf('http') < 0 ||
            this.options.serverDomain.indexOf('https') < 0
        )
        {
            throw `Invalid Options, \n { serverDomain: ${this.options.serverDomain} } \n must be a valid server url ex: "http://yourdomain.com"`;
        }
        
        this.testConnection();

        // Call get collections to cache some collections
        this.collections();
    }

    private _getSimiliarCollection(collectionNameToCompare: string): Collection | Array<Collection> {
        let minimumDistance = 25;
        let maxSimilarChars = 1;
        let similarCollection;
        const similiarCollections = [];

        const similarCharsCount = (value: string, valueToCompare: string) => {
            let count = 0;

            for (const char of value) {
                if(valueToCompare.indexOf(char) > -1) {
                    count++;
                }
            }

            if(valueToCompare.toLowerCase().indexOf(value.toLowerCase()) > -1) {
                return count;
            }

            return 0;
        };

        for (const cachedCollection of this._collections) {
            var distance = levenshtein(
                collectionNameToCompare, 
                cachedCollection.name
            );

            var similarChars = similarCharsCount(
                collectionNameToCompare,
                cachedCollection.name
            );
            
            if(distance <= minimumDistance && similarChars >= maxSimilarChars) {

                if((similarChars >= maxSimilarChars) && similarCollection) {
                    similiarCollections.push(cachedCollection);
                }
                
                similarCollection = cachedCollection;
                maxSimilarChars = similarChars;
            }
        }

        return similiarCollections.length > 1 ? similiarCollections : similarCollection;
    }

    // This will return the current collections and format then
    private _getCollectionsFormatted(): Promise<Array<String>> {
        return this.serviceGetAllCollections()
            .then(snap => {
                if(snap.data) {
                    this._serverCollections = snap.data;
                    this._collections =  new Array<Collection>();

                    for (const val of snap.data) {
                        const collection = new Collection(
                            val.Name, 
                            val.Properties.map((p: any) => p.Name)
                        );

                        this._collections.push(collection);
                    }
                    
                    if(this._collections.length > 0) {
                        this._hasCollections.next(true);
                    }

                    return this._collections.map(c => c.name);
                }   

                return [];
            })  
            .catch(error => error);
    }

    private _validateCollections(collections: Array<Collection>): Array<any> {
          const validCollections = [];

          // Validate 
          for (let index = 0; index < collections.length; index++) {
            const collection = collections[index];
              
            var found = this._collections.find(c => c.name.toLowerCase() == collection.name.toLowerCase());

            if(!found) {
                // if didn´t found then try to get similar collection 
                // in order to guid user (for a better experience)
                var similiarCollection = this._getSimiliarCollection(collection.name);

                if(similiarCollection){
                    var similiarCollections = (similiarCollection instanceof Array) ? similiarCollection.map(s => s.name).join(',') : similiarCollection.name;
                    throw `Invalid collection name "${collection.name}" similiar options: "${similiarCollections}"`;
                }
                else {
                    throw `Invalid collection name "${collection.name}", use the "collections()" function to know the available collections`;
                }
            }
            else {
                for (let index = 0; index < collection.properties.length; index++) {
                    const property = collection.properties[index];
                    
                    var foundProperty = found.properties.find(p => p.toLowerCase() == property.toLowerCase());

                    if(!foundProperty) {
                        throw `Invalid property "${property}" for collection "${collection.name}", available properties "${found.properties.join(',')}"`;
                    }
                }

                var validCollection = this._serverCollections.find(sc => sc.Name == found.name);

                if(validCollection) {
                    validCollection.Properties = validCollection
                        .Properties
                        .filter((p: any) => 
                            collection.properties.includes(p.Name));

                    validCollections.push(validCollection);
                }
            }

        }
        
        return validCollections;
    }

    // Get all availlable collections
    public async collections(): Promise<any> {
        if(this._hasCollections.getValue()) {
            return this._collections;
        }
        else {
            if(this.isConnected.getValue()) {
                return await this._getCollectionsFormatted();
            }
            else {
                return new Promise((resolve, reject) => {
                    const obs = this.isConnected.subscribe((connected) => {
                        if(connected) {
                            this._getCollectionsFormatted()
                                .then(snap => resolve(snap))
                                .catch(error => reject(error));                       
                        }
    
                        if(obs) {
                           obs.unsubscribe();
                        }
                    });
                });
            }
        }
    }

    public process(...collections: Array<Collection>) {

        const execute = async () => {
            const validCollections = this._validateCollections(collections);
            console.log(validCollections);
            await this.serviceGetData(validCollections);
            this._hasProcess.next(true);
        };
       
        if(this._hasCollections.getValue()) {
            execute();
        }
        else {
            this._hasCollections.subscribe((hasCollection) => {

                if(hasCollection) {
                    execute();
                }
            });
        }
    }

    public export() {
        if(this._hasProcess.getValue()) {
            console.log("export");
        }
        else {
            this._hasProcess.subscribe((hasProcess) => {

                if(hasProcess) {
                    console.log("export");
                }
            });
        }
       
    }

    public data() {
        return {
            collection: (
                name: string, 
                properties: Array<string>
            ) => new Collection(name, properties)
        };
    }

}

export const init = (options: DEGOptions): App => new App(options);