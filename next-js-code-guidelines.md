# React / Next.js Code Guidelines

This document covers architectural and design-pattern conventions — how to
structure components, state, and data flow. For syntax-level rules
(semicolons, imports, naming, formatting), please check for a syntax
conventions md file or other syntax-related instructions in this repo.

## React

### Component API & Primitives

#### Controlled vs. Uncontrolled Components

- **Controlled** — the value lives in React state; the input is updated via
  `onChange` and React is the single source of truth
- **Uncontrolled** — the value lives in the DOM itself; read it via a `ref`
  only when needed

Default to controlled for form fields, especially when validation,
formatting, or conditional logic depends on the value. Reach for uncontrolled
for simple one-off fields, integrating with non-React widgets, or
performance-sensitive forms with many fields.

```tsx
// Controlled
function ControlledInput() {
  const [value, setValue] = useState("")

  return <input value={value} onChange={(e) => setValue(e.target.value)}/>
}

// Uncontrolled
function UncontrolledInput() {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit() {
    console.log(inputRef.current?.value)
  }

  return <input ref={inputRef}/>
}
```

#### Headless Component Patterns

Separate behavior and state logic from markup and styling. A headless
component or hook exposes state and handlers; the consumer supplies the
actual DOM and styling.

Use this for reusable interactive primitives — dropdowns, modals, tabs,
tooltips — where behavior (open/close, keyboard nav, focus management)
should stay consistent but visual design varies by consumer. Prefer a proven
headless library (Radix UI, React Aria, Headless UI) for accessible
primitives over hand-rolling one; only build a custom headless hook when no
library fits the case.

```tsx
function useDisclosure() {
  const [isOpen, setIsOpen] = useState(false)

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev)
  }
}

function Dropdown() {
  const { isOpen, toggle } = useDisclosure()

  return (
    <div>
      <button onClick={toggle}>Menu</button>
      {isOpen && <ul>...</ul>}
    </div>
  )
}
```

#### Compound Components

Give a parent component and its children an implicit shared state, usually
via context, so consumers can arrange or omit parts freely while the pieces
still work together.

Use this for components with a fixed relationship between parts — tabs, an
accordion, a menu — where a headless hook alone doesn't capture how the
pieces relate to each other. Pair it with the Headless Component Patterns
above: the hook owns the behavior, the compound components own the
composition.

```tsx
const TabsContext = createContext<TabsContextValue | null>(null)

function Tabs({ children }: { children: ReactNode }) {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
      {children}
    </TabsContext.Provider>
  )
}

Tabs.Tab = function Tab({ index, children }: TabProps) {
  const context = useContext(TabsContext)

  return null
}
```

#### Accessibility as an Architecture Concern

Treat accessibility as a structural decision, not a final pass:

- Prefer semantic HTML (`button`, `nav`, `label`) over a generic `div`/`span`
  with a click handler bolted on
- When building a custom interactive primitive, put focus management,
  keyboard navigation, and ARIA attributes in the headless layer so every
  consumer gets them for free instead of each one re-implementing them
- This is another reason to prefer established headless libraries (Radix,
  React Aria) for interactive primitives — accessibility is already solved
  at that layer

### Structure & Composition

#### Frontend Design Layers

Separate a feature into distinct layers so each piece stays easy to test and
reuse:

- **Data-access layer** — hooks that fetch or mutate data
- **Logic/orchestration layer** — the component that owns state and wires
  data-access to presentation
- **Presentation layer** — pure, prop-driven components with no data
  fetching and no business logic

```
user-profile/
  use-user.ts        (data-access layer)
  user-profile.tsx    (logic/orchestration layer)
  user-avatar.tsx     (presentation layer)
  user-bio.tsx        (presentation layer)
```

Presentational components should be pure functions of their props — if a
component needs to fetch data or branch on business rules, that logic
belongs one layer up.

#### Component Reusability

