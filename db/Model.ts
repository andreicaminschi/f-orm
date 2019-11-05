import {EloquentClass} from "../decorators";
import {RECORD_INFO, RELATIONS} from "../symbols";
import IDatabaseRecord from "./IDatabaseRecord";
import Repository from "./Repository";
import {IApiDriver} from "../api/IApiDriver";
import Eloquent from "../config";

@EloquentClass
export default class Model {
    $is_model: boolean = true;
    _is_new: boolean = true;
    /**
     * Determines if the model is newly created.
     * @constructor
     */
    get IsNew() {return this._is_new;}
    [key: string]: any;

    constructor(data?: Dictionary<any>) {
    }
    /**
     * Creates a new instance
     * @constructor
     */

    //region Record info
    static [RECORD_INFO](): IDatabaseRecord<Model> { throw  this.$name + ".[RECORD_INFO] must be implemented in the child class"; }
    [RECORD_INFO](): IDatabaseRecord<Model> { throw this.$name + ".[RECORD_INFO] must be implemented in the child class"; }
    get RecordInfo() {return this[RECORD_INFO]();}
    static get RecordInfo() {return this[RECORD_INFO]();}

    get $name() {return this[RECORD_INFO]().Name}
    static get $name() {return this[RECORD_INFO]().Name}
    get $namespace() {return this[RECORD_INFO]().Namespace}
    static get $namespace() {return this[RECORD_INFO]().Namespace}

    get $table() {return this[RECORD_INFO]().Table}
    get $primary_key() {return this[RECORD_INFO]().PrimaryKey}
    static Make() { return this[RECORD_INFO]().Make(); }
    //endregion

    // region RELATIONS
    protected _relations: Dictionary<any> = {};
    public SetRelationValue(key: string, value: Model | Repository<Model>) { this._relations = Object.assign({}, this._relations, {[key]: value}); }
    public GetRelationValue(key: string) { return this._relations[key]; }
    static [RELATIONS](): Dictionary<any> { throw  this.$name + ".[RELATIONS] must be implemented in the child class"; }
    [RELATIONS](): Dictionary<any> { throw this.$name + ".[RELATIONS] must be implemented in the child class"; }
    get Relations() {return this[RELATIONS]();}
    static get Relations() {return this[RELATIONS]();}
    //endregion


    //region Connection
    /**
     * The connection to be used when saving or loading the model
     */
    protected $connection?: IApiDriver;
    /**
     * Gets the connection to be used when saving or loading the model.
     * If no connection is specified the default connection is used
     * @constructor
     */
    get Connection() { return this.$connection ? this.$connection : Eloquent.GetDefaultApiDriver()}
    //endregion

    //region Original attributes
    /**
     * Original attributes
     * These are updated when the model is saved or loaded
     */
    private $original_attributes: Dictionary<any> = {};

    /**
     * Gets the original value of an attribute
     * Returns undefined if the attribute doesn't have an original value
     * @param key
     * @constructor
     */
    GetOriginalAttribute(key: string) {return this.$original_attributes[key];}

    /**
     * Sets the original value of an attribute
     * @param key
     * @param value
     * @constructor
     */
    private SetOriginalAttribute(key: string, value: any) {
        this.$original_attributes[key] = value;
        return this;
    }

    /**
     * Loads the original attributes
     * Loops though all the public properties of the class and saves the values
     * @constructor
     */
    LoadOriginalAttributes() {
        Object.keys(this).forEach((key: string) => {
            if (key.indexOf('_') === 0) return;
            this.SetOriginalAttribute(key, this.GetAttribute(key))
        })
        return this;
    }

    RestoreOriginalAttributes() {
        Object.keys(this.$original_attributes).forEach((key: string) => {
            this.SetAttribute(key, this.GetOriginalAttribute(key));
        })

    }

    //endregion

    //region Attributes
    /**
     * Gets the value of an attribute
     * @param key
     * @constructor
     */
    GetAttribute(key: string) {return this[key]}

    /**
     * Sets the value of an attribute
     * @param key
     * @param value
     * @constructor
     */
    SetAttribute(key: string, value: any) {
        this[key] = value;
        return this;
    }

