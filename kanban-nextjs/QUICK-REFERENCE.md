# Next.js Best Practices - Quick Reference

## 🎯 Server vs Client Components

### When to Use Server Components (Default)
```typescript
// NO "use client" directive needed
export default async function Page() {
  const data = await fetchData(); // Can use async/await
  return <div>{data}</div>;
}
```

**Use for:**
- Data fetching
- Accessing backend resources
- Keeping sensitive info on server (API keys, tokens)
- Large dependencies (keep on server)

### When to Use Client Components
```typescript
"use client"; // ← Required at top

export default function Component() {
  const [state, setState] = useState(0);
  return <button onClick={() => setState(1)}>Click</button>;
}
```

**Use for:**
- Event listeners (`onClick`, `onChange`, etc.)
- State & effects (`useState`, `useEffect`, etc.)
- Browser APIs (`window`, `localStorage`, etc.)
- Custom hooks

---

## 📁 File Naming Conventions

```
src/app/
├── layout.tsx          # Shared layout for all pages
├── page.tsx            # Home page route (/)
├── loading.tsx         # Loading UI
├── error.tsx           # Error boundary
├── not-found.tsx       # 404 page
├── globals.css         # Global styles
│
├── board/
│   └── [id]/           # Dynamic route
│       ├── page.tsx            # /board/:id
│       ├── loading.tsx         # Loading for this route
│       ├── error.tsx           # Error for this route
│       ├── not-found.tsx       # 404 for this route
│       └── ComponentName.tsx   # Client component
│
└── api/
    └── route.ts        # API route (avoid if using Server Actions)
```

---

## 🚀 Server Actions

### Definition
```typescript
// src/lib/actions.ts
"use server"; // ← At top of file

export async function createItem(formData: FormData) {
  const title = formData.get("title");
  
  // Validate
  // Database operation
  await db.insert(items).values({ title });
  
  // Invalidate cache
  revalidatePath("/items");
  
  return { success: true };
}
```

### Usage in Client Component
```typescript
"use client";
import { createItem } from "@/lib/actions";

export function Form() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await createItem(formData); // ← Direct call
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 💾 Data Fetching

### With Cache (Recommended)
```typescript
import { cache } from "react";

export const getItems = cache(async () => {
  return db.select().from(items);
});
```

**Benefits:**
- Automatic request deduplication
- Multiple calls = single database query

### Parallel Fetching
```typescript
export default async function Page() {
  // All fetch in parallel ✅
  const [items, users, tags] = await Promise.all([
    getItems(),
    getUsers(),
    getTags(),
  ]);
  
  return <Component items={items} users={users} tags={tags} />;
}
```

---

## 🎨 Metadata

### Static (layout.tsx)
```typescript
export const metadata: Metadata = {
  title: "My App",
  description: "App description",
};
```

### Dynamic (page.tsx)
```typescript
export async function generateMetadata({ params }) {
  const data = await fetchData(params.id);
  
  return {
    title: `${data.title} | My App`,
    description: data.description,
  };
}
```

---

## ⏳ Loading States

### Automatic (loading.tsx)
```typescript
// app/loading.tsx
export default function Loading() {
  return <div className="skeleton h-10 w-full" />;
}
```

### Manual (Suspense)
```tsx
import { Suspense } from "react";

<Suspense fallback={<Loading />}>
  <AsyncComponent />
</Suspense>
```

---

## ❌ Error Handling

### Error Boundary (error.tsx)
```typescript
"use client"; // Required for error boundaries

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Not Found (not-found.tsx)
```typescript
import { notFound } from "next/navigation";

export default async function Page({ params }) {
  const data = await fetchData(params.id);
  
  if (!data) {
    notFound(); // ← Shows not-found.tsx
  }
  
  return <div>{data.title}</div>;
}
```

---

## 🔄 Cache Revalidation

```typescript
import { revalidatePath, revalidateTag } from "next/cache";

// After mutation
revalidatePath("/items");              // Revalidate specific path
revalidatePath("/items/[id]", "page"); // Revalidate dynamic route
revalidateTag("items");                // Revalidate by tag
```

---

## 🎭 Dynamic Routes

```
app/
├── blog/
│   ├── [slug]/
│   │   └── page.tsx    # /blog/:slug
│   └── [...all]/
│       └── page.tsx    # /blog/* (catch-all)
```

