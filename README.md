# @starter-solutions/inertia-data-table-vue

Vue 3 composables for paginated, filtered, and sortable Laravel data delivered through Inertia.js. This is the frontend companion to [`starter-solutions/inertia-data-table`](https://github.com/starter-solutions/inertia-data-table-laravel).

## Installation

```bash
npm install @starter-solutions/inertia-data-table-vue
```

The Laravel package shares its route and configuration metadata automatically. No Vue plugin registration is required.

## Quick start

Given a Laravel Inertia prop named `users`:

```php
return Inertia::render('Users/Index', [
    'users' => User::query()->dataTable('users'),
]);
```

consume it with the same table key:

```vue
<script setup lang="ts">
import { useDataTable } from '@starter-solutions/inertia-data-table-vue';

type User = {
    id: number;
    name: string;
    email: string;
};

const {
    data: users,
    pagination,
    isSortable,
    sortBy,
    previousPage,
    nextPage,
} = useDataTable<User>('users');
</script>

<template>
    <table>
        <thead>
            <tr>
                <th>
                    <button
                        :disabled="!isSortable('name')"
                        @click="sortBy('name')"
                    >
                        Name
                    </button>
                </th>
                <th>Email</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="user in users" :key="user.id">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
            </tr>
        </tbody>
    </table>

    <button
        :disabled="pagination.current_page === 1"
        @click="previousPage"
    >
        Previous
    </button>
    <button
        :disabled="pagination.current_page === pagination.last_page"
        @click="nextPage"
    >
        Next
    </button>
</template>
```

Vue automatically unwraps the returned computed refs in templates. In script code, use `users.value` and `pagination.value`.

## Composable API

```ts
const table = useDataTable<User>('users', {
    useUrlQuery: true,
    replaceHistory: true,
    pagePropsKey: 'users',
    reloadOnly: ['summary'],
});
```

### Options

- `useUrlQuery`: store state in the URL instead of the Laravel session; defaults to `false`
- `replaceHistory`: replace rather than append browser-history entries; defaults to `false`
- `pagePropsKey`: Inertia prop containing the paginator; defaults to the table key
- `reloadOnly`: additional Inertia props to refresh with the table prop

The table key may be a ref or getter, so one component can react to a changing table identity.

### Returned state

- `data`: computed array of current rows
- `pagination`: normalized Laravel pagination metadata
- `allowedSorts`: computed `string[] | null`
- `filter`: reactive filter object
- `additional`: computed backend-provided metadata

### Returned actions

- `reload(overrides?)`
- `firstPage()`, `previousPage()`, `nextPage()`, `lastPage()`
- `goToPage(page)`
- `itemsPerPage(perPage)`; values `<= 0` request all rows
- `sortBy(key, descending?)`
- `isSortable(key)`
- `setFilter(key, value)`, `setFilters(filters)`
- `removeFilter(key)`, `resetFilters()`
- `getAdditional(path, defaultValue?)`

## Sorting

`allowed_sorts` from Laravel drives the reactive `allowedSorts` value and `isSortable()` helper:

```vue
<button
    v-if="isSortable(column.key)"
    @click="sortBy(column.key)"
>
    {{ column.label }}
</button>
```

The backend states remain distinct:

- `null`: unrestricted base-model columns; `isSortable()` returns `true`
- `[]`: sorting disabled; `isSortable()` returns `false`
- `['id', 'name']`: only the listed keys are sortable

Calling `sortBy('name')` selects ascending order for a new column and toggles the direction when the same column is clicked again. Pass an explicit direction when needed:

```ts
table.sortBy('name', false); // ascending
table.sortBy('name', true);  // descending
```

Relation, accessor, and callback keys such as `profile.city` or `name_length` are ordinary strings on the frontend.

## Pagination and reloads

```ts
table.firstPage();
table.goToPage(3);
table.itemsPerPage(50);

table.reload({
    page: 2,
    per_page: 25,
    sort_by: 'email',
    descending: true,
});
```

Each action performs a partial Inertia reload for the table prop and any configured `reloadOnly` props.

## Filtering

Filter methods reset the paginator to page one where appropriate:

```ts
table.setFilter('search', 'Ada');
table.setFilters([
    { key: 'status', value: 'active' },
    { key: 'role', value: 'admin' },
]);
table.removeFilter('role');
table.resetFilters();
```

Bind the current backend filter state in a component:

```ts
import { ref } from 'vue';

const search = ref(table.filter.search ?? '');

const submitSearch = () => {
    table.setFilter('search', search.value.trim());
};
```

## Additional metadata

Laravel's `additional` data is exposed reactively:

```ts
const statuses = table.getAdditional('filters.statuses', []) as string[];
```

Use `table.additional.value` when the entire object is needed in script code.

## Multiple tables

Create one composable instance per backend table key:

```ts
const users = useDataTable<User>('users', { useUrlQuery: true });
const orders = useDataTable<Order>('orders', { useUrlQuery: true });
```

Every request includes its table key, so Laravel updates only the targeted table's query state.

## Custom prop names

When the Inertia prop differs from the backend table key, set `pagePropsKey`:

```ts
const users = useDataTable<User>('admin-users', {
    pagePropsKey: 'users',
});
```

The Laravel call must still use `tableKey: 'admin-users'`.

## Laravel JsonResource responses

The composable normalizes both flat paginator responses and wrapped resources:

```php
'users' => UserResource::collection(
    User::query()->dataTable('users')
),
```

No frontend changes are necessary.

## License

MIT © Starter Solutions
