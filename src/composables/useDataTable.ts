import { InertiaDataTableOptions, Paginated, PaginatedRequest } from "@/types";
import { router, usePage } from "@inertiajs/vue3";
import { computed, MaybeRefOrGetter, onBeforeUnmount, reactive } from "vue";
import { useInertiaDataTableConfig } from "./useInertiaDataTableConfig";
import { useLaravelPagination } from "./useLaravelPagination";

export const useDataTable = <T>(
    tableKey: MaybeRefOrGetter<string>,
    options?: MaybeRefOrGetter<InertiaDataTableOptions>,
) => {
    const { settings, stateRoutes, queryParams } = useInertiaDataTableConfig(
        tableKey,
        options,
    );

    onBeforeUnmount(() => {
        router.delete(stateRoutes.value.drop, {
            preserveScroll: true,
            preserveState: true,
            data: { tableKey: settings.value.tableKey },
        });
    });

    const page = usePage<{
        [settings.value.pagePropsKey]: Paginated<T> & { additional: Record<string, any> };
    }>();

    const paginatedData = computed(
        () => page.props[settings.value.pagePropsKey] ?? null,
    );

    const { data, pagination, getPaginatedRequest, validPage } =
        useLaravelPagination(paginatedData);

    const reload = (pagination?: Partial<PaginatedRequest>) => {
        pagination = getPaginatedRequest(pagination);

        if (settings.value.useUrlQuery) {
            router.reload({
                only: settings.value.reloadOnly,
                data: {
                    [queryParams.value.tableKey]: settings.value.tableKey,
                    [queryParams.value.filter]: filter,
                    [queryParams.value.pageName]: pagination.page,
                    [queryParams.value.perPage]: pagination.per_page,
                    [queryParams.value.sortBy]: pagination.sort_by,
                    [queryParams.value.descending]: pagination.descending,
                },
            });
        } else {
            router.post(
                stateRoutes.value.set,
                {
                    tableKey: settings.value.tableKey,
                    filter: filter,
                    pagination: pagination,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    only: settings.value.reloadOnly,
                },
            );
        }
    };

    // Pagination
    const firstPage = () => {
        goToPage(1);
    };

    const previousPage = () => {
        goToPage(pagination.value.current_page - 1);
    };

    const nextPage = () => {
        goToPage(pagination.value.current_page + 1);
    };

    const lastPage = () => {
        goToPage(pagination.value.last_page);
    };

    const goToPage = (newPage: number) => {
        if (!validPage(newPage)) {
            console.error(`Invalid page: ${newPage}`);
            return;
        }

        reload({ page: newPage });
    };

    const itemsPerPage = (perPage: number) => {
        reload({ per_page: perPage, page: 1 });
    };

    const sortBy = (sort_by: string, descending?: boolean) => {
        const newDescending =
            (descending ?? pagination.value.sort_by === sort_by)
                ? !pagination.value.descending
                : false;

        reload({ sort_by, descending: newDescending });
    };

    // Filter
    const filter = reactive<Record<string, any>>({});

    const setFilter = (key: string, value: any) => {
        filter[key] = value;
        reload({ page: 1 });
    };

    const setFilters = (filters: Array<{ key: string; value: any }>) => {
        filters.forEach(({ key, value }) => {
            filter[key] = value;
        });
        reload({ page: 1 });
    };

    const removeFilter = (key: string) => {
        delete filter[key];
        reload({ page: 1 });
    };

    const resetFilters = () => {
        Object.keys(filter).forEach((key) => delete filter[key]);
        reload({ page: 1 });
    };

    // Additional
    const additional = computed<Record<string, any>>(() => page.props[settings.value.pagePropsKey].additional );

    const getAdditional = (
        key: string,
        defaultValue: any = undefined
    ): any => {
        const value = key
            .split('.')
            .reduce(
                (value, segment) => value?.[segment],
                additional.value
            );

        return value ?? defaultValue;
    };

    return {
        data,
        reload,

        pagination,
        firstPage,
        previousPage,
        nextPage,
        lastPage,
        goToPage,
        itemsPerPage,
        sortBy,

        filter,
        setFilter,
        setFilters,
        removeFilter,
        resetFilters,

        additional,
        getAdditional,
    };
};