### Accessing Params
```typescript
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Use slug
}
```

---

## 🗄️ Database Transactions

### Correct Usage ✅
```typescript
await db.transaction((tx) => {
  tx.insert(items).values({ title: "Item" }).run();
  tx.insert(tags).values({ name: "Tag" }).run();
});
```

### Wrong Usage ❌
```typescript
// Missing await!
db.transaction((tx) => {
  tx.insert(items).values({ title: "Item" }).run();
});
```

---

## 🎨 Font Optimization

```typescript
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",     // ← Prevents invisible text
  variable: "--font-inter",
});

export default function Layout({ children }) {
  return (
    <html className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

---

## 🔍 Common Patterns

### Optimistic Updates
```typescript
"use client";
import { useOptimistic } from "react";

function Component({ items }) {
  const [optimisticItems, addOptimistic] = useOptimistic(
    items,
    (state, newItem) => [...state, newItem]
  );

  async function addItem(formData) {
    // Update UI immediately
    addOptimistic({ id: "temp", title: formData.get("title") });
    
    // Then update server
    await createItem(formData);
  }

  return (
    <ul>
      {optimisticItems.map(item => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  );
}
```

### Server Component + Client Component Pattern
```typescript
// page.tsx (Server Component)
export default async function Page() {
  const data = await fetchData();
  return <ClientComponent initialData={data} />;
}

// ClientComponent.tsx
"use client";
export function ClientComponent({ initialData }) {
  const [data, setData] = useState(initialData);
  // Handle interactions
}
```

---

## 🚫 Common Mistakes

### ❌ Don't
```typescript
// Using fetch in Client Component for data fetching
"use client";
export default function Page() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData);
  }, []);
}
```

### ✅ Do
```typescript
// Server Component fetches, passes to Client
// page.tsx (Server)
export default async function Page() {
  const data = await getData();
  return <ClientList initialData={data} />;
}

// ClientList.tsx (Client)
"use client";
export function ClientList({ initialData }) {
  const [data, setData] = useState(initialData);
  // Handle interactions
}
```

---

### ❌ Don't
```typescript
// Creating API routes for simple mutations
// app/api/items/route.ts
export async function POST(request) {
  const body = await request.json();
  await db.insert(items).values(body);
  return Response.json({ success: true });
}
```

### ✅ Do
```typescript
// Use Server Actions instead
"use server";
export async function createItem(formData: FormData) {
  await db.insert(items).values({
    title: formData.get("title"),
  });
  revalidatePath("/items");
}
```

---

### ❌ Don't
```typescript
// Manual loading states everywhere
const [loading, setLoading] = useState(true);
useEffect(() => {
  fetchData().then(data => {
    setData(data);
    setLoading(false);
  });
}, []);
```

### ✅ Do
```typescript
// Use loading.tsx for automatic loading UI
// app/loading.tsx
export default function Loading() {
  return <Skeleton />;
}

// page.tsx
export default async function Page() {
  const data = await getData(); // Automatic loading UI
  return <div>{data}</div>;
}
```

---

## 🎯 Performance Tips

1. **Keep Client Components Small**
   - Only mark interactive components as `"use client"`
   - Push `"use client"` as far down the tree as possible

2. **Use `cache()` for Deduplication**
   ```typescript
   export const getData = cache(async () => {
     return db.select().from(table);
   });
   ```

3. **Parallel Data Fetching**
   ```typescript
   const [a, b, c] = await Promise.all([
     getData1(),
     getData2(),
     getData3(),
   ]);
   ```

4. **Font Display Swap**
   ```typescript
   const font = Font({ display: "swap" });
   ```

5. **Image Optimization**
   ```tsx
   import Image from "next/image";
   <Image src="..." alt="..." width={500} height={300} />
   ```

---

## 📦 Project Structure

```
src/
├── app/                    # App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   └── [routes]/          # Route folders
│
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── features/         # Feature-specific components
│
└── lib/                  # Utilities
    ├── actions.ts        # Server Actions
    ├── api.ts            # Data fetching functions
    ├── db.ts             # Database connection
    └── utils.ts          # Helper functions
```

---

## 🔗 Quick Links

- [App Router Docs](https://nextjs.org/docs/app)
- [Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [Loading UI](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)

---

**Pro Tip:** Use TypeScript! Next.js has excellent TypeScript support and will catch many errors at compile time.

