import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDataTable } from "./useDataTable";

const inertia = vi.hoisted(() => ({
    props: {} as Record<string, unknown>,
    delete: vi.fn(),
    reload: vi.fn(),
    post: vi.fn(),
}));

vi.mock("@inertiajs/vue3", () => ({
    router: {
        delete: inertia.delete,
        reload: inertia.reload,
        post: inertia.post,
    },
    usePage: () => ({ props: inertia.props }),
}));

vi.mock("vue", async (importOriginal) => ({
    ...(await importOriginal<typeof import("vue")>()),
    onBeforeUnmount: vi.fn(),
}));

describe("useDataTable additional data", () => {
    beforeEach(() => {
        inertia.props = {};
        vi.clearAllMocks();
    });

    it("returns safe defaults while a deferred page prop is null", () => {
        inertia.props = { users: null };

        const table = useDataTable("users", { useUrlQuery: true });

        expect(table.additional.value).toEqual({});
        expect(table.getAdditional("filters.statuses", [])).toEqual([]);
    });

    it("returns nested additional values from paginated data", () => {
        inertia.props = {
            users: {
                data: [],
                additional: { filters: { statuses: ["active"] } },
            },
        };

        const table = useDataTable("users", { useUrlQuery: true });

        expect(table.getAdditional("filters.statuses", [])).toEqual(["active"]);
    });

    it("returns the allowed backend sort columns", () => {
        inertia.props = {
            users: {
                data: [],
                allowed_sorts: ["id", "name"],
            },
        };

        const table = useDataTable("users", { useUrlQuery: true });

        expect(table.allowedSorts.value).toEqual(["id", "name"]);
        expect(table.isSortable("name")).toBe(true);
        expect(table.isSortable("email")).toBe(false);
    });

    it("treats null allowed sorts as unrestricted and an empty list as disabled", () => {
        inertia.props = {
            users: {
                data: [],
                allowed_sorts: null,
            },
        };

        const unrestricted = useDataTable("users", { useUrlQuery: true });

        expect(unrestricted.allowedSorts.value).toBeNull();
        expect(unrestricted.isSortable("any_column")).toBe(true);

        inertia.props = {
            users: {
                data: [],
                allowed_sorts: [],
            },
        };

        const disabled = useDataTable("users", { useUrlQuery: true });

        expect(disabled.allowedSorts.value).toEqual([]);
        expect(disabled.isSortable("id")).toBe(false);
    });
});

describe("useDataTable history", () => {
    beforeEach(() => {
        inertia.props = {};
        vi.clearAllMocks();
    });

    it("does not replace browser history by default for URL query state", () => {
        const table = useDataTable("users", { useUrlQuery: true });

        table.reload();

        expect(inertia.reload).toHaveBeenCalledWith(
            expect.objectContaining({ replace: false }),
        );
    });

    it("can replace browser history for URL query state", () => {
        const table = useDataTable("users", {
            useUrlQuery: true,
            replaceHistory: true,
        });

        table.reload();

        expect(inertia.reload).toHaveBeenCalledWith(
            expect.objectContaining({ replace: true }),
        );
    });

    it("can replace browser history for session state", () => {
        inertia.props = {
            inertiaDataTable: {
                stateRoutes: { set: "/set", drop: "/drop", dropAll: "/drop-all" },
            },
        };

        const table = useDataTable("users", { replaceHistory: true });

        table.reload();

        expect(inertia.post).toHaveBeenCalledWith(
            "/set",
            expect.any(Object),
            expect.objectContaining({ replace: true }),
        );
    });

    it("keeps a nullable sort state when no backend sort is applied", () => {
        inertia.props = {
            users: {
                data: [],
                current_page: 1,
                last_page: 1,
                per_page: 10,
                total: 0,
                from: null,
                to: null,
                path: "/users",
                links: [],
                first_page_url: null,
                last_page_url: null,
                next_page_url: null,
                prev_page_url: null,
                sort_by: null,
                descending: false,
            },
        };

        const table = useDataTable("users", { useUrlQuery: true });

        table.reload();

        expect(inertia.reload).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ sort_by: null }),
            }),
        );
    });
});

describe("useDataTable sorting", () => {
    beforeEach(() => {
        inertia.props = {
            users: {
                data: [],
                sort_by: "name",
                descending: true,
                allowed_sorts: ["name"],
            },
        };
        vi.clearAllMocks();
    });

    it("preserves an explicitly false descending value", () => {
        const table = useDataTable("users", { useUrlQuery: true });

        table.sortBy("name", false);

        expect(inertia.reload).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ descending: false }),
            }),
        );
    });

    it("preserves an explicitly true descending value", () => {
        const table = useDataTable("users", { useUrlQuery: true });

        table.sortBy("name", true);

        expect(inertia.reload).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ descending: true }),
            }),
        );
    });

    it("toggles the current column when descending is omitted", () => {
        const table = useDataTable("users", { useUrlQuery: true });

        table.sortBy("name");

        expect(inertia.reload).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ descending: false }),
            }),
        );
    });
});
