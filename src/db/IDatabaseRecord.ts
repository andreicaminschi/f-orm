import Model from "./Model";
import {Dictionary} from "../../types";

export default interface IDatabaseRecord<T extends Model> {
    readonly Name: string;
    readonly Table: string;
    readonly PrimaryKey: string;
    readonly Relations: Dictionary<any>;
    readonly Namespace: string;

    // readonly Repository: IRepository<T>;

    Make(data?: Dictionary<any>): T;

}