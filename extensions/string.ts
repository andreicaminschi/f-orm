interface String {
    /**
     * Converst snake_case to CamelCase
     */
    snakeCaseToCamelCase(): string;

    /**
     * Converts CamelCase to snake_case
     */
    camelCaseToSnakeCase(): string;

    /**
     * Determines if the string starts with the passed value
     * @param s
     */
    startsWith(s: string): boolean;


    /**
     * Returns the validation key from a string of format ERR-XXX,params
     * @param s
     */
    getValidationKey(s: string): string;


    /**
     * Returns the validation arguments from a string of format ERR-XXX,param1,param2,...
     * @param s
     */
    getValidationArguments(s: string): string[];

    /**
     * Capitalizes the string
     * @param s
     */
    capitalize(s: string): string;

    /**
     * Highlights text
     * @param search
     */
    highlight(search: string): string;

    /**
     * Replaces {Property} with the value of Object.Property
     * @param o
     */
    replaceWithObjectProperties(o: Object): string;

}

String.prototype.snakeCaseToCamelCase = function (this: string): string {
    let str = this.replace(/_\w/g, m => m[1].toUpperCase());
    str = str[0].toUpperCase() + str.slice(1);
    return str;
};

String.prototype.camelCaseToSnakeCase = function (this: string): string {
    return this.replace(/\.?([A-Z]+)/g, function (x, y) {
        return "_" + y.toLowerCase()
    }).replace(/^_/, "")
};

String.prototype.startsWith = function (this: string, s: string) {
    return this.indexOf(s) === 0;
};

String.prototype.getValidationKey = function (this: string) { return 'validation.' + this.split(',').shift(); }
String.prototype.getValidationArguments = function (this: string): string[] {
    let parts = this.split(',');
    parts.shift();
    return parts;
};


String.prototype.capitalize = function (this: string, s: string) {
    return this.replace(this.charAt(0), this.charAt(0).toUpperCase());
};

String.prototype.highlight = function (this: string, search: string) {
    let position = this.toLowerCase().indexOf(search.toLowerCase());
    if (position === -1) return this;
    return this.substr(0, position) + '<strong>' + this.substr(position, search.length) + '</strong>' + this.substr(position + search.length);

}

String.prototype.replaceWithObjectProperties = function (this: string, object: any) {
    let url = this;
    Object.keys(object).forEach(key => {url = url.replace(`{${key}}`, object[key])});
    return url;
}