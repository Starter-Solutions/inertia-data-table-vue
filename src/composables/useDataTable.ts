import { InertiaDataTableOptions, Paginated, PaginatedRequest } from "@/types";
import { router, usePage } from "@inertiajs/vue3";
import { computed, MaybeRefOrGetter, onBeforeUnmount } from "vue";
import { useInertiaDataTableConfig } from "./useInertiaDataTableConfig";
import { useLaravelPagination } from "./useLaravelPagination";

export const useDataTable = <T>(
    tableKey: MaybeRefOrGetter<string>,
    options?: MaybeRefOrGetter<InertiaDataTableOptions>,
) => {
    const { stateRoutes, settings } = useInertiaDataTableConfig(
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
        [settings.value.pagePropsKey]: Paginated<T>;
    }>();

    const paginatedData = computed(
        () => page.props[settings.value.pagePropsKey] ?? null,
    );

    const { data, pagination, getPaginatedRequest, validPage } =
        useLaravelPagination(paginatedData);

    const reloadData = (request?: Partial<PaginatedRequest>) => {
        request = getPaginatedRequest(request);

        if (settings.value.useUrlQuery) {
            router.reload({
                only: [settings.value.pagePropsKey],
                data: { tableKey: settings.value.tableKey, ...request },
            });
        } else {
            router.post(
                stateRoutes.value.set,
                {
                    tableKey: settings.value.tableKey,
                    data: { ...request },
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    only: [settings.value.pagePropsKey],
                },
            );
        }
    };

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

        reloadData(getPaginatedRequest({ page: newPage }));
    };

    const itemsPerPage = (perPage: number) => {
        reloadData(getPaginatedRequest({ per_page: perPage, page: 1 }));
    };

    const sortBy = (sort_by: string, descending?: boolean) => {
        const newDescending =
            (descending ?? pagination.value.sort_by === sort_by)
                ? !pagination.value.descending
                : false;

        reloadData(getPaginatedRequest({ sort_by, descending: newDescending }));
    };

    return {
        data,
        pagination,
        reloadData,
        firstPage,
        previousPage,
        nextPage,
        lastPage,
        goToPage,
        itemsPerPage,
        sortBy,
    };
};
