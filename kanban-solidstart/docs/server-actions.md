# Server Actions

Server actions enable type-safe client-server communication in SolidStart using the `"use server"` directive.

## What Are Server Actions?

Server actions are functions that run exclusively on the server but can be called from client components as if they were local functions.

**Benefits:**
- Type-safe end-to-end (TypeScript types flow from server to client)
- No manual API endpoint definitions
- Automatic serialization/deserialization
- Built-in CSRF protection

## File Structure

```
/src/api
  boards.ts          - Query functions (read operations)
  card-actions.ts    - Card mutations (write operations)
  board-actions.ts   - Board mutations
  drag-drop-actions.ts - Drag-drop mutations
  index.ts           - Query/action wrappers
```

## Query Functions vs Actions

### Query Functions (Read Operations)

Located in `src/api/boards.ts` and wrapped in `query()`:

```tsx
"use server";

// Server function
export async function getBoards(): Promise<BoardSummary[]> {
  return await db.select().from(boards).orderBy(asc(boards.createdAt));
}

// Query wrapper (in index.ts)
export const listBoards = query(() => getBoards(), "boards:list");
```

**Usage:**
```tsx
const boards = createAsync(() => listBoards());
```

**Features:**
- Cached by key (`"boards:list"`)
- Automatically refetched on navigation
- Can be preloaded in route definitions

---

### Action Functions (Write Operations)

Located in `src/api/*-actions.ts` files:

```tsx
"use server";

export async function createBoard(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    // Validation
    if (!title || title.trim().length === 0) {
      throw new Error("Board title is required");
    }

    // Database mutation
    const boardId = crypto.randomUUID();
    await db.insert(boards).values({ id: boardId, title, description });

    // Cache invalidation
    revalidate(["boards:list"]);
  } catch (error) {
    console.error("Failed to create board:", error);
    throw new Error("Failed to create board. Please try again.");
  }
}
```

**Usage:**
```tsx
<form action={createBoard} method="post">
  <input name="title" required />
  <button type="submit">Create</button>
</form>
```

**Features:**
- Accepts `FormData` from HTML forms
- Handles validation and error responses
- Invalidates relevant caches via `revalidate()`

## Form Integration

### Progressive Enhancement

Forms work without JavaScript via standard form submission:

```tsx
<form action={createCard} method="post" onSubmit={handleSubmit}>
  <input name="title" required />
  <textarea name="description" />
  <button type="submit">Add Card</button>
</form>
```

**With JS Disabled:** Form submits normally, server handles mutation, full page reload

**With JS Enabled:** `onSubmit` handler can add optimistic updates before server action runs

---

### Custom Submission Handling

```tsx
const handleSubmit = async (e: Event) => {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const formData = new FormData(form);

  // Optimistic update
  handleOptimisticUpdate(formData);

  // Server action
  await createCard(formData);

  // Reset form
  form.reset();
  onClose();
};
```

## Error Handling

All server actions follow this pattern:

```tsx
export async function myAction(formData: FormData) {
  try {
    // 1. Extract and validate input
    const data = extractAndValidate(formData);

    // 2. Perform database operation
    await db.insert(...);

    // 3. Invalidate caches
    revalidate(["key"]);
  } catch (error) {
    // 4. Log and rethrow with user-friendly message
    console.error("Failed to perform action:", error);
    throw new Error("User-friendly error message");
  }
}
```

**Error Propagation:**
- Errors thrown in server actions are caught by client
- Error boundaries can display fallback UI
- Optimistic updates can revert on error

## Validation

Input validation happens on the server:

```tsx
// Type checking
if (!title || !boardId) {
  throw new Error("Required fields missing");
}

// Content validation
if (title.trim().length === 0) {
  throw new Error("Title cannot be empty");
}

// Length validation
if (title.length > 255) {
  throw new Error("Title too long");
}

// Format validation
if (description && description.length > 2000) {
  throw new Error("Description too long");
}
```

**Future Enhancement:** Use Zod for schema validation:
```tsx
import { z } from "zod";

const cardSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  assigneeId: z.string().uuid().optional(),
});

const data = cardSchema.parse(Object.fromEntries(formData));
```

## Cache Invalidation

After mutations, invalidate affected caches:

```tsx
import { revalidate } from "@solidjs/router";

// Single key
revalidate("boards:detail");

// Multiple keys
revalidate(["boards:list", "boards:detail"]);
```

**Cache Keys:**
- `"boards:list"` - All boards
- `"boards:detail"` - Specific board data
- `"users:list"` - All users
- `"tags:list"` - All tags

## Transactions

Multi-table updates use transactions for atomicity:

```tsx
db.transaction((tx) => {
  // Update card
  tx.update(cards)
    .set({ title, description, assigneeId })
    .where(eq(cards.id, cardId))
    .run();

  // Delete old tags
  tx.delete(cardTags).where(eq(cardTags.cardId, cardId)).run();

  // Insert new tags
  if (tagIds.length > 0) {
    tx.insert(cardTags).values(tagData).run();
  }
});
```

**Benefits:**
- All-or-nothing execution
- Rollback on any error
- Data consistency guaranteed

## Security

### CSRF Protection

SolidStart automatically adds CSRF tokens to form submissions.

### SQL Injection Prevention

Drizzle ORM uses parameterized queries:
```tsx
// ✅ Safe: Parameterized
db.select().from(cards).where(eq(cards.id, cardId));

// ❌ Unsafe: String interpolation
db.run(`SELECT * FROM cards WHERE id = '${cardId}'`);
```

### Input Sanitization

All user input is validated before database operations.

## Best Practices

1. **Always validate inputs** - Never trust client data
2. **Use transactions** - For multi-step operations
3. **Invalidate caches** - After mutations
4. **Handle errors gracefully** - Provide user-friendly messages
5. **Log errors** - For debugging (but don't expose details to client)
6. **Type everything** - Leverage TypeScript for safety
