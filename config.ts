import IApiDriver from "./src/api/IApiDriver";

export default class fOrm {
    private static $default_api_driver: IApiDriver;
    static SetDefaultApiDriver(driver: IApiDriver) { this.$default_api_driver = driver; }
    static GetDefaultApiDriver() {
        if (!this.$default_api_driver) throw 'Default API driver is not configured. Please call Eloquent.SetDefaultApiDriver';
        return this.$default_api_driver;
    }

    private static $is_debug_mode: boolean = false;
    public static SetDebugMode(value: boolean) {this.$is_debug_mode = value;}
    public static get IsDebugMode() {return this.$is_debug_mode}
}