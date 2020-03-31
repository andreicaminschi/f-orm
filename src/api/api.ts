import IApiResponse from "./IApiResponse";
import {Dictionary} from "../types";
import IApiDriver from "./IApiDriver";

const axios = require('axios');

export class ApiResponse implements IApiResponse {
    private readonly success: boolean;
    private readonly data: Dictionary<any>;
    private readonly error: Dictionary<any>;
    private readonly validationErrors: Dictionary<any>;

    constructor(response: Dictionary<any>) {
        this.success = response.success || false;
        this.data = response.data || {};
        this.error = Object.createFromData(response.error || {});
        this.validationErrors = Object.createFromData(response['validation-errors'] || {});
    }

    IsSuccessful(): boolean { return this.success }
    GetData(key: string): any {return this.data[key] }
    GetError(): string { return this.error.Text || '';}
    HasData(key: string): boolean { return typeof this.data[key] !== "undefined"}
    GetValidationErrors(): Dictionary<any> { return this.validationErrors; }
}

export class ApiDriver implements IApiDriver {
    private token: string = '';
    public SetToken(token: string): this {
        this.token = token;
        return this;
    }

    RemoveToken(): this {
        this.token = '';
        return this;
    }


    private base_endpoint: string = '';
    public SetBaseEndpoint(uri: string): this {
        this.base_endpoint = uri;
        return this;
    }

    private version: string = '';
    public SetVersion(version: string) {
        this.version = version;
        return this;
    }


    constructor(base_endpoint?: string, version?: string) {
        if (base_endpoint) this.SetBaseEndpoint(base_endpoint);
        if (version) this.SetVersion(version);
    }

    //region Handlers
    private $onErrorHandler?: (r: IApiResponse) => void;
    public SetOnErrorHandler(handler: (r: IApiResponse) => void) {
        this.$onErrorHandler = handler;
        return this;
    }

    public HasErrorHandler() {return typeof this.$onErrorHandler !== "undefined"}
    //endregion

    private get EndpointRoot(): string {return [this.base_endpoint, this.version].join('/');}

    private GetEndpointUrl(endpoint: string) {return [this.EndpointRoot, endpoint].join('/');}

    private GetHeaders() {
        return {"Authorization": "Bearer " + this.token}
    }

    private HandlePromise(p: Promise<any>): Promise<IApiResponse> {
        return p
            .then((r: Dictionary<any>) => {
                const response = new ApiResponse(r.data);
                if (!response.IsSuccessful() && this.$onErrorHandler) this.$onErrorHandler(response);
                return response;
            })
            .catch(() => {
                console.log('Internal!!');
                let response = new ApiResponse({data: {success: false, error: {code: 'E-SERVER-ERROR', text: 'Something happened'}}});
                if (this.$onErrorHandler) this.$onErrorHandler(response);
                return response;
            });

    }

    public Get(endpoint: string, data?: FormData | Dictionary<any>, config?: Dictionary<any>) {
        let c: Dictionary<any> = {
            ...(config || {}),
            ...{
                params: data,
                headers: this.GetHeaders()
            }
        };
        let p = axios.get(this.GetEndpointUrl(endpoint), c);
        return this.HandlePromise(p);
    }

    public async Post(endpoint: string, data?: FormData | Dictionary<any>, config?: Dictionary<any>) {
        let c: Dictionary<any> = {
            ...(config || {}),
            ...{
                headers: this.GetHeaders()
            }
        };
        let p = axios.post(this.GetEndpointUrl(endpoint), data instanceof FormData ? data : this.ConvertObjectToFormData(data || {}),c);
        return await this.HandlePromise(p);
    }

    public async Patch(endpoint: string, data?: FormData | Dictionary<any>, config?: Dictionary<any>) {
        let c: Dictionary<any> = {
            ...(config || {}),
            ...{
                headers: this.GetHeaders()
            }
        };
        let p = axios.patch(this.GetEndpointUrl(endpoint), data instanceof FormData ? data : this.ConvertObjectToFormData(data || {}),c);
        return await this.HandlePromise(p);
    }

    public async Delete(endpoint: string, data?: FormData | Dictionary<any>, config?: Dictionary<any>) {
        let c: Dictionary<any> = {
            ...(config || {}),
            ...{
                params: data instanceof FormData ? data : this.ConvertObjectToFormData(data || {}),
                headers: this.GetHeaders()
            }
        };
        let p = axios.delete(this.GetEndpointUrl(endpoint), c);
        return await this.HandlePromise(p);
    }

    private ConvertObjectToFormData(object: Dictionary<any>) {
        const formData = new FormData();
        Object.keys(object).forEach(key => formData.append(key, object[key]));
        return formData;
    }
}
