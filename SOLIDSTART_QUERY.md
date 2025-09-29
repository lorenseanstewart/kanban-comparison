## SolidStart query() guide

### What query() is
- query() defines a server-only data function that can be called from the client. The function executes on the server, the result is serialized, and the router provides caching, deduping, SSR, and streaming integration.

### Why use it
- Server-only execution (safe DB/env access)
- Router-aware caching and request deduplication
- SSR + Suspense streaming compatibility
- Preload support to warm data before rendering

### How it’s keyed and cached
- Each query has a string key, e.g., "boards:list" or "boards:detail".
- Cache identity = key + serialized input. Same key/params during a navigation reuse the in-flight/completed result.
- Concurrent requests for the same key/params are coalesced.

### Typical usage
- Define on the server:
```ts
import { query } from "@solidjs/router";
import { getBoards, getBoard } from "./boards";

export const listBoards = query(() => getBoards(), "boards:list");
export const fetchBoard = query((input: { id: string }) => getBoard(input.id), "boards:detail");
```

- Preload in the route to warm the cache:
```ts
export const route = {
  preload({ params }) {
    listBoards();
    fetchBoard({ id: params.id });
  },
};
```

- Consume in components with createAsync (router-aware):
```ts
import { createAsync } from "@solidjs/router";

const boards = createAsync(() => listBoards());
const board = createAsync(() => fetchBoard({ id: params.id }));
```

### Revalidation after mutations
- Pair action() with query(). After successful mutations, revalidate affected queries by key to refresh cached data (e.g., revalidate("boards:list")).

### Error and redirect behavior
- Throwing an Error in a query surfaces to the nearest error boundary.
- Throw redirect() on the server to navigate (e.g., for not-found or auth flows).

### Types
- Input/output types are inferred from the function signature and return type.
- Add explicit types to createAsync when the result may be nullable or to aid tooling.

### createAsync vs createResource
- Use createAsync for query() results. It respects route preload, SSR, and cache dedupe.
- Use createResource for client-only/non-router data where you want manual triggers and custom caching.

### Practical tips
- Keep inputs minimal and JSON-serializable.
- Centralize query keys (e.g., constants) for easier revalidation.
- Preload queries needed on first paint to make navigations feel instant.
- For lists + details, key by both the resource type and identifier (e.g., "boards:detail" + { id }).
