# (F)rontend ORM
`f-orm` is a library that brings ORM to frontend. 

# API
The library comes with a preloaded api wrapper around axios that allows calls to the API
After loading the library call the following lines
```typescript
import {fOrm} from 'f-orm';
fOrm.SetApiBaseUrl('http://api.your-domain.com').SetApiVersion('1.0');
```
Authentication is done via tokens.
After logging in the user call
```typescript
fOrm.GetDefaultApiDriver().SetToken('the-secret-token');
// now all the requests will have the header "Authorization: Bearer the-secret-token"
```
## Models
Models are classes that encapsulate CRUD methods. Communication with the database is done via API

### API Requirements
The library expects the following endpoints to be available ( exemplified for the user model)
POST /user          - creates a new user
PATCH /user/10      - modifies the user with the id 10
DELETE /user/10     - deletes the user with id 10
GET /user/10        - gets info about the user with id 10

All the endpoints ( except delete) should return the following response format ( exemplified for the user model):
```json
{
  "success": boolean,
  "data" : {
    "user" : {
      "id": "the id",
      "email": "the email of the user",
      ...
    }   
  },
  "message" : string, // not required, it can be used to display error messages to the user
  "validation-errors" : { // not required, only fill the fields that failed validation
    "field-name" : "Error message"
  }
}
```
Model declaration example
```typescript
import {Dictionary, HasMany, HasOne, IDatabaseRecord, Model, RECORD_INFO, RELATIONS, Repository} from "f-orm";
   // general information about the model
   let UserRecord: IDatabaseRecord<UserModel> = {
       Name: 'user', // name of a single instance ( row )
       Table: 'users', // name of the table 
       PrimaryKey: 'Id', // primary key to be used
       Relations: {}, // just leave it like this, it'll be explained later
       Namespace: '', // prefix for the api url generation
       Make(data?: Dictionary<any>) {return new UserModel(data)} // Factory to generate a new instance of a model
   };
   
   // Model declaration
   export class UserModel extends Model {
       // Copy these over
       static [RECORD_INFO]() {return UserRecord;}
       [RECORD_INFO]() {return UserModel[RECORD_INFO]();}
       [RELATIONS]() {return this.relations;}
   
       // The columns of the model
       public Id: number = 0;
       public Email:string = '';
       public Name: string = '';
       public Password:string = '';
   
       // Leave this as it is
       constructor(data?: Dictionary<any>) {
           super(data);
           if (data) this.Load(data);
           this.LoadOriginalAttributes();
       }
   }
   // Repository declaration
   // A repository contains multiple Models
   export class UsersRepository extends Repository<UserModel> {
       static [RECORD_INFO]() {return UserRecord;}
       [RECORD_INFO]() {return UserModel[RECORD_INFO]();}
   }
```

##### Code example
```typescript

// creating a new user
let user = new UserModel();
user.Email = 'andrei.caminschi1988@gmail.com'
user.Name = 'Andrei';
user.Password = 'secret';
user.Save(); // calls the create endpoint, and loads the data from the response
 
//retrieve info about an user
let user = new UserModel();
user.Id = 10;
user.Get(); // call the get info endopoint and loads the data from the response
```

#### Methods
`Get(extra?: Dictionary<any>):Promise<IApiResponse>`

Gets the model data from the API.


`Save(extra?: (Model | Dictionary<any>)):Promise<IApiResponse>`

Calls the create or patch endpoint url with only the changed attributes.
If `extra` is a dictionary, it will be appended to the request
If `extra` is a model, the properties will be loaded and after that saved ( usefull for relations) 

After the request is finished, the data from the response is loaded into the model

`HasChanged():boolean`

Determines if the model attributes have changed since the last time it was loaded

`HasAttributeChanged(key: string):boolean`

Determines if the attribute value has changed

`ToJson():Dictionary<any>`

Returns a JSON representation of the model. All the property names will be converted from CamelCase to snake_case.

#### Relations
All the relations have one parameter of type `RelationOptions`
```typescript
type RelationOptions = {
    /**
     * The local key to be used when generating the URL
     */
    LocalKey?: string,
    /**
     * The foreign key to be used when generating the URL
     */
    ForeignKey?: string,
    /**
     * Transforms the URL of the relation target to eloquent
     * Eg. instead of /posts?user_id=10 it will generate user/10/posts
     */
    UseEloquentUrl?: boolean
}

```
##### BelongsTo
Creates a BelongsTo relation
```typescript
export class UserModel extends Model {
    ....
    
    @BelongsTo() Group(){return new GroupModel()}
}

let user = new UserModel();
user.Id = 10;
console.log(user.Group().Name); // will get the group of the user with id 10 
```

