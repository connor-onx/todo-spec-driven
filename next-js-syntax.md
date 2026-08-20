# React / Next.js Code Conventions

Applies to all TypeScript and TSX files in this repo. Works for both React and Next.js projects.

## Formatting

### Semicolons

No semicolons, except where required to prevent ASI (automatic semicolon
insertion) from misparsing two statements as one.

```tsx
const config = {
  width: 640,
  height: 480
}

function greet() {
  console.log("hi")
}

const total = 5
```

**Exception (ASI safety):** if a statement starts with `(`, `[`, `` ` ``, `+`,
or `-`, prefix it with a leading semicolon so it can't be parsed as a
continuation of the previous line.

```tsx
const config = {
  width: 640,
  height: 480
}

;(someArray as unknown[]).forEach((x) => x())
```

### No Trailing Commas

Omit the trailing comma after the last item in arrays, objects, parameter
lists, etc.

```tsx
const directions = ["up", "down", "left", "right"]

const user = {
  id: "1",
  displayName: "Alice"
}
```

### Import Order

Default imports first, then a blank line, then named/specific (`{ }`)
imports, then a blank line, then side-effect-only imports (no bindings —
e.g. a CSS import). Alphabetize within each group by the module path
string, and keep each group's imports contiguous — no blank line between
individual import lines within the same group, whether the module is an
external package or an internal `@/` alias.

```tsx
import axios from "axios"

import { fetchUser } from "@/lib/api"
import type { User, UserRole } from "@acme/shared"

import "./globals.css"
```

### Self-Closing JSX Tags

No space before the closing `/>` on a self-closing tag.

```tsx
<CreateListForm/>
<Input value={value} onChange={onChange}/>
```

### Indentation

2 spaces.

## Naming

### Naming Conventions

| Type                   | Convention        | Example          |
|-------------------------|-------------------|-------------------|
| Components               | PascalCase        | `UserCard`        |
| Functions / variables     | camelCase         | `getUserById`     |
| Constants                 | UPPER_SNAKE_CASE  | `MAX_RETRIES`     |
| Types / Interfaces        | PascalCase        | `UserCardProps`   |

### File & Folder Naming

- File names use **kebab-case**: `user-card.tsx`, `use-user.ts`. This matches
  Next.js's own mandated special files (`page.tsx`, `layout.tsx`,
  `route.ts`) and keeps naming consistent across the whole `src` tree, even
  though the component/function exported from the file is PascalCase or
  camelCase.
- Colocate a component's related files in its own folder:

  ```
  user-card/
    user-card.tsx
    user-card.test.tsx
    index.ts        (optional barrel re-export)
  ```

- Route-only files required by the Next.js App Router (`page.tsx`,
  `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`) keep their
  framework-mandated names regardless of the rule above.

## TypeScript & Error Handling

### TypeScript Strictness

- `strict: true` in `tsconfig.json`
- `any` is heavily discouraged. Use `unknown` and narrow it, or define a
  proper type/interface instead
- Prefer explicit return types on exported functions
- Avoid non-null assertions (`!`) where a real null check is possible

### Async / Error Handling

- Prefer `async/await` over `.then()` / `.catch()` chains
- Always wrap async operations in `try/catch`
- Throw and catch specific error types, not generic `Error`
- Log errors with structured context, not a bare `console.log(err)`

```tsx
try {
  const data = await fetchUser(id)
} catch (error) {
  if (error instanceof UserNotFoundError) {
    logger.warn("user_not_found", { id })
  } else {
    logger.error("fetch_user_failed", { id, error })
    throw error
  }
}
```

## React & Next.js Patterns

### Component Structure

- Function components only. No class components.
- One component per file.
- Type props with an `interface` named `<Component>Props`, destructured
  directly in the function signature.
- Use **named exports** for components in general. **Default exports** are
  reserved for files where Next.js requires them: `page.tsx`, `layout.tsx`,
  `loading.tsx`, `error.tsx`, `route.ts`, and similar framework-mandated
  files.

```tsx
interface UserCardProps {
  name: string
  isActive: boolean
}

export function UserCard({ name, isActive }: UserCardProps) {
  return (
    <div>
      {name} - {isActive ? "Active" : "Inactive"}
    </div>
  )
}
```

### Hooks Conventions

- Custom hooks are always prefixed with `use` (`useUser`, `useDebounce`)
- Hooks are called at the top level only, never inside conditionals, loops,
  or nested functions (enforced via `eslint-plugin-react-hooks`)
- Order hooks within a component consistently:
  1. State (`useState`, `useReducer`)
  2. Derived data (`useMemo`)
  3. Side effects (`useEffect`)
  4. Event handlers (plain functions, not hooks)
- Extract logic into a custom hook once a component accumulates more than a
  couple of related `useState`/`useEffect` pairs

```tsx
function UserCard({ id }: { id: string }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const user = useUser(id)

  const displayName = useMemo(() => formatName(user), [user])

  useEffect(() => {
    trackView(id)
  }, [id])

  function handleToggle() {
    setIsExpanded((prev) => !prev)
  }

  return null
}
```

### Next.js: Server vs. Client Components

- Components are **Server Components by default**. Only add `"use client"`
  when the component actually needs state, effects, event handlers, refs, or
  browser-only APIs.
- Push the `"use client"` boundary as far down the tree as possible — keep
  client components small and leaf-level rather than marking whole pages as
  client.
- `"use client"` must be the very first line of the file, before any
  imports.
- Prefer fetching data in Server Components over client-side `useEffect`
  fetches.

```tsx
"use client"

import { useState } from "react"

export function LikeButton() {
  const [liked, setLiked] = useState(false)

  return null
}
```
