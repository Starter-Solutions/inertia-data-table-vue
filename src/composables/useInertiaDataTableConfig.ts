import {
    InertiaDataTableDefaults,
    InertiaDataTableOptions,
    InertiaDataTableQueryParams,
    InertiaDataTableSettings,
    InertiaDataTableSharedProps,
    InertiaDataTableStateRoutes,
} from "@/types";
import { usePage } from "@inertiajs/vue3";
import { computed, MaybeRefOrGetter, toValue } from "vue";

export const useInertiaDataTableConfig = (
    tableKey: MaybeRefOrGetter<string>,
    options?: MaybeRefOrGetter<InertiaDataTableOptions>,
) => {
    const page = usePage<InertiaDataTableSharedProps>();

    const settings = computed<InertiaDataTableSettings>(() => {
        const _options = toValue(options);
        const _tableKey = toValue(tableKey);
        const _pagePropsKey = toValue(_options?.pagePropsKey) ?? _tableKey;
        const _useUrlQuery = toValue(_options?.useUrlQuery) ?? false;
        const _reloadOnly = toValue(_options?.reloadOnly)
            ? [_pagePropsKey, ...toValue(_options?.reloadOnly)!]
            : [_pagePropsKey];

        return {
            tableKey: _tableKey,
            pagePropsKey: _pagePropsKey,
            useUrlQuery: _useUrlQuery,
            reloadOnly: _reloadOnly,
        };
    });

    const stateRoutes = computed<InertiaDataTableStateRoutes>(
        () =>
            page.props?.inertiaDataTable?.stateRoutes ?? {
                set: "",
                drop: "",
                dropAll: "",
            },
    );

    const queryParams = computed<InertiaDataTableQueryParams>(
        () =>
            page.props?.inertiaDataTable?.queryParams ?? {
                tableKey: "tableKey",
                perPage: "per_page",
                sortBy: "sort_by",
                descending: "descending",
                pageName: "page",
                filter: "filter",
            },
    );

    const defaults = computed<InertiaDataTableDefaults>(
        () =>
            page.props?.inertiaDataTable?.defaults ?? {
                perPage: 15,
                sortBy: "id",
            },
    );

    return {
        settings,
        stateRoutes,
        queryParams,
        defaults,
    };
};
