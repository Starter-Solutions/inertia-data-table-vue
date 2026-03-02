
export type PaginationLink = {
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
};

export type NormalizedPagination = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    path: string;
    links: PaginationLink[];
    //links
    first_page_url: string | null;
    last_page_url: string | null;
    next_page_url: string | null;
    prev_page_url: string | null;
    //custom
    sort_by?: string;
    descending?: boolean;
};

// For JsonResource collection wrapping
export type PaginatedResource<T> = {
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: Omit<
        NormalizedPagination,
        'first_page_url' | 'last_page_url' | 'next_page_url' | 'prev_page_url'
    >;
};

// For flat pagination without wrapping
export type PaginatedFlat<T> = NormalizedPagination & {
    data: T[];
};

// Union type
export type Paginated<T> = PaginatedResource<T> | PaginatedFlat<T>;

export interface PaginatedRequest {
    page: number;
    per_page: number;
    //custom
    sort_by: string;
    descending: boolean;
}