##### HasMany

Creates a HasMany relation
```typescript
export class UserModel extends Model {
    ....
    
    @HasMany() Posts(){return new PostsRepository()}
}

let user = new UserModel();
user.Id = 10;
user.Posts().Get(); // explained below, gets all the posts belonging to the user with id 10
console.log(user.Posts().Items);   
```
##### HasOne

Creates a HasMany relation
```typescript
export class UserModel extends Model {
    ....
    
    @HasOne() Avatar(){return new AvatarModel()}
}

let user = new UserModel();
user.Id = 10;
let avatar = new AvatarModel();
avatar.Url = 'tralalala';
user.Avatar().Save(avatar); 
```



## Repositories
The repository is a table, contains multiple models and provides methods for filtering, sorting and paginating
### Required endpoints ( exemplified for users)
GET /users  - searches for users

The endpoint should return the following response
```json
{
  "success": boolean,
  "data" : {
    "count": number, // the total number of records that match the filters
    "users" : [
      {
        "id": "the first id",
        "email": "the email of the user",
        ...
      },
      {
        "id": "the id",
        "email": "the email of the user",
        ...
      },
      ....
    ],
  },
  "message" : string, // not required, it can be used to display error messages to the user
  }
```

#### Methods
```Get(append?: string, extra?: Dictionary<any>):Promise<IApiResponse>```
Calls the search endpoint and loads the data

`append` will be appended to the url
`extra` is the extra data to be send, apended to the query

The results are present in the `Items` property of the class, and they are all casted to Model

#### Filtering
`ResetFilters()`

Resets all the filters, except the fixed ones

`SortBy(column:string,desc:bool)`
Sends the following query params to the API endpoint `sort-by=column;DESC|ASC`

`Skip(count:number)` &  `Take(count:number)` & `Limit(count:number)` Sets the limit for the api call
The resulting query parameter is `limit=skip,take`
`ForPage(page: number, per_page: number = 15)` paginates for the requested page using `Skip` and `Take`
```typescript
WhereEquals(field: string, value: any, is_fixed_filter: boolean = false); // generates query parameter field=value
WhereNotEquals(field: string, value: any, is_fixed_filter: boolean = false); // generates query parameter field-NOTEQ=value
WhereGreaterThan(field: string, value: any, is_fixed_filter: boolean = false); // generates query parameter field-GT=value
WhereGreaterThanOrEquals(field: string, value: any, is_fixed_filter: boolean = false); // generates query parameter field-GTE=value
WhereLessThan(field: string, value: any, is_fixed_filter: boolean = false); // generates query parameter field-LT=value
WhereLessThanOrEquals(field: string, value: any, is_fixed_filter: boolean = false); // generates query parameter field-LTE=value
WhereIsNull(field: string, is_fixed_filter: boolean = false); // generates query parameter field-NULL=null
WhereIsNotNull(field: string, is_fixed_filter: boolean = false); // generates query parameter field-NOTNULL=null
WhereBetween(field: string, value: any[], is_fixed_filter: boolean = false); // generates query parameter field-BETWEEN=value1,value2
WhereNotBetween(field: string, value: any[], is_fixed_filter: boolean = false); // generates query parameter field-NOTBETWEEN=value1,value2
WhereIn(field: string, value: any[], is_fixed_filter: boolean = false); // generates query parameter field-IN=value1,value2,...,valueN
WhereNotIn(field: string, value: any[], is_fixed_filter: boolean = false); // generates query parameter field-NOTIN=value1,value2,...,valueN
WhereStartsWith(field: string, value: string, is_fixed_filter: boolean = false); // generates query parameter field-STARTSWITH=value
WhereEndsWith(field: string, value: string, is_fixed_filter: boolean = false); // generates query parameter field-ENDSWITH=value
WhereContains(field: string, value: string, is_fixed_filter: boolean = false); // generates query parameter field-CONTAINS=value
```

#### Examples ( for the user case)
```typescript
let repo = new UsersRepository();
repo.WherContains('name','andrei')
    .WhereEquals('email','andrei.caminschi1988@gmail.com')
    .WhereGreaterThanOrEquals('created_at','2019-09-09')
    .ForPage(1)
    .SortBy('name')
    .Get()

// resulting query is
// GET /users?name-CONTAINS=andrei&email=andrei.caminschi1988@gmail.com&created_at-GTE=2019-09-09&limit=0,15&sort-by=name|ASC
```

##### Additional methods
`AddItem(item:Model)` - manually adds an item to the repo

`AddItemFromData(data:Dictionary<any>)` - creates a new model and adds it

`Save(item:Model)` - adds the item to the repo and saves it ( usually used for relations, that automatically configure the model)