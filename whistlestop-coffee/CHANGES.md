# Frontend Changes — Checkout Flow & Persistence

This document details the frontend-only changes made to unblock the end-to-end
customer ordering flow. Everything is local state (Zustand) and `localStorage`.


## 1. Fixed `Add to cart` crash on the menu grid

**File:** `src/app/customer/menu/page.jsx`

**Fix:** Removed the two offending lines. The button is not inside a `<form>`,
nor wrapped in an interactive parent that would bubble a click to somewhere
unwanted, so neither `preventDefault` nor `stopPropagation` were needed in the
first place.

**Diff (conceptual):**

```jsx
// Before
onClick={() => {
  e.preventDefault();
  e.stopPropagation();
  addItem({ ... });
}}

// After
onClick={() => {
  addItem({ ... });
}}
```

---

## 2. Created `orders-store`

**File:** `src/lib/orders-store.js` (new)


**Solution:** A Zustand store wrapped with the `persist` middleware, backed
by `localStorage` under the key `whistlestop_orders`.

### Shape

Each order stored in the `orders` array has:

| Field           | Type          | Notes                                         |
| --------------- | ------------- | --------------------------------------------- |
| `id`            | string        | Human-readable, e.g. `WS-LW3K4A2-8F2R`        |
| `items`         | array         | Snapshot of cart items at time of checkout    |
| `subtotal`      | number        | Sum of `unitPrice * qty` at checkout          |
| `customerEmail` | string \| null| From session at checkout time                 |
| `pickupName`    | string        | What the staff calls out when the drink is ready |
| `notes`         | string        | Free-text customer notes (e.g. "oat milk")    |
| `status`        | enum          | `pending` → `preparing` → `ready` → `completed` |
| `createdAt`     | ISO string    | For sorting and archive                       |

The exported constant `ORDER_STATUSES` gives the canonical status list so that
future UI (staff dashboard dropdowns, status page filters) does not duplicate
the source of truth.

### Actions

- **`addOrder({ items, subtotal, customerEmail, pickupName, notes })`** —
  Generates a new `id` and `createdAt`, prepends the order to the list (newest
  first), and returns the created order so the caller can immediately route
  to it. Default status is `pending`.
- **`updateStatus(orderId, status)`** — Immutable map update; used later by
  the staff dashboard to move an order through its lifecycle.
- **`clearAll()`** — Reset; primarily for dev/testing. Not wired into any UI.

### ID format

`WS-{base36 timestamp}-{4 random base36 chars}` — short, uppercase,
copy-pasteable, and virtually collision-free for a local-only prototype.

---

## 3. Rebuilt the checkout page at `/customer/order`

**Problem:** `src/app/customer/cart/page.jsx` links to `/customer/order` as
the checkout destination, but that page had been deleted. The cart was a
dead end.


### Empty-state guard

If the cart is empty when the user lands on this page (e.g. they navigated
here directly or refreshed after an earlier checkout), render a friendly
message with a link back to the menu instead of an empty form. This prevents
the user from submitting an empty order.

### Card 1 — Order summary

Renders each cart item with:

- Name
- Size and unit price
- Quantity
- Line total (`unitPrice * qty`)

Followed by a **Subtotal** row. Currency formatting uses a local `money(n)`
helper (`£` prefix, two decimals), consistent with the rest of the customer
area.

### Card 2 — Pickup details

A small form with:

- **Name for pickup** — required. Prefilled from the session after mount:
  - `session.name` if present (future-proofed for when register stores a
    name), else
  - the local part of `session.email` (before the `@`), else
  - empty
- **Notes** — optional `<Textarea>` for things like "oat milk, extra hot"
- **Back to cart** — outline button linking to `/customer/cart`
- **Place order · £X.YZ** — primary action, disabled when:
  - the pickup name is empty, or
  - a submission is already in flight (prevents double-submit)

### Submission flow

On click of **Place order**:

1. Snapshot the current session (for `customerEmail`)
2. Call `addOrder({ items, subtotal, customerEmail, pickupName, notes })` —
   returns the newly created order
3. Call `clearCart()` to empty the cart
4. `router.push('/customer/status?placed=${order.id}')` — forwards the new
   order id as a query param so the (future) status page can highlight the
   just-placed order without needing extra state

The push happens last, after state mutations, so there is no race between
persisting the order and navigating away.

### SSR / hydration notes

The session prefill is done in a `useEffect` so it runs after mount. Reading
`localStorage` synchronously during render would mismatch between SSR (where
`window` is undefined) and client hydration. An `eslint-disable-next-line`
comment is applied to the single `setPickupName(prefill)` call because the
project's `react-hooks/set-state-in-effect` rule would otherwise block the
build; reading-from-localStorage-after-mount is a legitimate exception to
that rule.

---

## 4. Added `localStorage` persistence to the cart store

**File:** `src/lib/cart-store.js`

**Problem:** The cart was held in plain in-memory Zustand state. Any page
refresh wiped it — including the refresh that happens when the user
accidentally hits back, reopens the tab, or the dev server hot-reloads
during testing.

**Solution:** Wrapped the existing store factory in Zustand's `persist`
middleware with `createJSONStorage(() => localStorage)` and the key
`whistlestop_cart`. All four existing actions (`addItem`, `setQty`,
`removeItem`, `clear`) are unchanged — only their enclosing factory now
hydrates from, and writes to, `localStorage` on every state transition.

No callers needed to change, because the Zustand `persist` middleware is
transparent to consumers: `useCartStore((s) => s.items)` still returns the
same shape.

---

## End-to-end flow now working

```
/auth/login
    │
    ▼
/customer/menu              ← quick-add button no longer crashes
    │  (addItem → cart-store, persisted)
    ▼
/customer/cart              ← "Continue to checkout" now resolves
    │
    ▼
/customer/order             ← NEW checkout page
    │  1. addOrder(...) → orders-store (persisted)
    │  2. clearCart()   → cart-store
    │  3. router.push("/customer/status?placed=<id>")
    ▼
/customer/status            ← (still placeholder — next batch of work)
```

## Verification

- **Lint:** `npx eslint src/app/customer/menu/page.jsx
  src/app/customer/order/page.jsx src/lib/cart-store.js
  src/lib/orders-store.js` — clean.
- **Build:** `npx next build` — successful. `/customer/order` appears in the
  route manifest as a static route (`○`).

