export  declare type Dictionary<T> = { [key: string]: T; };
export declare type RelationOptions = {
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