    /**
     * Loads the attributes from the given dictionary
     * The keys of the dictionary are transformed from snake_case to CamelCase
     * If the parameter is numeric then the primary key of the model is set to that value
     * @param data
     * @constructor
     */
    Load(data: Dictionary<any> | number) {
        this._is_new = false;
        if (typeof data === "number" || typeof data === 'string') {
            this.SetAttribute(this.$primary_key, data);
            return this;
        }

        let current_attribute_value: any,
            new_attribute_value: any;
        for (let key in data) {
            current_attribute_value = this.GetAttribute(key.snakeCaseToCamelCase());
            new_attribute_value = data[key];


            if (Object.isModel(current_attribute_value)) {
                (<Model>current_attribute_value).Load(new_attribute_value);
                continue;
            } else if (Object.isRepository(current_attribute_value)) {
                (<Repository<any>>current_attribute_value).Load(new_attribute_value);
                continue;
            } else if (this.RecordInfo.Relations[key.snakeCaseToCamelCase()] === 'has-one') {
                this[key.snakeCaseToCamelCase()]().Load(new_attribute_value);
                continue;
            } else if (this.RecordInfo.Relations[key.snakeCaseToCamelCase()] === 'belongs-to') {
                this[key.snakeCaseToCamelCase()]().Load(new_attribute_value);
                continue;
            } else if (this.RecordInfo.Relations[key.snakeCaseToCamelCase()] === 'has-many') {
                this[key.snakeCaseToCamelCase()]().Load(new_attribute_value);
                continue;
            } else if (this.RecordInfo.Relations[key.snakeCaseToCamelCase()] === 'has-many-though') {
                this[key.snakeCaseToCamelCase()]().Load(new_attribute_value);
                continue;
            }

            this.LoadOriginalAttributes();

            this.SetAttribute(key.snakeCaseToCamelCase(), new_attribute_value);
        }
    }

    /**
     * Checks if an attribute is changed
     * @param key
     * @constructor
     */
    HasAttributeChanged(key: string) {return this.GetAttribute(key) != this.GetOriginalAttribute(key);}

    /**
     * Gets the attributes that are changed
     * @constructor
     */
    GetChangedAttributes() {
        let result: Dictionary<any> = {};
        Object.keys(this.$original_attributes).forEach((key: string) => { if (this.HasAttributeChanged(key)) result[key.camelCaseToSnakeCase()] = this.GetAttribute(key); })
        // getting the data from has-many and has-many-though _relations
        // extract the ids and send them
        Object.keys(this.RecordInfo.Relations).forEach((key: string) => {
            if (['has-many', 'has-many-though'].indexOf(this.RecordInfo.Relations[key]) >= 0) {
                let value = this.GetRelationValue(key);
                if (!value) return;
                let data: number[] = (<Repository<Model>>value).Items.map((item: Model) => item[item.$primary_key]);
                if (data.length) result[key.camelCaseToSnakeCase()] = data;
            }
        });

        return result;
    }

    /**
     * Checks if the model has changed
     * Does not check if anything changed in the relations
     * @constructor
     */
    public HasChanged() {
        for (let key of Object.keys(this.$original_attributes)) {
            if (this.HasAttributeChanged(key)) return true;
        }
        return false;
    }
    //endregion

    //region Validation errors
    private _errors: Dictionary<any> = {};
    private LoadValidationErrors(errors: Dictionary<any>) {
        this.ResetValidationErrors();
        Object.keys(errors).forEach((key: string) => {this.AddValidationError(key.snakeCaseToCamelCase(), errors[key])});
    }
    public AddValidationError(field: string, error: string) {this._errors[field] = error}
    public RemoveValidationError(field: string) {delete this._errors[field]}
    public ResetValidationErrors() {this._errors = {}}
    get ValidationErrors() { return this._errors;}
    //endregion

    //region Methods
    public GetUrl(...args: (string | number)[]) {
        let parts = [this.$namespace, this.$name, ...args];
        return parts.filter((a) => {
            if (typeof a === "number") return true;
            return !!a;
        }).join('/')
    }
    /**
     * Gets or refreshes the information of the model
     * @constructor
     */
    async Get(extra?: Dictionary<any>) {
        this._is_loading = true;
        let url = this.GetUrl(this.GetAttribute(this.$primary_key));
        let r = await this.Connection.Get(url, extra);
        this._is_loading = false;
        this.Load(r.GetData(this.$name));
    }

    private get CreateEndpoint() {return this.GetUrl()}
    private get PatchEndpoint() {return this.GetUrl(this.GetAttribute(this.$primary_key))}

    private _is_loading: boolean = false;
    get IsLoading() {return this._is_loading}

    /**
     * Saves the model
     * @constructor
     */
    async Save(extra?: Dictionary<any>) {
        this._is_loading = true;
        let url = this.IsNew ? this.CreateEndpoint : this.PatchEndpoint;
        let attributes = {...this.GetChangedAttributes(), ...extra};
        let r = this.IsNew
            ? await this.Connection.Post(url, attributes)
            : await this.Connection.Patch(url, attributes);

        if (r.IsSuccessful()) {
            this.Load(r.GetData(this.$name));
            this.ResetValidationErrors();
        } else {
            this.LoadValidationErrors(r.GetValidationErrors());
        }
        this._is_loading = false;
        return r;
    }

    async Delete(extra?: Dictionary<any>) {
        this._is_loading = true;
        let r = await this.Connection.Delete(this.PatchEndpoint, extra)
        this._is_loading = false
        return r;
    }
    //endregion


}