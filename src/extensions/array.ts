interface Array<T> {
    contains(field: any): boolean;

    sum(field: string): number;

    removeFalsyValues(options: { except_types?: string[] }): T[]
}

Array.prototype.contains = function (field: any) {
    return this.indexOf(field) > -1;
};
Array.prototype.sum = function (field: string) {
    return this.map(item => item[field]).reduce((t, v) => t + v, 0);
};

Array.prototype.removeFalsyValues = function (options?: { except_types?: string[] }) {
    let except = options ? options.except_types || [] : [];
    return this.filter((item) => except.indexOf(typeof item) >= 0 || !!item)
}