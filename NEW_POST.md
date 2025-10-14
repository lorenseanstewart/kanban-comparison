---
title: "React-by-Default, Tested: Same App, Eight Builds, 3-18x Smaller Bundles"
date: "2025-10-16"
description: "Building the same Kanban app in 8 frameworks reveals 3-18x bundle differences and why mobile performance demands better defaults."
excerpt: "React-by-default has costs. I measured them."
tags: ["React", "Vue", "Svelte", "Solid", "Qwik", "Angular", "Marko", "Frontend"]
---

# React-by-Default, Tested: Same App, Eight Builds, 3-18x Smaller Bundles

Last month, I argued that React-by-default is killing frontend innovation by prioritizing network effects over technical merit. Commenters called it exaggeration without data. Challenge accepted: I built the same Kanban app across eight frameworks to measure the real costs. Each build uses the same database, features, and UI so the comparison stays fair. This builds on "[React Won by Default](/blog/react-won-by-default)," which argued for deliberate framework choices.

> Before diving in, a reminder from my [Progressive Complexity Manifesto](/blog/progressive-complexity-manifesto): The frameworks compared here represent Level 5 complexity. They are powerful tools for when you need unified client-side state, a lot of reactivity, and/or client-side navigation. But most applications thrive at lower levels. For instance, Level 4 (server-rendered HTML enhanced with HTMX, vanilla TS, and an occasional Web Component using Lit) can handle complex, reusable interactive elements and go surprisingly far for many apps, often without needing a full framework. This often delivers even smaller bundles and much simpler codebases. This post focuses on Level 5 options for cases that demand them, while remembering simpler paths often suffice.

I'm a firm believer in choosing the best tool for the job. That means understanding your product's constraints and the available options. For my team, we're building tools for real estate agents that work seamlessly on desktops and in the field. Think open houses, parking lots, or spotty cellular signals. No native apps means web performance is everything. More broadly, this should be the default mindset: Engineer apps that load quickly on mobile devices, even away from WiFi. When someone pulls up your app in a grocery store line or while waiting in their car, every second counts. Slow loads damage your brand (and the web!). The good news is that if you build an app that performs well on mobile and cellular networks, the desktop experience on WiFi will be excellent by default.

The difference? Thoughtful engineering versus blind implementation. Choose poorly early on, and you're locked into bloated tech that struggles on mobile. Let's see how Next.js, Nuxt, Analog (Angular), Marko, SolidStart, SvelteKit, and Qwik City compare. Bundle sizes varied by about 18x (from 7 kB to 153 kB), which matters significantly on cellular networks.

