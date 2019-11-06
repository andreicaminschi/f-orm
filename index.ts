import './src/extensions/string';
import './src/extensions/array';
import './src/extensions/object';

export {RELATIONS, RECORD_INFO} from "./symbols";
export {Dictionary} from "./types";
export * from './decorators';
export {default as Model} from "./src/db/Model"
export {default as Repository} from "./src/db/Repository"
export {default as IDatabaseRecord} from "./src/db/IDatabaseRecord"
export {default as IApiDriver} from "./src/api/IApiDriver"
export {default as IApiResponse} from "./src/api/IApiResponse"
export {default as fOrm} from './config';

