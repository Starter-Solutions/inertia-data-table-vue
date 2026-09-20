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
});
