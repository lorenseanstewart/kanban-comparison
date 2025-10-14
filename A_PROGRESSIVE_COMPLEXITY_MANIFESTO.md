---
title: "A Progressive Complexity Manifesto"
date: "2025-08-10"
excerpt: "A manifesto for progressive web complexity. Reject the false binary between static sites and SPAs. Embrace the powerful middle ground with server-rendered HTML, HTMX, and intentional complexity escalation."
tags: ["HTMX", "Frontend", "Architecture", "JavaScript", "Web Components"]
topPost: true
---

# A Progressive Complexity Manifesto

> **We declare the end of the false binary.** For too long, we've been forced to choose between static sites that can't interact and SPAs that can't ship fast. We reject this constraint. There is a vast, powerful middle ground that the industry has abandoned, and we're taking it back.

**GitHub Repository**: [Clone and run the demo locally](https://github.com/lorenseanstewart/progressive-complexity/blob/main)

**Technical Guide**: [See the implementation](https://github.com/lorenseanstewart/progressive-complexity/blob/main/README.md)

## The Great Deception: Static vs. SPA

We were taught a false binary. They said our choices were:

1. **Static HTML**: "Dead" pages with little to no interaction
2. **Full SPA**: "Modern" apps with baked-in complexity

**This is a false binary that limits our options.**

Between these extremes lies a vast continent of possibility that's been overlooked. Interactive, dynamic, server-rendered applications that ship fast, perform well, and stay maintainable. This isn't the distant past; this is the future we can build today.

**We're not going backwards. We're going beyond.** We also acknowledge that some products need a frontend framework (FEF going forward) from day one: real‑time collaboration, complex client graphs, offline‑first, heavy mobile code‑sharing. The point isn’t rejection; it’s choosing the right level of complexity for the job.

## The Evidence: Real Numbers

Check out the demo app. It's an interactive application: editable table cells, pagination, search, dynamic totals, optimistic updates, error handling. The complete user experience you'd find on any modern web platform.

> **Clone and run locally**: `git clone https://github.com/lorenseanstewart/progressive-complexity && cd progressive-complexity && npm install && npm run dev`. Click any price or quantity to edit. To see optimistic updates, throttle your browser to "Slow 4G" in DevTools. You'll see the pink text appear (optimistic update) and then revert to the original text color (server response). Change any price to 99.99 to trigger an error and see the graceful error handling.

**The Result**:

- **76.5 kB total JavaScript** (21.3 kB app + 47.0 kB HTMX + 8.3 kB hx-optimistic)
- **25.8 kB gzipped** (smaller than most framework starter templates)
- **~540 lines of front-end TypeScript** (204 Web Components + 174 page utilities + 160 shared utilities)
- **Navigation and pagination work without JavaScript** search and inline editing require JS/HTMX

For context, many FEF starters ship about 200 kB of JavaScript before you write any business logic.

## The Revolution: Five Levels of Intentional Complexity

We reject the binary. We embrace the spectrum. We climb only when we must:

| Level                                      | Description                                                                                                                                                   |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1: Static HTML                             | Pure server-generated HTML with no client-side JavaScript. The foundation for all web applications.                                                           |
| 2: HTML + HTMX                             | Server-rendered HTML enhanced with HTMX for dynamic interactions without full page reloads. The sweet spot for many applications.                             |
| 3: HTMX + Vanilla JS                       | Level 2 enhanced with vanilla JavaScript for client-side polish, validation, and UX improvements that HTMX alone cannot provide.                              |
| 4: HTMX + Web Components (for example Lit) | Level 3 enhanced with Web Components for complex, reusable interactive elements while maintaining server-first architecture.                                  |
| 5: Full Framework                          | Unified client-side framework (e.g., SolidStart or NextJS) for complex reactivity, shared state, and client-side routing when a cohesive app model is needed. |

**Note on Lit:** Lit is a small library for building Web Components. It doesn’t impose routing, global state, or app architecture. Because it fits into existing HTML without changing your architecture, Lit belongs at Level 4.

**This is the revolution**: Each level exists for a reason. Each level solves problems the previous cannot. But unlike the binary choice, you can live comfortably at any level. Most _applications_ find their home at Level 3 and never need to leave. Level 2 may even fit your needs.

**The industry pushes Level 5 as the default. We reclaim Level 2 as the starting point.**

If you have only built with a FEF and are not sure where to begin, start at Level 2: server rendered HTML with HTMX. Working with minimal tools strengthens fundamentals that apply in any stack.

> **Deep Dive**: The transition from Level 4 to Level 5 deserves special attention. When isolated interactive components need to coordinate and share state, you face a critical architectural decision. Read [When Islands Should be a Continent](/blog/when-islands-should-be-a-continent) for guidance on recognizing when component coordination signals it's time for a unified framework approach.

## Principles of Precision

Hard truths, gently told:

- Complexity often masquerades as sophistication; simplicity requires confidence.
- True mastery lies not in conquering all tools, but in wielding the fewest with precision.
- Over-engineering is unclear thinking wearing a clever disguise.
- We often choose the comfort of importing solutions over the discomfort of understanding problems.
- Start where you are, not where you imagine you'll be.
- Each abstraction should simplify something; when it doesn't, we've abstracted too soon.
- The most dangerous moment comes with the first success of a complex solution, for it justifies all future complexity.

## When to Start Where

### Start at Level 2 (HTMX) if you're building:

**Consumer Products:**

- Social media feeds (Reddit, Twitter-style timelines)
- News and media sites (articles, comments, subscriptions)
- Job boards and marketplaces (search, filtering, applications)
- Educational platforms (course catalogs, learning modules)
- Forums and community sites (discussions, voting)
- Review platforms (Yelp-style ratings and search)

**Business Applications:**

- Admin panels and dashboards
- Content management systems
- Basic SaaS functionality and workflows

**Why HTMX first?** It extends HTML's capabilities without JavaScript complexity. Need a live search? Add `hx-get` and `hx-trigger` attributes. Need form validation? `hx-post` with error handling. It feels like HTML, not a framework. If you need UX polish or front end validation, step up to Level 3 and bring in some JavaScript.

New to building without a framework? Treat Level 2 as your starting point. Ship one small feature with HTMX and see how far HTML and the server can take you. Add JavaScript for small interactions, e.g. adding and removing CSS classes.

### Start at Level 5 (Framework) if you need:

- Real-time collaboration (Google Docs, Figma)
- Application-wide reactivity
- Complex client-side state graphs (trading platforms)
- Offline-first functionality
- Heavy code sharing with mobile apps

**We're not anti-framework fundamentalists.** Some problems genuinely need a FEF from day one. But many don't. The revolution isn't about rejecting tools; it's about rejecting today's defaults.

> **When to Make the Jump**: The most common mistake is staying at Level 4 when component coordination becomes the primary challenge. If you find yourself building complex state synchronization between isolated components or recreating framework patterns in userland, read [When Islands Should be a Continent](/blog/when-islands-should-be-a-continent) to understand when Level 5 actually simplifies your architecture.

## FAQ: Common Concerns

**"I have never built without a framework. Where do I start?"**
Start at Level 2. Pick one feature (search, form, inline edit) and ship it with server rendered HTML + HTMX. Using minimal tools strengthens fundamentals you will use in any stack: HTML semantics, HTTP, forms, and progressive enhancement. Add interactivity with vanilla JavaScript. You will be surprised at how much you can do with so little.

**"But everyone knows X framework!"**  
Everyone knows HTML better, or can learn it in a day. HTMX can be learned in an afternoon. Backend developers can contribute immediately. Junior developers learn web fundamentals instead of framework abstractions.

**"What about component reuse and our component library?"**  
Server-side templates work great. [NestJS with ETA](/blog/eta-htmx-lit-stack), Astro, Go with Templ, Rails partials, Laravel Blade, and Django templates are proven at scale. You can extract reusable server components without client-side complexity. Level 4 Web Components integrate with any framework.

When you do need client side components, Lit is a good fit. It is Web Components, not a framework, and it fits into existing HTML without forcing a new architecture.

**"What about SEO and performance?"**  
Server rendered HTML is often faster and more friendly to SEO than client only SPAs. You get meaningful content on first paint, not loading spinners. Fullstack FEFs can do this too, but you pay a complexity tax.

**"What if we need to scale up?"**
That is the point of Progressive Complexity. With tools like Astro Islands, you can add FEF components exactly where needed while keeping the rest simple. It is not a cliff, it is a ramp. However, when islands need significant coordination, the architecture can become more complex than a unified framework. See [When Islands Should be a Continent](/blog/when-islands-should-be-a-continent) for specific guidance on this transition.

**"What about developer experience?"**  
Better than ever. TypeScript throughout with full type inference. Instant hot reload. Debugging is simpler without a virtual DOM or complex state trees. The server handles code splitting. You are not wrestling with complexity. You are building.

**"But we need type safety!"**  
Progressive Complexity supports end to end type safety with TypeScript. Define clean domain types for your entities and API responses. Types flow from database to server functions to templates to client utilities. You can add small utility types to improve HTMX integration when needed.

**"How do we test this?"**  
Unit tests work well for server functions with Jest or Vitest. Integration tests can verify HTML responses with Supertest. E2E tests with Playwright or Cypress work smoothly with HTMX since there is no need to mock complex client state.

## Framework Developer's Guide: Your Skills, Revolutionized

### For FEF Developers

**Your expertise translates directly** - we're not asking you to abandon your knowledge, we're showing you how to wield it in a different manner:

**Component Composition → Server Templates**

```jsx
// React Component
function ProductList({ products, filters }) {
  return (
    <div>
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={handleEdit}
        />
      ))}
    </div>
  );
}

// Progressive Complexity (Server Template)
<!-- ProductList.astro -->
<div>
  {products.map(product => (
    <ProductCard product={product} />
  ))}
</div>
```

Same component thinking, rendered on the server with full data available.

**State Management → URL Parameters + Server State**

```jsx
// React: frontend state synchronization
const [filters, setFilters] = useState({});
const [sort, setSort] = useState("name");
const [page, setPage] = useState(1);

// Progressive Complexity: Bookmarkable by default, server state only
// URL: /?page=2&sort=price&filter=electronics
// Server reads URL, returns filtered HTML
```

Your state is now shareable, bookmarkable, and SEO-friendly by default.

**useEffect → Not Needed**

```jsx
// React: Effect synchronization complexity
useEffect(() => {
  fetchProducts().then(setProducts);
}, [filters, sort, page]);

// Progressive Complexity: Server renders complete state
// No effects, no race conditions, no cleanup
```

**Context/Redux → Server Session**

```jsx
// React: Prop drilling or complex context setup
<ThemeContext.Provider value={theme}>
  <UserContext.Provider value={user}>
    <App />
  </UserContext.Provider>
</ThemeContext.Provider>

// Progressive Complexity: Server handles it
// Session data available to all components during render
// Type-safe with TypeScript from server to template
```

### What You Gain, Not What You Lose

**Immediate Benefits**: HTML is already interactive, so no hydration mismatches. You ship 25.8 kB gzipped JavaScript with no bundle size anxiety. The server is your single source of truth, eliminating state synchronization bugs. You write less code and ship faster, while your backend team can contribute immediately. It's easier to get real first contentful paint, rather than loading spinners.

**Your Advanced Skills Still Matter**: TypeScript provides full type safety from database to DOM. Server components are still components with the same architectural thinking. Your testing skills apply directly, and you're still optimizing performance: just what actually matters. Most importantly, choosing the right complexity level is system design at its finest.

### Migration Strategy for Your Team

**1: Proof of Concept** : Pick one simple feature like search, filters, or a form. Implement it with HTMX alongside your FEF app and measure lines of code, bundle impact, and development time.

**2: Expand** : Convert 2-3 CRUD interfaces, train 1-2 backend developers to contribute, and document patterns that work for your team.

**3: Evaluate and Plan** : Compare metrics across performance, developer velocity, and code complexity. Identify features that should stay with a FEF (Level 5) and plan progressive migration for Level 2-3 features.

### The Revolutionary Truth for Framework Experts

You've mastered complex tools. That mastery isn't wasted; it's evolved. Now you can choose complexity intentionally rather than by default, ship faster when the problem doesn't require a framework, scale thoughtfully by adding complexity only where needed, and lead the revolution by showing others the power of the middle ground.

Your framework skills are your Level 5 superpower. But most problems are Level 2-4.

## The Pragmatic Path Forward

### For Your Next Project

**Start at Level 2**: Build it server-rendered with HTMX interactions  
**Stay at Level 2** until you hit a wall that HTMX can't solve  
**Escalate to Level 3 (add some TS/JS)** only when you need client-side polish HTMX can't provide
**Climb to Level 4 (bring in Web Components, for example Lit)** only when you need complex, stateful components
**Reach Level 5 (it's time for a framework)** only when a framework's power becomes indispensable

Many projects never leave Level 3. Few require Level 4 complexity. Fewer still justify Level 5.

### For Existing Teams

**FEF developers**: Clone this repository and try HTMX for your next feature. That search interface, comment system, or checkout flow? You'll be surprised how little code you need.

**Backend developers**: You already know HTML rendering. HTMX just makes it interactive. Run `npm run dev` and see how familiar it feels.

**Tech leads**: Your next project doesn't need a FEF if HTMX gets you there faster. Save your complexity budget for your actual differentiator.

## Real-World Adoption

This isn't theoretical. Companies are shipping consumer products:

- **Frontend Masters** uses server-rendered HTML and vanilla JavaScript to build an incredible video streaming platform
- **Basecamp** built HEY email client primarily server-side (consumer email service)
- **Stack Overflow** serves millions with server-rendered pages + progressive enhancement
- **Reddit** (old.reddit.com) outperforms many modern SPAs with server-side rendering
- **Laravel Livewire** and **Phoenix LiveView** power consumer-facing applications at scale
- **HTMX** has 45k+ GitHub stars (as of Aug 10, 2025) with adoption across consumer and business products

## The Technology Stack

Progressive Complexity works with any backend with a templating package:

- **Python**: Django/FastAPI + HTMX
- **Ruby**: Rails + Hotwire
- **PHP**: Laravel + Livewire
- **TypeScript/JavaScript**: Astro + HTMX (our demo)
- **Go**: Templ + HTMX
- **C#/.NET**: Razor + HTMX

Choose your backend, add HTMX, start building.

## Implementation Patterns That Work

### Smart HTMX Usage

```html
<!-- Inline Editing: Optimistic updates with OOB swaps -->
<input
  name="price"
  type="number"
  step="0.01"
  value={product.price}
  hx-patch={`/api/products/${product.id}/price`}
  hx-target={`#price-cell-${product.id}`}
  hx-swap="innerHTML"
  hx-select-oob={`#totals-summary, #view-sub-${product.id}`}
  hx-trigger="keyup[key=='Enter'] changed, blur changed"
  onkeydown="window.pageUtils.cancelOnEscape(event,this)"
  onkeyup="if(event.key==='Enter') window.pageUtils.exitEditModeAfterSubmit(this)"
  onblur="window.pageUtils.exitEditModeAfterSubmit(this)"
  data-id={String(product.id)}
  data-optimistic={JSON.stringify({
    template: `#hxopt-tpl-price`,
    errorTemplate: `#hxopt-tpl-price-error`,
  })}
/>

<!-- Pagination: Preserve URL -->
<button hx-get="/?page=2&limit=10" hx-target="#table-wrapper" hx-push-url="true">
  Next
</button>
```

```javascript
// Error Handling: Custom reversion
document.body.addEventListener("htmx:beforeSwap", (evt: any) => {
  if (evt.detail.xhr?.status >= 400) {
    evt.detail.shouldSwap = false;
  }
});
```

For optimistic updates, define global templates that can be referenced by multiple elements, enabling reusable UI patterns:

```html
<template id="hxopt-tpl-price">
  <span
    class="view optimistic-update"
    id={"view-price-" + "${data:id}"}
    tabindex="0"
    aria-live="polite"
    aria-atomic="true"
    onclick={`
      window.pageUtils.toggleEdit(${"${data:id}"}, true, 'price')
    `}
    onkeydown={`
      if (event.key === 'Enter' || event.key === ' ') {
        window.pageUtils.toggleEdit(${"${data:id}"}, true, 'price');
        event.preventDefault();
      }
    `}
  >{"${this.value}"}</span>
</template>

<template id="hxopt-tpl-price-error">
  <span
    class="view text-error"
    id={"view-price-" + "${data:id}"}
  >Error</span>
</template>
```

These templates use placeholders like `${data:id}` and `${this.value}` that hx-optimistic interpolates at runtime, allowing a single template to serve all product rows without duplication.

### Server-Side State Authority

Let the server calculate totals, handle validation, manage state. The client shows immediate feedback via hx-optimistic, but the server has the final say. This prevents data synchronization bugs. Use OOB swaps for partial updates like subtotals.

### Graceful Enhancement

Navigation and pagination work without JavaScript; HTMX enhances search and inline editing when JS is available.

## The Revolutionary Act: Choosing Your Level

**This is not compromise; this is precision.** We don't accept less. We demand exactness. The right tool for the actual problem, not the problem we assume we'll have someday.

**The revolutionary act**: Start at Level 2. Build your e-commerce site, your social platform, your news site, your marketplace with HTMX. Feel the speed, the simplicity, the joy of development that fits the problem. When you truly need more, climb. But climb with intention, not habit.

**We call upon developers**: Reject the false binary. Reclaim the middle ground. Show the industry that interactive web applications don't require megabytes of framework overhead. Prove that server-rendered HTML can be as dynamic and engaging as many SPAs.

**We call upon teams**: Question the default. When someone suggests a FEF for a product page, ask why. When someone dismisses server rendering as old fashioned, show them this repository. When someone claims you need a framework for real consumer applications, demonstrate when a simpler approach excels.

**We call upon the industry**: Let us stop selling complexity as sophistication. Let us stop defaulting to Level 5 for all problems. Teach fundamentals first. The web platform is powerful. Use it fully before adding layers.

## The Manifesto in Action

**GitHub Repository**: [Clone, explore, and run the demo](https://github.com/your-username/progressive-complexity)  
**Technical Deep Dive**: [Study the implementation](https://github.com/lorenseanstewart/progressive-complexity/blob/main/README.md)

This isn't theory. This isn't nostalgia. This is modern web development, liberated from artificial constraints.

**Join the revolution. Reclaim the middle ground. Show the world what's possible when we choose appropriately instead of conventionally.**

The web remembers what it was built for: documents that can interact, servers that can render, HTML that can live. We're bringing that power back.

**Start simple. Scale intentionally. Revolution through restraint.**
