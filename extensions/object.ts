interface ObjectConstructor {

    /**
     * Determines if the parameter is an object
     * @param o
     */
    isObject(o: any): boolean;

    /**
     * Determines if the object contains a specific method
     * @param o
     * @param m
     */
    hasMethod(o: any, m: string): boolean;

    /**
     * Determines if the object contains a specific property
     * @param o
     * @param p
     */
    hasProperty(o: any, p: string): boolean;

    /**
     * Determines if the object is a model
     * @param o
     */
    isModel(o: any): boolean;

    /**
     * Determines if the object is a model
     * @param o
     */
    isRepository(o: any): boolean;

    /**
     * Determines if the object is a HasOne relation
     * @param o
     */
    isHasOneRelation(o: any): boolean;

    /**
     * Determines if the object is a BelongsTo relation
     * @param o
     */
    isBelongsToRelation(o: any): boolean;

    /**
     * Determines if the object is a MorphMany relation
     * @param o
     */
    isMorphManyRelation(o: any): boolean;

    /**
     * Determines if the object is a MorphMany relation
     * @param o
     */
    isHasManyRelation(o: any): boolean;

    /**
     * Creates a new object from data, converting keys from snake_case to camelCase
     * @param data
     */
    createFromData(data: Dictionary<any>): Dictionary<any>;
}

Object.isObject = function (o: any) { return typeof o === "object" && null !== o;};

Object.hasMethod = function (o: any, m: string) { return Object.isObject(o) && typeof o[m] === "function";};

Object.hasProperty = function (o: any, p: string) { return Object.isObject(o) && typeof o[p] === "undefined";};

Object.isModel = function (o: any) { return Object.isObject(o) && typeof o['$is_model'] !== "undefined";};

Object.isRepository = function (o: any) { return Object.isObject(o) && typeof o['$is_repository'] !== "undefined";};

Object.isHasOneRelation = function (o: any) { return Object.isObject(o) && typeof o['$is_has_one_relation'] !== "undefined";};
Object.isBelongsToRelation = function (o: any) { return Object.isObject(o) && Object.keys(o).indexOf('$is_belongs_to_relation') !== -1;};
Object.isMorphManyRelation = function (o: any) { return Object.isObject(o) && Object.keys(o).indexOf('$is_morph_many_relation') !== -1;};
Object.isHasManyRelation = function (o: any) { return Object.isObject(o) && Object.keys(o).indexOf('$is_has_many_relation') !== -1;};

Object.createFromData = function (data: Dictionary<any>) {
    let result: Dictionary<any> = {};
    Object.keys(data).forEach(key => result[key.snakeCaseToCamelCase()] = data[key]);
    return result;
};