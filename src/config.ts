import IApiDriver from "./api/IApiDriver";
import {ApiDriver} from "./api/api";

export default class fOrm {
    private static $default_api_driver: IApiDriver = new ApiDriver();
    static SetDefaultApiDriver(driver: IApiDriver) { this.$default_api_driver = driver; }
    static GetDefaultApiDriver() {
        if (!this.$default_api_driver) throw 'Default API driver is not configured. Please call fOrm.SetDefaultApiDriver';
        return this.$default_api_driver;
    }
    static SetApiBaseUrl(base_url: string) {
        if (!this.$default_api_driver) throw 'Default API driver is not configured. Please call fOrm.SetDefaultApiDriver';
        this.$default_api_driver.SetBaseEndpoint(base_url);
        return this;
    }

    static SetApiVersion(version: string) {
        if (!this.$default_api_driver) throw 'Default API driver is not configured. Please call fOrm.SetDefaultApiDriver';
        this.$default_api_driver.SetVersion(version);
        return this;
    }

    private static $is_debug_mode: boolean = false;
    public static SetDebugMode(value: boolean) {this.$is_debug_mode = value;}
    public static get IsDebugMode() {return this.$is_debug_mode}
}