Optionally structure shared UI as a lightweight hierarchy — primitives
("atoms" like `Button`, `Input`), composed UI ("molecules" like
`SearchBar`), and feature-level components ("organisms" like `UserCard`).
This is a mental model, not a rigid folder taxonomy.

Favor composition over deep prop drilling. If a prop is passed through three
or more layers unchanged, that's the signal to either compose components
differently or lift the value into context/a store per the State Management
Strategy ladder below.

```tsx
// Prop drilling
function Page({ user }: { user: User }) {
  return <Layout user={user}/>
}
function Layout({ user }: { user: User }) {
  return <Header user={user}/>
}
function Header({ user }: { user: User }) {
  return <Avatar user={user}/>
}

// Composition
function Page({ user }: { user: User }) {
  return (
    <Layout>
      <Header>
        <Avatar user={user}/>
      </Header>
    </Layout>
  )
}
```

#### Lifting Content Up (Composition Over Internal Conditionals)

Rather than passing boolean flags into a component and branching internally
with `&&` or a ternary, let the caller decide what to render and pass the
already-resolved JSX in as `children` (or a named prop). This is sometimes
called "lifting content up" or "passing JSX as props" — the conditional
logic lives where the calling context actually knows the condition, and the
component itself stays a simple container.

```tsx
// Before: conditional logic lives inside the component
function Card({ user, showEditButton }: CardProps) {
  return (
    <div>
      <Avatar user={user}/>
      {showEditButton && <EditButton/>}
    </div>
  )
}

// After: the caller passes the resolved JSX as children
function Card({ children }: { children: ReactNode }) {
  return <div>{children}</div>
}

function Page() {
  return (
    <Card>
      <Avatar user={user}/>
      {isOwner && <EditButton/>}
    </Card>
  )
}
```

Reach for this once a component collects more than one or two boolean
"should I render X" props — that's a sign the branching belongs at the call
site, not baked into the component. It also tends to reduce unnecessary
re-renders: JSX passed in as `children` is already a created element by the
time the parent re-renders, so it won't re-render just because the parent's
own state changed.

#### Early Return for Empty/Guard States

When a component branches on a condition it owns internally — no data, an
empty list, not-yet-loaded — handle it with an early `return` in the
function body rather than a ternary or `&&` embedded in the returned JSX.
This keeps the "happy path" JSX flat and unindented, and keeps guard checks
grouped together at the top of the function instead of scattered through
markup.

This is distinct from Lifting Content Up above: use an early return for a
component's own "nothing to show" state; lift content up when the decision
instead belongs to the caller.

```tsx
// Prefer: early return in the JS body
function ListsView({ lists }: ListsViewProps) {
  if (lists.length === 0) {
    return <p>No lists yet. Create one below.</p>
  }

  return (
    <ul>
      {lists.map((list) => (
        <li key={list.id}>{list.name}</li>
      ))}
    </ul>
  )
}

// Avoid: ternary embedded in the returned JSX
function ListsView({ lists }: ListsViewProps) {
  return lists.length > 0 ? (
    <ul>
      {lists.map((list) => (
        <li key={list.id}>{list.name}</li>
      ))}
    </ul>
  ) : (
    <p>No lists yet. Create one below.</p>
  )
}
```

### State, Performance & Error Handling

#### State Management Strategy

Escalate state only as far as it needs to go:

1. **Local `useState`/`useReducer`** — default starting point for state used
   by a single component
2. **Lift state up** — when sibling components need the same state, move it
   to their nearest common parent
3. **React Context** — for low-frequency, cross-cutting state (theme, auth
   session, locale)
4. **External store** (Zustand, Redux, Jotai, etc.) — only once app-wide
   state is complex enough that Context causes prop-drilling of setters or
   unnecessary re-renders

Avoid Context for state that updates frequently (form values, animation
state) — every consumer re-renders on every change. Use a store library for
that instead.

#### Memoization Guidance

`useMemo`, `useCallback`, and `React.memo` are optimizations, not defaults.
Add them when profiling shows a real re-render cost, not preemptively —
wrapping every function in `useCallback` or every component in `React.memo`
adds cognitive overhead and can cost more than the render it's avoiding.

