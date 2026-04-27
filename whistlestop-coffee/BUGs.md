# Bug Fixes

Notes on the bugs found while testing the auth flow and fixed in Jackson's branch.


## 1. Registration always failed with "Something went wrong"

**File:** `src/app/api/auth/register/route.js`, `src/lib/validations/auth.js`

The Prisma `User` model has `phone String` (NOT NULL), but the register
handler was inserting `phone: phone || null`. The Zod schema accepted an
empty string for `phone` (`.optional().or(z.literal(''))`), so a blank
value reached Prisma and the insert was rejected with a constraint
error. The user only saw the generic 500 message.

The form already marks the phone input as `required`, so the validation
was out of sync with the UI intent as well.

**Diff (conceptual):**

```js
// route.js — before
phone: phone || null,

// route.js — after
phone,
```

```js
// validations/auth.js — before
phone: z
  .string()
  .min(11, 'Enter a valid phone number')
  .optional()
  .or(z.literal('')),

// validations/auth.js — after
phone: z
  .string()
  .trim()
  .regex(/^\+?[\d\s-]{7,15}$/, 'Enter a valid phone number'),
```

The regex accepts an optional leading `+`, digits, spaces and dashes,
length 7–15. That covers UK numbers with or without country code and
common international formats, without the previous arbitrary 11-char
minimum that rejected most non-UK numbers.

---

## 2. Register form swallowed field-level errors

**File:** `src/app/auth/register/page.jsx`

The handler only read `data.error` from the response, so any 400 from
Zod showed as `Invalid input` and the user had no way to know which
field was wrong. The backend already returns
`details.fieldErrors` from `parsed.error.flatten()`; the frontend just
wasn't using it.

**Diff:**

```jsx
// Before
if (!res.ok) {
  setError(data.error || 'Registration failed');
  return;
}

// After
if (!res.ok) {
  const fieldErrors = data.details?.fieldErrors;
  const firstFieldError =
    fieldErrors &&
    Object.values(fieldErrors).flat().filter(Boolean)[0];
  setError(firstFieldError || data.error || 'Registration failed');
  return;
}
```

Now a too-short password renders "Password must be at least 6
characters" instead of the generic "Invalid input".

---

## 3. Login form had the same vague-error problem

**File:** `src/app/auth/login/page.jsx`

The login form was a copy of the register pattern and shared the same
issue. The fix is the same: pull the first field error out of
`data.details.fieldErrors` before falling back to `data.error`.

```jsx
if (!res.ok) {
  const fieldErrors = data.details?.fieldErrors;
  const firstFieldError =
    fieldErrors &&
    Object.values(fieldErrors).flat().filter(Boolean)[0];
  setError(firstFieldError || data.error || 'Login failed');
  return;
}
```

Hard credential failures (wrong email/password) still come through as
`Invalid credentials` because the API returns that under `error`, not
`details`.

---

## 4. Staff and customer routes were not role-separated

**File:** `src/app/staff/layout.jsx`

There was no guard on `/staff/*`. A signed-out visitor or a regular
customer could type the URL and reach the staff dashboard. The
underlying API endpoints would refuse to return data, but the page
itself rendered and exposed the staff UI. The login redirect at
`auth/login/page.jsx` only chooses an initial destination; it does not
prevent later manual navigation.

The fix turns the staff layout into an async server component that
calls the existing `getCurrentUser()` helper and uses
`redirect()` from `next/navigation`:

```jsx
export default async function StaffLayout({ children }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  if (user.role !== 'STAFF' && user.role !== 'ADMIN') {
    redirect('/customer/menu');
  }

  return (
    <AppShell title="Staff" subtitle="Manage orders and update statuses.">
      {children}
    </AppShell>
  );
}
```

`/customer/*` is intentionally left open. Guests need it for the
"Just browsing" link on the login page, and staff need it for the
"View as customer" shortcut on the account page. Only `/staff/*` is
gated.

