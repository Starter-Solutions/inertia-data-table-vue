import { MaybeRefOrGetter } from "vue";

export type InertiaDataTableStateRoutes = {
    // Urls for the stateRoutes used to set and drop the table state in the session
    set: string;
    drop: string;
    dropAll: string;
};

export type InertiaDataTableQueryParams = {
    // The names of the query parameters used for pagination and sorting
    tableKey: string;
    perPage: string;
    sortBy: string;
    descending: string;
    pageName: string;
};

export type InertiaDataTableDefaults = {
    // Default values for the query parameters, used if not provided in the request
    perPage: number;
    sortBy: string;
};

export type InertiaDataTableSharedProps = {
    // Props that are shared across all tables, containing the state routes, query parameter names and default values
    inertiaDataTable: {
        stateRoutes: InertiaDataTableStateRoutes;
        queryParams: InertiaDataTableQueryParams;
        defaults: InertiaDataTableDefaults;
    };
};

export type InertiaDataTableOptions = {
    /**
     * Whether to use the URL query for pagination and sorting state. If false, the state is stored in the session.
     * Using the URL query allows for better shareability of links, but requires more complex handling of the query parameters in the backend.
     */
    useUrlQuery?: MaybeRefOrGetter<boolean>;
    /**
     * The key in which the paginated data is stored in the page props. Defaults to the tableKey if not provided.
     */
    pagePropsKey?: MaybeRefOrGetter<string>;
};

export type InertiaDataTableSettings = {
    tableKey: string;
    pagePropsKey: string;
    useUrlQuery: boolean;
};
