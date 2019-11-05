import {IApiResponse} from "./IApiResponse";
import {Dictionary} from "../types";

export interface IApiDriver {
    SetToken(token: string): this;

    RemoveToken(): this;

    Get(endpoint: string, data?: Dictionary<any>): Promise<IApiResponse>;

    Post(endpoint: string, data?: Dictionary<any>): Promise<IApiResponse>;

    Patch(endpoint: string, data?: Dictionary<any>): Promise<IApiResponse>;

    Delete(endpoint: string, data?: Dictionary<any>): Promise<IApiResponse>;

    SetOnErrorHandler(handler: (r: IApiResponse) => void): this;
}
