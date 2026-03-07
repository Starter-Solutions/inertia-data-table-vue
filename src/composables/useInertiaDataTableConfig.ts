import {
    InertiaDataTableDefaults,
    InertiaDataTableOptions,
    InertiaDataTableQueryParams,
    InertiaDataTableSettings,
    InertiaDataTableSharedProps,
    InertiaDataTableStateRoutes,
} from "@/types/config";
import { usePage } from "@inertiajs/vue3";
import { computed, MaybeRefOrGetter, toValue } from "vue";

export const useInertiaDataTableConfig = (
    tableKey: MaybeRefOrGetter<string>,
    options?: MaybeRefOrGetter<InertiaDataTableOptions>,
) => {
    const page = usePage<InertiaDataTableSharedProps>();

    const settings = computed<InertiaDataTableSettings>(() => {
        const _options = toValue(options);
        return {
            tableKey: toValue(tableKey),
            pagePropsKey: toValue(_options?.pagePropsKey) ?? toValue(tableKey),
            useUrlQuery: toValue(_options?.useUrlQuery) ?? false,
        };
    });

    const stateRoutes = computed<InertiaDataTableStateRoutes>(
        () => page.props.inertiaDataTable.stateRoutes,
    );

    const queryParams = computed<InertiaDataTableQueryParams>(
        () => page.props.inertiaDataTable.queryParams,
    );

    const defaults = computed<InertiaDataTableDefaults>(
        () => page.props.inertiaDataTable.defaults,
    );

    return {
        settings,
        stateRoutes,
        queryParams,
        defaults,
    };
};
