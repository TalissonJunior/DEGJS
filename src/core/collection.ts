export class Collection {
    name: string;
    properties: Array<string>;

    constructor(name: string, properties: Array<string>) {

        if(!(typeof  name == 'string')) {
            throw `First collection argument "${name}" must be of type "string"`;
        }

        if(!(Array.isArray(properties))) {
            throw `Second collection argument "${properties}" must be of type "Array"`;
        }

        this.name = name;
        this.properties = properties;
    }
}