Common valid cases:

- An expensive computed value that would otherwise run on every render
- Stabilizing a callback passed to a memoized child, or used in a
  `useEffect` dependency array, to avoid unnecessary re-runs

#### Error Boundaries

Wrap route-level or feature-level trees in an error boundary to catch
render-time errors and show a fallback UI instead of a blank screen.

In the Next.js App Router this is largely handled by `error.tsx` files at
the route-segment level — use those instead of hand-rolling a class-based
boundary. Pair error boundaries with the try/catch rule from the
conventions doc: try/catch handles expected async failures, error
boundaries catch unexpected render-time failures.

## Next.js

### Rendering & Data

#### Rendering Strategy

| Strategy | Use When | Next.js Mechanism |
|---|---|---|
| Static (SSG) | Content rarely changes (marketing, docs) | Default for Server Components with no dynamic data |
| Incremental Static Regeneration (ISR) | Mostly static but needs periodic refresh (blog, product listing) | `revalidate` option on `fetch` or route segment |
| Server-Side Rendering (SSR) | Must be fresh on every request (dashboards, user-specific data) | `cache: "no-store"` or dynamic APIs (`cookies()`, `headers()`) |
| Client-Side Rendering (CSR) | Highly interactive, not SEO-relevant, behind auth | `"use client"` component fetching client-side |

Default to static or ISR wherever the content allows. Reach for SSR only
when per-request freshness is a real requirement, and keep CSR to the
smallest necessary surface — see Server vs. Client Components in the
conventions doc.

#### Data Fetching Architecture

- Prefer fetching directly inside Server Components over client-side
  `useEffect` fetches
- Use **Server Actions** for mutations triggered from forms/UI within the
  app, instead of hand-rolled API routes
- Reserve **Route Handlers** (`app/api/.../route.ts`) for cases that need a
  stable HTTP endpoint: webhooks, third-party integrations, or non-Next.js
  clients

#### Server Actions vs. API Routes

| Use Server Actions when | Use Route Handlers when |
|---|---|
| The mutation is triggered from a form/UI within this app | An external client or third party needs a stable HTTP endpoint |
| No standalone REST/JSON contract is needed | You need webhooks, public API consumers, or non-Next.js clients |
| Progressive enhancement (forms work without JS) matters | You need fine-grained control over HTTP method, headers, or status codes |

#### Caching & Revalidation Strategy

- Next.js caches `fetch` requests by default in Server Components. Be
  deliberate about `cache: "force-cache"` (default), `cache: "no-store"`,
  and time-based `revalidate`
- Pick the narrowest cache lifetime that's still correct — default to
  cached/static, add `revalidate` for data that goes stale on a schedule,
  and reserve `no-store` for genuinely per-request data
- Use `revalidatePath`/`revalidateTag` after a Server Action mutation to
  keep cached data in sync, rather than relying on time-based revalidation
  alone for user-triggered changes

### Request Handling & Routing

#### Middleware Usage

Use `middleware.ts` for cross-cutting concerns that must run before a
request reaches a route: auth redirects, locale detection, A/B test
bucketing, header/cookie rewrites.

Keep middleware logic light and fast — it runs on every matched request in
the Edge runtime, so avoid heavy computation or blocking calls there. Push
business logic down into the route or page itself.

#### Routing Conventions

- **Route groups** `(groupName)` — organize routes without affecting the URL
  path, e.g. grouping `(marketing)` vs. `(app)` sections that need different
  layouts
- **Parallel routes** `@slot` — render more than one page in the same layout
  simultaneously, e.g. a dashboard with independently loading panels
- **Intercepting routes** `(.)folder` — show a route in a modal/overlay
  while preserving the underlying page, e.g. a photo modal that still has
  its own shareable URL

Reach for these only when simple nested-folder routing doesn't express the
UI you need — they add real complexity, so don't adopt them speculatively.
