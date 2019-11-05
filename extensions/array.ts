interface Array<T> {
    contains(field: any): boolean;

    sum(field: string): number;

}

Array.prototype.contains = function (field: any) {
    return this.indexOf(field) > -1;
};
Array.prototype.sum = function (field: string) {
    return this.map(item => item[field]).reduce((t, v) => t + v, 0);
};