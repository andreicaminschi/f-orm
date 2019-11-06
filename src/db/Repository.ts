import {EloquentClass} from "../decorators";
import Model from "./Model";
import {RECORD_INFO} from "../symbols";
import IDatabaseRecord from "./IDatabaseRecord";
import Eloquent from "../config";
import {Dictionary} from "../types";
import IApiDriver from "../api/IApiDriver";

@EloquentClass
export default class Repository<T extends Model> {
    public $is_repository: boolean = true;
    protected _is_loading: boolean = false;
    get IsLoading() {return this._is_loading}
    public Items: T[] = [];

    public TotalCount: number = 0;
    get Count() {return this.Items.length}

    //region Record info
    static [RECORD_INFO](): IDatabaseRecord<Model> { throw this.$table + ".[RECORD_INFO] must be implemented in the child class"; }
    [RECORD_INFO](): IDatabaseRecord<T> { throw this.$table + ".[RECORD_INFO] must be implemented in the child class"; }
    get RecordInfo() {return this[RECORD_INFO]();}
    static get RecordInfo() {return this[RECORD_INFO]();}

    get $table() {return this.RecordInfo.Table}
    static get $table() {return this.RecordInfo.Table}
    get $primary_key() {return this.RecordInfo.PrimaryKey}
    get $namespace() {return this[RECORD_INFO]().Namespace}
    static get $namespace() {return this[RECORD_INFO]().Namespace}

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

    //region Filters
    /**
     * Filters that don't change
     */
    public $persistent_filters: Dictionary<any> = {};

    /**
     * Filters, duh
     */
    public $filters: Dictionary<any> = {};

    /**
     * Resets the filters, but not the persistent filters
     * @constructor
     */
    public ResetFilters() {
        this.$filters = {};
        return this;
    }

    public Where(field: string, operator: string | null, value: any, is_fixed_filter: boolean = false) {
        let parts = [field];
        if (operator) parts.push(operator);
        let str = parts.join('-');
        if (value !== '') is_fixed_filter ? this.$persistent_filters[str] = value : this.$filters[str] = value;
        return this;
    }

    public WhereEquals(field: string, value: any, is_fixed_filter: boolean = false) { return this.Where(field, null, value, is_fixed_filter) }
    public WhereNotEquals(field: string, value: any, is_fixed_filter: boolean = false) { return this.Where(field, 'NOTEQ', value, is_fixed_filter) }
    public WhereGreaterThan(field: string, value: any, is_fixed_filter: boolean = false) { return this.Where(field, 'GT', value, is_fixed_filter) }
    public WhereGreaterThanOrEquals(field: string, value: any, is_fixed_filter: boolean = false) { return this.Where(field, 'GTE', value, is_fixed_filter) }
    public WhereLessThan(field: string, value: any, is_fixed_filter: boolean = false) { return this.Where(field, 'LT', value, is_fixed_filter) }
    public WhereLessThanOrEquals(field: string, value: any, is_fixed_filter: boolean = false) { return this.Where(field, 'LTE', value, is_fixed_filter) }
    public WhereIsNull(field: string, is_fixed_filter: boolean = false) { return this.Where(field, 'NULL', 'null', is_fixed_filter) }
    public WhereIsNotNull(field: string, is_fixed_filter: boolean = false) { return this.Where(field, 'NOTNULL', 'null', is_fixed_filter) }
    public WhereBetween(field: string, value: any[], is_fixed_filter: boolean = false) { return this.Where(field, 'BETWEEN', value.join(','), is_fixed_filter) }
    public WhereNotBetween(field: string, value: any[], is_fixed_filter: boolean = false) { return this.Where(field, 'NOTBETWEEN', value.join(','), is_fixed_filter) }
    public WhereIn(field: string, value: any[], is_fixed_filter: boolean = false) { return this.Where(field, 'IN', value.join(','), is_fixed_filter) }
    public WhereNotIn(field: string, value: any[], is_fixed_filter: boolean = false) { return this.Where(field, 'NOTIN', value.join(','), is_fixed_filter) }
    public WhereStartsWith(field: string, value: string, is_fixed_filter: boolean = false) { return this.Where(field, 'STARTSWITH', value, is_fixed_filter) }
    public WhereEndsWith(field: string, value: string, is_fixed_filter: boolean = false) { return this.Where(field, 'ENDSWITH', value, is_fixed_filter) }
    public WhereContains(field: string, value: string, is_fixed_filter: boolean = false) { return this.Where(field, 'CONTAINS', value, is_fixed_filter) }

