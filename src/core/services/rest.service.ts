import { CONFIG } from "../../config/config";
import { BehaviorSubject } from 'rxjs';

export class RestService {
    private url: string;
    public isConnected = new BehaviorSubject<boolean>(false);

    constructor(url: string) {
        this.url = url;
    }

    private _showDefaultErrorMessage(): void {
        throw `DEGJS: Failed to connect to the serverDomain ${this.url}, make sure that you serverDomain is running...`;
    }

    protected async testConnection(): Promise<boolean> {
        try {
            console.log("DEGJS: Testing connection...");

            await this.serviceGetAllCollections();
            this.isConnected.next(true);

            console.log("DEGJS: Connected!");

            return true;
        }
        catch(exception) {
            this.isConnected.next(false);
            
            this._showDefaultErrorMessage();
        }
    }

    protected serviceGetAllCollections(): Promise<any> {

        var request = new Request(`${this.url}/${CONFIG.urlSuffix.base}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                "Content-Type": "application/json; charset=utf-8"
            }
        });

        return fetch(request).then((response) => {
            this.isConnected.next(true);
            return response.json();
        })
        .then(data => JSON.parse(data))
        .catch((error) => {
            this.isConnected.next(false);
            return error;
        });
    }

    protected serviceGetData(models: Array<any>): Promise<any> {

        var request = new Request(`${this.url}/${CONFIG.urlSuffix.base}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify(models)
        });

        return fetch(request).then((response) => {
            return response.json();
        })
        .catch((error) => {
            return error;
        });
    }
}