**Jump to**: [Repository](https://github.com/user/kanban-comparison)

## The Experiment Setup

I built a Kanban board application eight times, once in each of these frameworks: **Next.js 15** (React 19) as the baseline representing React's Virtual DOM approach, **Next.js 15 + React Compiler** to test whether optimization can close the gap, **Nuxt 4** (Vue 3) for Vue's reactive refs with SSR-first developer experience, **Analog** (Angular 20) using Angular's modern signals API with meta-framework tooling, **Marko** (@marko/run) for streaming SSR with fine-grained reactivity, **SolidStart** (SolidJS 1.9) for fine-grained reactivity through signals, **SvelteKit** (Svelte 5) for compile-time optimization with runes, and **Qwik City** for resumability instead of hydration.

Each implementation includes the exact same features: board creation and listing pages, four fixed lists per board (Todo, In Progress, QA, Done), full CRUD operations for cards, drag-and-drop card reordering within lists and movement between lists, assignee assignment from a static user list, tag management, comments on cards with authorship tracking, completion status toggles, optimistic UI updates for instant feedback, and server-side form validation using Valibot.

All eight apps share the same foundation. The database is SQLite with Drizzle ORM using an identical schema across all implementations. Styling comes from Tailwind CSS v3 plus DaisyUI to keep the UI consistent. Each framework implementation contains roughly 17 components. Most importantly, every app performs real database queries against relational data (boards → lists → cards → tags/comments/users) rather than working with hardcoded arrays.

Here's how the tech stacks compare:

| Category             | Next.js                          | Nuxt                         | Analog                       | Marko                        | SolidStart                   | SvelteKit                    | Qwik                         |
| -------------------- | -------------------------------- | ---------------------------- | ---------------------------- | ---------------------------- | ---------------------------- | ---------------------------- | ---------------------------- |
| **Framework**        | Next.js 15 (App Router)          | Nuxt 4                       | Analog (Angular)             | @marko/run                   | SolidStart 1.0               | SvelteKit + Svelte 5         | Qwik City                    |
| **UI Library**       | React 19                         | Vue 3                        | Angular 19                   | Marko 5                      | SolidJS 1.9                  | Svelte 5                     | Qwik                         |
| **Reactivity Model** | Virtual DOM                      | Reactive refs                | Signals + Zone.js            | Signals (fine-grained)       | Signals (fine-grained)       | Runes (compile-time)         | Signals + Resumability       |
| **Data Fetching**    | Server Components                | `useAsyncData` / `useFetch`  | `injectLoad` + DI            | Route data handlers          | `createAsync` with cache     | `load` functions             | `routeLoader$`               |
| **Mutations**        | Server Actions                   | API routes (`server/api/*`)  | `ApiService` + RxJS          | POST handlers                | Server functions             | Form actions                 | Server actions               |
| **Database**         | Drizzle ORM + better-sqlite3     | Drizzle ORM + better-sqlite3 | Drizzle ORM + better-sqlite3 | Drizzle ORM + better-sqlite3 | Drizzle ORM + better-sqlite3 | Drizzle ORM + better-sqlite3 | Drizzle ORM + better-sqlite3 |
| **Styling**          | Tailwind CSS v3 + DaisyUI        | Tailwind CSS + DaisyUI       | Tailwind CSS + DaisyUI       | Tailwind CSS + DaisyUI       | Tailwind CSS + DaisyUI       | Tailwind CSS + DaisyUI       | Tailwind CSS + DaisyUI       |
| **Drag & Drop**      | @dnd-kit/core, @dnd-kit/sortable | vuedraggable                 | @angular/cdk                 | Native HTML5                 | @thisbeyond/solid-dnd        | svelte-dnd-action            | Native HTML5                 |
| **Build Tool**       | Turbopack                        | Vite                         | Vite + Angular               | Vite                         | Vinxi                        | Vite                         | Vite + Qwik optimizer        |

This isn't a todo list with hardcoded arrays. It's a real app with database persistence, complex state management, and the kind of interactions teams build every day.

> **Fairness Check**: Pinned versions, identical data volume on Board page, normalized CSS/icon handling (treeshake/purge). All measurements use Chrome Lighthouse with mobile emulation.

## Why Bundle Size Matters on Cellular

Before we look at the numbers, let's understand why they matter in the real world.

A 113 kB difference at 3G speeds (750 kbps) means 1.2 seconds just for download. Add parse and execution time on a mobile CPU and you're looking at another 500ms to 1 second. Total real-world difference: 1.5 to 2 seconds between frameworks.

On 4G (10 mbps) the gap is less dramatic but still noticeable. On spotty connections, the difference becomes painful. A real estate agent pulls up your app in a parking lot between showings, or at an open house with 30 other people hammering the same cell tower. Every kilobyte you ship is a tax on their time.

**"But it's cached after the first load!"** This objection misses reality. Every time you deploy new code (and hopefully you deploy often), users download the bundle again. Cache busting is standard practice for a reason. Your users will remember how long they're made to wait before being able to use your app. First impressions matter, but so do second, third, and tenth impressions. Each deployment is another opportunity for brand damage.

The pattern is clear: Rethinking core assumptions (streaming SSR, Virtual DOM, hydration) yields 3x to 18x bundle size improvements, not incremental 10% gains.

> **The Hydration Cost**: Traditional frameworks re-execute all components on the client just to attach event listeners. Qwik eliminates this entirely through resumability.

## Bundle Size Reality Check

### The Numbers

Production builds measured by JavaScript transferred over the network (gzipped):

| Framework              | Homepage | Board Page | Difference from Next.js   |
| ---------------------- | -------- | ---------- | ------------------------- |
| **Marko**              | 7 kB     | 29 kB      | **~18x smaller**          |
| **SolidStart**         | 30 kB    | 41 kB      | **~4.1x smaller**         |
| **SvelteKit**          | 42 kB    | 59 kB      | **~2.6x smaller**         |
| **Qwik City**          | 44 kB    | 59 kB      | **~2.6x smaller**         |
| **Next.js + Compiler** | 120 kB   | 153 kB     | 3% smaller than standard  |
| **Next.js**            | 124 kB   | 153 kB     | baseline                  |
| **Nuxt**               | 131 kB   | 132 kB     | 14% smaller               |
| **Analog**             | 138 kB   | 150 kB     | 2% smaller                |

**Key Insights**:

- Marko delivers the smallest bundle at just 7 kB for the homepage, an astounding ~18x smaller than Next.js
- SolidStart follows at 30 kB, nearly 4x smaller than Next.js
- SvelteKit and Qwik are at 42-44 kB, still about 3x smaller than React
- React Compiler optimization saves only 4 kB and doesn't fundamentally change the picture
- The pattern is clear: streaming SSR with fine-grained reactivity (Marko), eliminating Virtual DOM overhead (Svelte), using fine-grained reactivity (Solid), or adopting resumability (Qwik) yields 3-18x improvements

> **The Virtual DOM Tax** (from Part 1): React's overhead isn't abstract. It's 113 kB paid on every mobile visit. This is the "innovation ceiling" we wrote about: constraints baked into the model.

## Does Complexity Buy You Anything?

If React's bundles are 3x larger, surely the extra code delivers commensurate benefits. Let's look at what you're actually shipping.

### The Rules Tax

React's larger bundles come with more conceptual complexity. Here's how state management, effects, and data fetching compare:

**1. State Management**

```jsx
// React - useState with functional updates to avoid stale closures
const [count, setCount] = useState(0);
setCount((prev) => prev + 1);

// Solid - getter/setter pattern, explicit read/write
const [count, setCount] = createSignal(0);
setCount(count() + 1);

// Svelte - looks like normal variables
let count = $state(0);
count = count + 1;

// Vue/Nuxt - .value access for reactivity
const count = ref(0);
count.value = count.value + 1;

// Qwik - .value property, serializable
const count = useSignal(0);
count.value = count.value + 1;

// Angular/Analog - getter/setter like Solid
const count = signal(0);
count.set(count() + 1);
```

**2. Effects with Dependencies**

```jsx
// React - manual dependency array (common source of bugs)
useEffect(() => {
  console.log(count);
}, [count]); // Forget this? Stale closure. Add too much? Infinite loop.

// Solid - automatic tracking
createEffect(() => {
  console.log(count()); // Automatically subscribes to count
});

// Svelte - automatic tracking
$effect(() => {
  console.log(count); // Automatically subscribes to count
});

// Vue/Nuxt - explicit or automatic
watch(
  () => count.value,
  (val) => console.log(val)
); // explicit
watchEffect(() => console.log(count.value)); // automatic

// Qwik - explicit tracking
useTask$(({ track }) => {
  track(() => count.value);
  console.log(count.value);
});

// Angular/Analog - automatic tracking
effect(() => {
  console.log(count()); // Automatically subscribes
});
```

**3. Server Data Fetching**

```tsx
// Next.js - async Server Component (most "magical")
// Looks like client code but runs on server. No explicit separation,
// no clear data contract. Just await in a component and it works.
export default async function Page() {
  const board = await db.query.boards.findFirst();
  return <div>{board.name}</div>;
}

// SvelteKit - load functions (clearest separation)
// Explicit server/client boundary. Data loading is separate from rendering.
export async function load() {
  const board = await db.query.boards.findFirst();
  return { board };
}

// SolidStart - streaming with Suspense
// Explicit async resource with streaming support
const board = createAsync(() => getBoard());
<Suspense>{board()?.name}</Suspense>;

// Qwik - automatic serialization
// $ suffix marks server-only code, automatically serialized
export const useBoard = routeLoader$(async () => {
  return await db.query.boards.findFirst();
});

// Nuxt - built-in caching
// Composable with explicit key and built-in deduplication
const { data: board } = await useAsyncData("board", () =>
  db.query.boards.findFirst()
);

// Analog - DI with server data
// Dependency injection brings Angular patterns to server data
export const load = injectLoad(() => {
  const service = inject(BoardService);
  return service.getBoard();
});
```

The pattern emerges: React has more rules and hidden complexity. Most alternatives are conceptually simpler once learned. Svelte is most approachable (looks like enhanced HTML/JS). No rules of hooks, no dependency arrays, no manual optimization in alternatives (Angular carries some conceptual weight, but signals reduce boilerplate compared to RxJS-everywhere).

### Real-World Developer Experience

Beyond syntax, here's how these frameworks differ in daily development:

**Ecosystem Maturity**

- **React/Next.js**: Massive ecosystem, extensive documentation, largest hiring pool, most third-party libraries
- **Vue/Nuxt**: Strong ecosystem, mature tooling, good community support
- **Angular/Analog**: Enterprise-grade tooling, comprehensive framework, steep learning curve
- **Svelte/SvelteKit**: Growing ecosystem, excellent DX, smaller but quality library selection
- **Solid/SolidStart**: Smaller ecosystem, React-like patterns ease migration, newer tooling
- **Qwik**: Smallest ecosystem, most different mental model, cutting-edge approach

**Drag-and-Drop Implementation**

- **Next.js**: `@dnd-kit/core` and `@dnd-kit/sortable` (most popular React solution, requires sensors, collision detection, context providers)
- **SolidStart**: `@thisbeyond/solid-dnd` (similar API to dnd-kit, less boilerplate)
- **SvelteKit**: `svelte-dnd-action` (directive-based, built-in animations)
- **Nuxt**: `vuedraggable` (component wrapper, simple integration)
- **Qwik**: Native HTML5 drag & drop (no library needed, serializable handlers)
- **Analog**: `@angular/cdk` (most feature-rich, enterprise-grade)

**Form Handling & Optimistic Updates**

- **Next.js**: Server Actions with manual optimistic state management
- **SvelteKit**: Form Actions with `use:enhance` for progressive enhancement
- **SolidStart**: Server functions with `action()` and `useSubmission()`
- **Nuxt**: `$fetch` to API routes with reactive state updates
- **Qwik**: `routeAction$` with resumable forms
- **Analog**: `ApiService` with RxJS observables

**Code Size Reality**
SolidStart and SvelteKit require about 20-30% less code for the same functionality due to automatic reactivity. No need for `useMemo`, `useCallback`, or `React.memo`. No dependency arrays to maintain. Performance is the default, not something you optimize for later.

The ecosystem argument is changing. Building exactly what you need is often faster and leaner than integrating kitchen-sink libraries. That date picker with every locale? You need 3 features, you're shipping 300.

## Can Compiler Optimization Save React?

The React team recognizes the complexity problem. Their solution: the React Compiler, an experimental tool that automatically handles memoization to reduce re-renders.

### What the Compiler Does

The React Compiler analyzes your code and inserts `useMemo` and `useCallback` automatically. It's React admitting that manual optimization is too hard, so they're automating it.

### Our Results

The compiler added 5 kB to the bundle (153 kB vs 148 kB) while providing roughly 3% savings on re-renders. It's still experimental and doesn't address the fundamental issue: Virtual DOM overhead remains. The compiler can't eliminate dependency arrays for useEffect. You still need to understand hooks, closures, and React's rendering model.

### The Irony

React needs a compiler to approach what Solid does by default. SolidStart has no Virtual DOM to optimize because signals eliminate re-renders at the source. SvelteKit's compiler eliminates much of the runtime overhead at build time. Qwik eliminates hydration cost through resumability but requires serializable code.

React's compiler tries to optimize the Virtual DOM. The other frameworks questioned whether you need a Virtual DOM at all.

## Performance Reality: What Lighthouse Hides

Mobile performance scores on the Board page (averaged over 5 runs):

| Framework              | Score | FCP (ms) | LCP (ms) | TBT (ms) | CLS | Bundle Size |
| ---------------------- | ----- | -------- | -------- | -------- | --- | ----------- |
| **Marko**              | 100   | 53       | 53       | 0        | 0   | 29 kB       |
| **SolidStart**         | 100   | 60       | 60       | 0        | 0   | 41 kB       |
| **SvelteKit**          | 100   | 66       | 66       | 0        | 0   | 59 kB       |
| **Analog**             | 100   | 325      | 325      | 0        | 0   | 150 kB      |
| **Qwik**               | 100   | 521      | 521      | 0        | 0   | 59 kB       |
| **Nuxt**               | 98    | 1,579    | 1,579    | 0        | 0   | 132 kB      |
| **Next.js**            | 97    | 2,157    | 2,157    | 0        | 0   | 153 kB      |
| **Next.js + Compiler** | 97    | 2,163    | 2,163    | 0        | 0   | 153 kB      |

**Key Metrics:**

- **FCP** (First Contentful Paint): When the first content appears
- **LCP** (Largest Contentful Paint): When the main content is visible
- **TBT** (Total Blocking Time): How long the main thread is blocked
- **CLS** (Cumulative Layout Shift): Visual stability (0 = perfect)

These metrics hide the real story. All frameworks achieve near-perfect scores (97-100), but look at the actual paint times. Marko renders in 53ms. SolidStart renders in 60ms. Next.js takes 2,157ms. That's **40x slower** than Marko for the same functionality.

### Where the Difference Shows

All frameworks feel instant in optimal conditions. The twist: Smaller bundles (Marko, Solid, Svelte, Qwik) win dramatically on slow networks and mid-tier devices.

On desktop with WiFi, all these frameworks are fast. On cellular with a mid-tier phone, 3-18x smaller bundles create measurably better UX. The 124 kB you saved doesn't just download faster. It also parses and executes faster on mobile CPUs.

**Hydration vs Resumability:**

- **Traditional (React, Solid, Svelte, Vue, Angular)**: Download bundle → Parse JS → Execute all components → Attach event listeners (hydration)
- **Qwik**: Download minimal JS → Resume from serialized HTML → Load interaction handlers on demand

Qwik's unique advantage: Resumability means instant interactivity without hydration overhead. Traditional frameworks must re-execute components just to wire up event listeners. Qwik serializes everything to HTML and picks up where the server left off.

## But Is This App Complex Enough?

Let me address the obvious critique upfront.

**What this app IS**: This is a real application with genuine database queries using SQLite and Drizzle ORM, not hardcoded arrays. It has complex interactions like drag-and-drop with position tracking across lists. There are multiple routes and modals covering home, board detail, card editing, and comments. The data model is relational, flowing from boards to lists to cards to tags, comments, and users. Optimistic updates provide instant UI feedback before server confirmation. Form handling and validation use Valibot schemas on the server side. State management spans across components with shared state, event handlers, and data flow. Each framework implementation contains roughly 17 components including modals, cards, lists, forms, and charts.

**What this app ISN'T**: This isn't a full production application with authentication, real-time collaboration, pagination, or advanced permissions. It's not a toy example like a counter or a basic todo list with five hardcoded items. And it's not enterprise-scale handling thousands of concurrent users or complex business workflows.

**Why the comparison is still valid**:

The bundle size differences you see aren't from features. They're pure framework overhead. Every app ships the same UI components, the same database logic, the same interactions. The 112 kB gap between Next.js and SolidStart? That's React's Virtual DOM, reconciliation logic, and runtime compared to Solid's fine-grained reactivity.

This represents the kind of internal tool or MVP complexity that small and medium teams build constantly. If you're building a CRM for your sales team, a task manager for your agency, or an admin dashboard for your product, this is your scale.

And here's the thing: at larger scale, these differences compound. More features mean more components. More components mean more Virtual DOM overhead in React, but the same lean compiled output in Svelte. More state updates mean more reconciliation work in React, but the same surgical updates in Solid. The fundamentals (reactivity model, optimization requirements, bundle composition) don't change at scale. If anything, they become MORE important with complexity.

This isn't Trello. But it's not a toy either. It's the kind of real-world app that teams without unlimited resources build. And for those teams, the 3x bundle size difference matters.

## The Verdict: Choose Based on Context

I'm not here to say "SolidStart is better!" or "everyone should abandon React." The point is to choose deliberately based on your constraints, not defaults.

**When Next.js still makes sense**: If you have a large existing React codebase, migration costs may outweigh the benefits of switching. When your users are exclusively on desktop with fast WiFi connections, the bundle size difference matters less. If your team's expertise is heavily weighted toward React and retraining isn't realistic in your timeline, sticking with what works makes sense. Sometimes organizational politics prevent technical decisions based purely on merit. This is real, and sometimes you have to accept it.

**Reality check on common objections**:

"But hiring!" Competent developers learn frameworks in days, not months. If someone can't pick up Svelte or Solid in a week, they probably struggle with React too. Most of these alternatives are actually easier to learn than React because they have fewer rules: no rules of hooks, no dependency arrays, no manual memoization dance.

"But ecosystem!" React's massive ecosystem is both a strength and a trap. Most third-party libraries are bloat disguised as convenience. That date picker library includes every locale and format option you'll never use. You need 3 features, you're shipping 300. Building exactly what you need is often faster than integrating kitchen-sink dependencies, and results in dramatically smaller bundles. React's "ecosystem advantage" often means shipping more code than necessary.

"But it's risky!" Shipping 3x larger bundles to mobile users on cellular connections is the actual risk. Slow load times damage your brand and cost conversions. The "safe choice" has measurable costs.

**Why you should seriously consider the alternatives**: The mental models are simpler without rules of hooks, dependency arrays, or manual memoization. Performance comes by default with 3x smaller bundles requiring no optimization work. These frameworks are easier to learn because Solid, Svelte, and Vue have fewer concepts than React. Qwik requires new thinking but delivers unique benefits. Mobile web matters with real users on phones, cellular connections, and mid-tier devices. You'll write less code, ship less JavaScript, and debug fewer framework quirks. Greenfield projects deserve choices made on merit rather than defaults.

**These alternatives are especially compelling** for mobile-first applications where bundle size directly impacts user experience. They matter for the growing demographic of people who prefer phones over computers. Mobile professionals like real estate agents, field service workers, healthcare staff, delivery drivers, and sales reps benefit most. Teams building internal tools or MVPs without enterprise politics constraining decisions can move faster. Developers who value technical excellence over popularity contests will appreciate the engineering quality.

**Choosing among the alternatives**:

Choose **SolidStart** if you want JSX familiarity, fine-grained reactivity, and the most React-like alternative. Easiest migration path for React teams.

Choose **SvelteKit** if you want the most approachable syntax, progressive enhancement by default, and minimal framework overhead. Best for developers from any background.

Choose **Qwik City** if you want resumability (zero hydration cost), instant interactivity, and the best time-to-interactive. Accept serialization constraints as the trade-off for performance.

Choose **Nuxt** if your team prefers Vue, wants SSR-first developer experience with `useFetch`, and values Vue's reactivity model with a mature ecosystem.

SolidStart, SvelteKit, and Qwik deliver 3x smaller bundles than React with automatic reactivity and simpler mental models. Nuxt provides a middle ground with smaller bundles than React and Vue's familiar reactivity.

> **Remember**: As discussed in my [Progressive Complexity Manifesto](/blog/progressive-complexity-manifesto), these Level 5 frameworks are only necessary when you need unified client-side state and complex reactivity. Most apps can thrive at lower levels with simpler tools like HTMX and web components.

**The bigger picture**: When developers have real alternatives, everyone wins. React wouldn't be adding a compiler if SolidStart and Svelte weren't proving that automatic optimization matters. The entire ecosystem improves when we stop accepting "good enough" as the ceiling.

**Personal note**: For my team, I'm choosing SolidStart because my department is resistant to change and deeply familiar with React and Next.js. SolidStart is my best shot at persuading other devs at work. The JSX syntax is familiar, the migration path is clear, and the performance wins are undeniable. Qwik is technically superior on paper, but its different paradigm would face too much resistance in an organization that's risk-averse. For personal projects and joy, I reach for SvelteKit and Nuxt. Their developer experience just feels right, the code flows naturally, and building things is fun again.

## Key Takeaways (TL;DR)

> **Bundle Sizes**: Marko leads at just 7 kB homepage/29 kB board (~18x smaller than Next.js), SolidStart at ~30 kB/41 kB (~4x smaller), SvelteKit ~42 kB/59 kB (~3x smaller), Qwik ~44 kB/59 kB (~3x smaller), Nuxt ~131 kB/132 kB, Next.js ~124 kB/153 kB, Analog ~138 kB/150 kB
>
> **Best Choice for React Teams**: SolidStart delivers exceptional performance with JSX familiarity. Easier migration path than Svelte or Qwik, dramatically better performance than staying on React.
>
> **Performance**: All frameworks fast in optimal conditions. On cellular/mobile, Marko's 124 kB advantage over Next.js = 1.5 to 2s faster load times. Every deployment, every user.
>
> **Complexity**: React has most rules (hooks, deps). Alternatives eliminate dependency arrays and manual optimization. Marko and SolidStart use signals, Svelte compiles away reactivity overhead. Conceptually simpler once learned.
>
> **Ecosystem Trade-off**: Next.js wins on maturity and libraries. But alternatives require 20-30% less code due to automatic reactivity, and smaller focused libraries often beat kitchen-sink dependencies.
>
> **App Complexity**: Mid-complexity (not a toy, not Trello-scale). Representative of typical internal tools/MVPs that teams without unlimited resources build.
>
> **The Pattern**: Rethink fundamentals (streaming SSR, Virtual DOM alternatives, fine-grained reactivity, resumability). Get 3-18x better results, not 10%.

## Conclusion: The Garden We Could Grow

Competition drives innovation. React is evolving. React Compiler is proof they recognize the problem. But SolidStart, SvelteKit, Qwik, and Marko represent what's possible when you rethink fundamentals. Fine-grained reactivity, compile-time optimization, resumability, and Vue's reactive refs are the future.

As I wrote in Part 1: Stop planting the same seed by default. The garden we could cultivate through diverse framework exploration would be more resilient and more innovative than the monoculture we've drifted into.

React-by-default has real costs. I measured them: 3x larger bundles, more complexity, lower performance ceilings on mobile. For teams serving mobile professionals on cellular networks, these costs are paid on every visit.

Next time you start a new NextJS, Nuxt, or Analog project, pause. Ask yourself: Is there any reason to make my app less versatile? Building an app that works well on mobile isn't a terrible challenge if you make good architectural decisions at the beginning of a project. The right choice early on means your app performs well everywhere, not just on desktop WiFi.

The choice is ours to make. Your next project deserves to be engineered, not merely implemented. The ecosystem deserves the innovation only diversity can provide.

## Call to Action

**Try it yourself**: Clone the [repository](https://github.com/user/kanban-comparison), build all eight implementations, and test them on a throttled 3G connection in Chrome DevTools. When mobile web is your only option, the numbers tell a clear story.

**Share your experience**: Have you tried Marko, SolidStart, SvelteKit, Qwik, or Nuxt? What framework would you choose for a mobile-first project and why? I'd love to hear your thoughts and results in this [Hacker News thread](link here).

**Keep exploring**: The full metrics data and measurement methodology are available in the repository for you to verify, reproduce, or extend. Build your own comparison and share your findings.

The real winner? Teams who can choose the right tool for the job instead of defaulting to the most popular one.