    public GetFilters(): Dictionary<any> {
        let result: Dictionary<any> = {
            ...this.$filters,
            ...this.$persistent_filters
        };
        if (this.$row_count) {
            if (this.$offset) result = {...result, ...{'limit': [this.$offset, this.$row_count].join(',')}}
            else result = {...result, ...{'limit': this.$row_count}}
        }
        if (Object.keys(this.$sort_by).length > 0) {
            let sort: string[] = [];
            Object.keys(this.$sort_by).forEach((column: string) => {
                let is_reverse = this.$sort_by[column];
                sort.push([column, is_reverse ? 'DESC' : 'ASC'].join(','))
            });
            result = {...result, ...{'sort-by': sort.join(';')}}
        }
        return result;
    }
    //endregion

    //region Sorting
    private $sort_by: Dictionary<any> = {};
    public ResetSort() {this.$sort_by = {};}
    public SortBy(column: string, desc: boolean) {
        this.$sort_by[column] = desc;
    }
    //endregion

    //region Pagination related.
    protected $row_count: number = 0;
    protected $offset: number = 0;
    /**
     * Skips a number of records
     * @param count
     * @constructor
     */
    public Skip(count: number) {
        this.$offset = count;
        return this;
    }

    /**
     * Limits the number of records returned
     * @param count
     * @constructor
     */
    public Take(count: number) {
        this.$row_count = count;
        return this;
    }

    /**
     * Limits the number of records returned
     * @param count
     * @constructor
     */
    public Limit(count: number) {return this.Take(count)}

    /**
     * Gets the records for the specified page
     * The page counting starts at 1
     * @param page
     * @param per_page
     * @constructor
     */
    public ForPage(page: number, per_page: number = 15) {
        this.Skip((page - 1) * per_page);
        this.Take(per_page);
        return this;
    }
    //endregion

    //region Item related methods

    /**
     * Adds a new item
     * @param item
     * @constructor
     */
    public AddItem(item: T) {
        this.Items.push(this.ConfigureItem(item));
        return this;
    }

    /**
     * Creates a new item from provided data and adds it
     * @param data
     * @constructor
     */
    public AddItemFromData(data: Dictionary<any>) {
        this.AddItem(this.RecordInfo.Make(data));
        return this;
    }

    public Load(data: Dictionary<any>[]) {
        let items = [];
        for (let row of data) {
            let item = this.RecordInfo.Make(row);
            items.push(this.ConfigureItem(item));
        }
        this.Items = items;

        return this;
    }
    //endregion

    //region Items configuration

    private $model_persistent_attributes: Dictionary<any> = {};
    /**
     * Adds an model persistent attribute
     * Persistent attributes are values that are set or overwritten when a model
     * @param key
     * @param value
     * @constructor
     */
    public AddModelPersistentAttribute(key: string, value: any) {
        this.$model_persistent_attributes = Object.assign({}, this.$model_persistent_attributes, {[key]: value});
        return this;
    }

    /**
     * Sets the persistent values for the model
     * @param model
     * @constructor
     */
    private SetModelPersistentAttributes(model: T) {
        Object.keys(this.$model_persistent_attributes).forEach((key: string) => {
            model.SetAttribute(key.snakeCaseToCamelCase(), this.$model_persistent_attributes[key])
        });
        return this;
    }

    /**
     * Configures an item
     * @param item
     * @constructor
     */
    private ConfigureItem(item: T) {
        this.SetModelPersistentAttributes(item);
        return item;
    }
    //endregion

    //region Methods

    /**
     * Gets the url on which from which the data should be retrieved
     * Is overwritten by relation decorators
     * @param args
     * @constructor
     */
    public GetUrl(...args: (string | number | undefined)[]) {
        let parts = [this.$namespace, this.$table, ...args];
        return parts.removeFalsyValues({except_types: ['number']}).join('/')
    }

    /**
     * Retrieves data from the API and loads it as models
     * @param append
     * @param extra
     * @constructor
     */
    public async Get(append?: string, extra?: Dictionary<any>) {
        this._is_loading = true;
        let r = await this.Connection.Get(this.GetUrl(append), {...this.GetFilters(), ...extra});
        this.Load(r.GetData(this.$table));
        this.TotalCount = r.GetData('count');
        this.ResetFilters();
        this._is_loading = false;
        return r;
    }

    //endregion

    //region Client side data manipulation
    /**
     * Finds the first occurrence of a record that matches the query
     * @param key
     * @param value
     * @constructor
     */
    public FindBy(key: string, value: any) { return this.Items.find((item: T) => item.GetAttribute(key) == value) }
    public FindIndexBy(key: string, value: any) { return this.Items.findIndex((item: T) => item.GetAttribute(key) == value) }
    public RemoveBy(key: string, value: any) {
        let index = this.Items.findIndex((item: T) => item.GetAttribute(key) == value)
        if (index >= 0) this.Items.splice(index, 1)
    }
    //endregion

    /**
     * Adds the item to the repository and saves it
     * @param model
     * @constructor
     */
    public async Save(model: T) {
        this.AddItem(model);
        let url = model.GetCreateEndpointUrl();
        return await model.Save();
    }
}