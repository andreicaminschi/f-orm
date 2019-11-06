import {Dictionary} from "../../types";
import IApiResponse from "./IApiResponse";

export default interface IApiDriver {
    SetToken(token: string): this;

    RemoveToken(): this;

    Get(endpoint: string, data?: Dictionary<any>): Promise<IApiResponse>;

    Post(endpoint: string, data?: Dictionary<any>): Promise<IApiResponse>;

    Patch(endpoint: string, data?: Dictionary<any>): Promise<IApiResponse>;

    Delete(endpoint: string, data?: Dictionary<any>): Promise<IApiResponse>;

    SetOnErrorHandler(handler: (r: IApiResponse) => void): this;
}