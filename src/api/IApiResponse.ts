import {Dictionary} from "../types";

export default interface IApiResponse {
    IsSuccessful(): boolean;

    HasData(key: string): boolean;

    GetData(key: string): any;

    GetError(): string;

    GetValidationErrors(): Dictionary<any>;
}
