import { computed, MaybeRefOrGetter, toValue, watch } from "vue";
import {
    NormalizedPagination,
    Paginated,
    PaginatedFlat,
    PaginatedRequest,
    PaginatedResource,
} from "@/types/pagination";

export const useLaravelPagination = <T>(
    paginated?: MaybeRefOrGetter<Paginated<T> | null | undefined>,
) => {
    const normalized = computed(() => normalizePagination(toValue(paginated)));
    const data = computed<Array<T>>(() => normalized.value.data);
    const pagination = computed<Required<NormalizedPagination>>(
        () => normalized.value.pagination,
    );

    const getPaginatedRequest = (
        override: Partial<PaginatedRequest> = {},
    ): PaginatedRequest => {
        return {
            page: override.page ?? pagination.value.current_page,
            per_page: override.per_page ?? pagination.value.per_page,
            sort_by: override.sort_by ?? pagination.value.sort_by!,
            descending: override.descending ?? pagination.value.descending!,
        };
    };

    const validPage = (page: number): boolean => {
        return page > 0 && page <= pagination.value.last_page;
    };

    return {
        data,
        pagination,
        getPaginatedRequest,
        validPage,
    };
};

export const normalizePagination = <T>(
    paginated?: Paginated<T> | null,
): {
    data: T[];
    pagination: Required<NormalizedPagination>;
} => {
    return {
        data: paginated?.data ?? [],
        pagination: getPaginationMeta(paginated),
    };
};

export const isResource = (
    p: Paginated<unknown>,
): p is PaginatedResource<unknown> =>
    "meta" in p && typeof p.meta === "object" && p.meta !== null;

export const getPaginationMeta = (
    paginated?: Paginated<unknown> | null,
): Required<NormalizedPagination> => {
    if (!paginated) {
        return {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
            from: null,
            to: null,
            path: "",
            links: [],
            //links
            first_page_url: null,
            last_page_url: null,
            next_page_url: null,
            prev_page_url: null,
            //custom
            sort_by: "id",
            descending: false,
        };
    }

    // It's a PaginatedResource
    if (isResource(paginated)) {
        return {
            current_page: paginated.meta.current_page,
            last_page: paginated.meta.last_page,
            per_page: paginated.meta.per_page,
            total: paginated.meta.total,
            from: paginated.meta.from,
            to: paginated.meta.to,
            path: paginated.meta.path,
            links: paginated.meta.links,
            //links
            first_page_url: paginated.links.first,
            last_page_url: paginated.links.last,
            next_page_url: paginated.links.next,
            prev_page_url: paginated.links.prev,
            //custom
            sort_by: paginated.meta.sort_by ?? "id",
            descending: paginated.meta.descending ?? false,
        };
    }

    // Otherwise, it's PaginatedFlat
    const {
        current_page,
        last_page,
        per_page,
        total,
        from,
        to,
        path,
        links,
        //links
        first_page_url,
        last_page_url,
        next_page_url,
        prev_page_url,
        //custom
        sort_by,
        descending,
    } = paginated as PaginatedFlat<unknown>;

    return {
        current_page,
        last_page,
        per_page,
        total,
        from,
        to,
        path,
        links,
        //links
        first_page_url,
        last_page_url,
        next_page_url,
        prev_page_url,
        //custom
        sort_by: sort_by ?? "id",
        descending: descending ?? false,
    };
};
