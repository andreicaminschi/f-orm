import Model from "./db/Model";
import Repository from "./db/Repository";

/**
 * Hides any property that starts with $
 * @param constructor
 * @constructor
 */
export function EloquentClass<T extends { new(...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
        constructor(...args: any[]) {
            super(...args);
            // hiding $
            Object.keys(this).forEach((key: string) => {
                if (key.indexOf('$') === 0) Object.defineProperty(this, key, {enumerable: false, configurable: true})
            })
        }
    }
}


export function HasOne(local_key?: string, foreign_key?: string) {
    return function (target: Model, key: string, descriptor: PropertyDescriptor) {
        target.RecordInfo.Relations[key] = 'has-one';

        let original_value = descriptor.value;
        descriptor.enumerable = false;
        descriptor.value = function (this: Model) {
            let r = this.GetRelationValue(key);
            if (!r) {
                r = original_value();
                if (!Object.isModel(r)) throw "Return value of a method decorated as a HasOne relation must be an instance of a model";
                this.SetRelationValue(key, r);
            }
            let lk = local_key || 'id';
            let fk = foreign_key || r.RecordInfo.Name + '_id';
            r.SetAttribute(fk.snakeCaseToCamelCase(), this.GetAttribute(lk.snakeCaseToCamelCase()));
            return r;
        };
        return descriptor;
    }
}

export function BelongsTo(local_key?: string, foreign_key?: string) {
    return function (target: Model, key: string, descriptor: PropertyDescriptor) {
        target.RecordInfo.Relations[key] = 'belongs-to';

        let original_value = descriptor.value;
        descriptor.enumerable = false;
        descriptor.value = function (this: Model) {
            let r = this.GetRelationValue(key);
            if (!r) {
                r = original_value();
                if (!Object.isModel(r)) throw "Return value of a method decorated as a BelongsTo relation must be an instance of a model";
                this.SetRelationValue(key, r);
            }
            let lk = local_key || r.RecordInfo.Name + '_id';
            let fk = foreign_key || 'id';
            r.SetAttribute(fk.snakeCaseToCamelCase(), this.GetAttribute(lk.snakeCaseToCamelCase()));
            return r;

        };
        return descriptor;
    }
}

export function HasMany(local_key?: string, foreign_key?: string) {
    return function (target: Model, key: string, descriptor: PropertyDescriptor) {
        target.RecordInfo.Relations[key] = 'has-many';
        let original_value = descriptor.value;
        descriptor.enumerable = false;

        descriptor.value = function (this: Model) {
            let r: Repository<Model> = this.GetRelationValue(key);
            if (!r) {
                r = original_value();
                if (!Object.isRepository(r)) throw "Return value of a method decorated as a HasMany relation must be an instance of a repository";
                this.SetRelationValue(key, r);
            }

            let lk = local_key || 'id';
            let fk = foreign_key || this.RecordInfo.Name + '_id';
            r.WhereEquals(fk, this.GetAttribute(lk.snakeCaseToCamelCase()), true);
            r.AddModelPersistentAttribute(fk, this.GetAttribute(lk.snakeCaseToCamelCase()));
            return r;

        };
        return descriptor;
    }
}

export function HasManyThrough(type: string, local_key?: string, foreign_key?: string) {
    return function (target: Model, key: string, descriptor: PropertyDescriptor) {
        target.RecordInfo.Relations[key] = 'has-many-though';
        let original_value = descriptor.value;
        descriptor.enumerable = false;

        descriptor.value = function (this: Model) {
            let r: Repository<Model> = this.GetRelationValue(key);
            if (!r) {
                r = original_value();
                if (!Object.isRepository(r)) throw "Return value of a method decorated as a HasMany relation must be an instance of a repository";
                r.WhereEquals('type', type, true);
                this.SetRelationValue(key, r);
            }

            let lk = local_key || 'id';
            let fk = foreign_key || this.RecordInfo.Name + '_id';
            r.WhereEquals(fk, this.GetAttribute(lk.snakeCaseToCamelCase()), true);
            r.AddModelPersistentAttribute(fk, this.GetAttribute(lk.snakeCaseToCamelCase()));
            r.AddModelPersistentAttribute('type', type);
            return r;

        };
        return descriptor;
    }
}