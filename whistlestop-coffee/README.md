# Whistlestop Coffee Hut (Team 6)

Next.js project for the CSC8019 Software Engineering team coursework.

This application is a coffee ordering system for Whistlestop Coffee Hut. It includes customer pages, staff pages, reusable UI components, simple session handling, cart state management, and theme support.

---

# Table of Contents

1. Project Overview
2. Tech Stack
3. Prerequisites
4. Getting Started
5. Important Git Rule
6. Branching Workflow
7. How to Update Your Branch Before Working
8. How to Commit and Push Your Work
9. How to Create a Pull Request
10. Project Structure
11. What Each Folder and File Does
12. How Next.js Works in This Project
13. React Basics for Beginners
14. Client Components and Server Components
15. Routing and Navigation
16. Why We Use Reusable Components Instead of Raw HTML
17. State Management in This Project
18. Utility Files in `lib`
19. Styling and UI
20. Common Commands
21. Team Best Practices
22. Troubleshooting
23. Beginner Tips

---

# 1. Project Overview

Whistlestop Coffee Hut is a web application where users can:

- browse menu items
- view individual menu items
- add items to cart
- register and log in
- view customer pages such as loyalty, status, and orders
- access staff pages such as dashboard and archive

This project is built with **Next.js**, which is a framework built on top of **React**.

---

# 2. Tech Stack

This project uses:

- **Next.js** for the application framework
- **React** for building components
- **JavaScript / JSX** for logic and UI
- **Tailwind CSS** for styling
- **shadcn/ui** for reusable UI components
- **Lucide React** for icons
- **Zustand** for cart state management
- **next/font** for fonts
- **next/navigation** for routing and navigation
- **Prettier** for formatting
- **ESLint** for linting

---

# 3. Prerequisites

Before running the project, make sure you have:

- Node.js LTS installed
- Git installed
- VS Code or another code editor
- GitHub access to the repository

To check Node and Git:
        node -v
        git -v

# 4. Getting Started
## 4.1 Clone the repository
        git clone https://github.com/Picnic-Bas-git/CSC8019---Software-engineering-project---Team-6-Code-Repository-.git

## 4.2 Go into the project folder
        cd whistlestop-coffee

## 4.3 Install dependencies
        npm install

## 4.4 Start the development server
        npm run dev

Open:
http://localhost:3000
## 5. Important Git Rule
- Never work directly on main
- Each team member must work on their own branch.
- If your name is Jackson, your branch should be:
        git checkout -b jackson
-This keeps everyone's work separate and makes it easier to review changes before merging.

# 6. Branching Workflow
## 6.1 Create your branch after cloning
After cloning the repo and entering the project folder, create your own branch:

        git checkout -b yourname

Example:

        git checkout -b jackson

## 6.2 Check your current branch
        git branch
The current branch will have a * next to it.

## 6.3 First push of your branch
When pushing your branch to GitHub for the first time:

        git push -u origin yourname

Example:
        git push -u origin jackson

After that, future pushes can just be:
        git push

# 7. How to Update Your Branch Before Working
Before starting work each day, update your local main and then bring those changes into your own branch.

        Step 1: Switch to main
        git checkout main
        Step 2: Pull latest changes
        git pull origin main
        Step 3: Switch back to your branch
        git checkout yourname
        Step 4: Merge main into your branch
        git merge main
Now your branch has the latest changes from main.

# 8. How to Commit and Push Your Work
        Step 1: Stage your changes
        git add .

        Or stage specific files:

        git add src/app/page.js
        git add src/components/layouts/AppShell.jsx
        Step 2: Commit your changes
        git commit -m "Update customer cart page"

        Use a clear message that explains what you changed.

        Step 3: Push your work
        git push

        If it is the first push for that branch:

        git push -u origin yourname

Simpler yet, use VsCode to help you

# 9. How to Create a Pull Request
A Pull Request, or PR, is how you ask for your work to be reviewed and merged into main.

Steps
Push your branch to GitHub
Open the GitHub repository in your browser
GitHub will usually show a button saying Compare & pull request
Click it
Make sure:
base branch = main
compare branch = your branch
Add a clear title
Add a short description
Submit the PR
Example PR title
Add customer account page and update app shell navigation
Example PR description
        This PR includes:
        - account page improvements
        - session-based account button routing
        - small UI cleanup
After creating the PR, teammates can review your code, you may be asked to make changes, once approved, it can be merged into main

# 10. Project Structure

This is the structure currently used in the project:

whistlestop-coffee/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   ├── customer/
│   │   │   ├── loyalty/
│   │   │   ├── menu/
│   │   │   ├── order/
│   │   │   ├── status/
│   │   │   └── layout.jsx
│   │   ├── staff/
│   │   │   ├── archive/
│   │   │   ├── dashboard/
│   │   │   └── layout.jsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.js
│   │
│   ├── components/
│   │   ├── layouts/
│   │   │   └── AppShell.jsx
│   │   ├── ui/
│   │   ├── theme-provider.jsx
│   │   └── theme-toggle.jsx
│   │
│   └── lib/
│       ├── cart-store.js
│       ├── menu.js
│       ├── session.js
│       └── utils.js
│
├── .editorconfig
├── .gitignore
├── .prettierignore
├── .prettierrc
├── components.json
├── eslint.config.mjs
├── jsconfig.json
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
└── README.md

# 11. What Each Folder and File Does
## src/app/

This is the main routing folder in Next.js App Router.

Folders inside app become routes automatically.

## src/app/page.js

This is usually the homepage route /.

## src/app/layout.js

This is the root layout for the whole app. It wraps every page and usually contains global setup such as fonts, metadata, and providers.

## src/app/globals.css

Global CSS for the whole project.

## src/app/favicon.ico

The favicon for the app.

## src/app/auth/

Contains authentication-related routes such as login and register pages.

## src/app/customer/

Contains customer-facing routes.
Customer pages include:
- loyalty
- menu
- order
- status
- layout.jsx for the shared customer layout.

## src/app/staff/

Contains staff-facing routes.
Staff pages include:
- archive
- dashboard
- layout.jsx for the shared staff layout.

## src/components/

Reusable components that can be shared across pages.

## src/components/layouts/AppShell.jsx

Shared layout wrapper used across pages. It handles the common page structure such as header, subtitle, navigation, theme controls, and customer tab navigation.

## src/components/ui/

Reusable UI building blocks. These are likely shadcn/ui-based components such as:
- Button
- Card
- Input
- Label

## src/components/theme-provider.jsx

Provides theme context for light and dark mode.

## src/components/theme-toggle.jsx

The UI button or control that switches theme.

## src/lib/

Shared logic and helper functions.

## src/lib/cart-store.js

Global cart state using Zustand. This is where cart items and actions such as add, remove, clear, and update quantity are managed.

## src/lib/menu.js

Contains menu item data or functions for retrieving menu data.

## src/lib/session.js

Contains helper functions for storing, reading, and clearing session data such as user role and email.

## src/lib/utils.js

Contains small helper functions used across the project. In shadcn setups, this often includes utility functions such as class name merging.

## Config and root files
.editorconfig
Helps keep coding style consistent across editors.

.gitignore
Lists files Git should ignore.

.prettierrc
Prettier formatting rules.

.prettierignore
Files that Prettier should ignore.

components.json
Configuration file used by shadcn/ui.

eslint.config.mjs
Linting configuration.

jsconfig.json
JavaScript project config. Often used for path aliases like @/components/....

next.config.mjs
Next.js configuration.

postcss.config.mjs
PostCSS configuration used with Tailwind CSS.

package.json
Lists project dependencies, scripts, and metadata.

# 12. How Next.js Works in This Project
## 12.1 Next.js is built on React

React lets us build pages using components.
Next.js adds useful features like:
- file-based routing
- layouts
- server rendering
- client and server components
- - improved performance
cleaner structure for bigger apps

## 12.2 File-based routing
In Next.js App Router, folders inside src/app become routes.

Example:
        src/app/customer/menu/page.jsx

becomes:

        /customer/menu

If there is a dynamic folder like [id], that becomes a dynamic route.

Example:

        src/app/customer/menu/[id]/page.jsx

becomes routes like:

        /customer/menu/latte
        /customer/menu/americano

## 12.3 Layouts
A layout.jsx file wraps the pages inside that folder.
Example:

        src/app/customer/layout.jsx wraps all customer pages

        src/app/staff/layout.jsx wraps all staff pages

        src/app/layout.js wraps the entire application

This is useful because shared UI only needs to be written once.

# 13. React Basics for Beginners
## 13.1 Components

A component is a reusable piece of UI.

Example:

        function Greeting() {
        return <h1>Hello</h1>;
        }

In this project, pages are components, and shared UI parts are also components.

Examples:
- AppShell
- ThemeToggle
- Button
- cart page
- menu page

## 13.2 Props

Props are values passed into components.

Example:

        pShell title="Staff" subtitle="Manage orders and update statuses." />

Here, title and subtitle are props.

## 13.3 State

State is data that changes while the app is running.

Example:

        const [qty, setQty] = useState(1);
        qty is the current state
        setQty updates the state

When state changes, React re-renders the component.

## 13.4 setState

In functional components, setState usually refers to the setter returned by useState.

Example:

        const [count, setCount] = useState(0);

To update it:

        setCount(1);

or

        setCount((prev) => prev + 1);

Use the function version when the next value depends on the previous one.

## 13.5 useEffect

useEffect runs code after rendering.

Use it when you need to:

- load client-only data
- set up timers
- read from browser storage
- run code after the component appears

Example:

        useEffect(() => {
        setSessionState(getSession());
        }, []);

## 13.6 useMemo

useMemo is used to memoize calculated values.

That means React will remember the result and only recalculate it when dependencies change.

Example use case:
- generating size options from menu item data
- avoiding recalculating a derived value on every render

Example:

        const sizeOptions = useMemo(() => {
        const opts = [{ key: 'regular', label: 'Regular', price: item.prices.regular }];
        if (hasLarge) {
        opts.push({ key: 'large', label: 'Large', price: item.prices.large });
        }
        return opts;
        }, [hasLarge, item.prices.large, item.prices.regular]);

Use useMemo when:
- a value is derived from props or state
- the calculation is repeated often
- you want to improve readability or avoid unnecessary recalculation

Do not use it everywhere. Use it when it actually helps.

# 14. Client Components and Server Components

This is one of the most important Next.js concepts.

## 14.1 Server Components

By default, files in the App Router are server components unless marked otherwise.

Server components:
- run on the server
- cannot use useState, useEffect, or browser APIs
- are good for static content and server-side data fetching

## 14.2 Client Components

If a file starts with:

        t';

it becomes a client component.

Client components:
- run in the browser
- can use useState
- can use useEffect
- can use useMemo
- can respond to clicks and form events
- can use browser-only APIs like window and localStorage
- can use Zustand hooks

## 14.3 When to use 'use client'

Use it when your component needs:
- interactivity
- event handlers like onClick
- local state
- effects
- cart store access
- theme toggle logic
- session logic from local storage

## 14.4 When not to use it

Do not add 'use client' if the component does not need browser-side interactivity. Keeping components server-side by default is better for performance and cleaner architecture.

# 15. Routing and Navigation
## 15.1 This project uses Next.js routing, not React Router

This project does not use react-router-dom.

Instead, it uses:
- file-based routing in src/app
- next/link
- next/navigation

## 15.2 Link vs regular <a>

Instead of:

        <a href="/customer/cart">Cart</a>

we use:

        <Link href="/customer/cart">Cart</Link>

Why?
- better client-side navigation
- faster transitions
- recommended by Next.js

## 15.3 useRouter

For navigation in JavaScript, we use useRouter() from next/navigation.

Example:

        const router = useRouter();
        router.push('/customer/menu');

Use router.push() when navigating after:
- login
- register
- logout
- form submit
- button actions

Use router.replace() when you do not want the current page to remain in browser history, such as on a splash screen redirect.

# 16. Why We Use Reusable Components Instead of Raw HTML

You asked about things like why we use Button instead of raw HTML.

Example

Instead of repeating:

        <button class="some very long class list">Continue</button>

we use:

        <Button>Continue</Button>

Why this is better
- consistent design across the project
- less repeated code
- easier to maintain
- easier to update styles globally
- cleaner and more readable JSX

This same idea applies to components like:
- Card
- Input
- Label
- layout wrappers

We are still ultimately rendering HTML underneath, but using reusable components makes the code cleaner and more maintainable.

# 17. State Management in This Project

This project uses both local state and global state.

## 17.1 Local state

Local state belongs to one component only.

Example:

        const [qty, setQty] = useState(1);

Used for things like:
- selected quantity
- selected size
- temporary UI choices
- toggles

## 17.2 Global state with Zustand

The cart is shared across multiple pages, so global state is more appropriate.

This project uses Zustand in src/lib/cart-store.js.

Why Zustand?
- simple to understand
- less boilerplate than Redux
- good for shared state like cart data

Examples of cart usage:
- adding an item on the menu page
- showing cart contents on the cart page
- showing item count in the header

# 18. Utility Files in lib
## cart-store.js

Handles cart items and cart actions.

 ##menu.js

Stores or returns menu items.

## session.js

Stores and retrieves current user session information such as email and role.
TEMPORARY. Weshall later use backend to fetch

## utils.js

General helper functions. In many shadcn projects this includes the cn() helper for class names.

# 19. Styling and UI
## 19.1 Tailwind CSS

This project uses Tailwind CSS, which means most styles are written directly in className.

Example:

        <div className="mx-auto max-w-md space-y-4">

This means:

mx-auto = center horizontally

max-w-md = medium max width

space-y-4 = vertical spacing between children

## 19.2 shadcn/ui

This project uses shadcn/ui-style components.

Important point:
shadcn/ui is not just a hidden library where everything stays external. It gives you component files inside your own project.

That means:
- you can inspect the code
- you can edit the components
- you can customize them easily
- they work very well with Tailwind

## 19.3 Lucide React

Icons are coming from lucide-react.

Example:

        import { ShoppingCart, User } from 'lucide-react';

## 19.4 Theme support

This project has:

        theme-provider.jsx
        theme-toggle.jsx

These handle dark mode / light mode support.

## 20. Common Commands
Start development server
        npm run dev
Format code
        npm run format
Build for production
        npm run build
Start production build
        npm run start

## 21. Team Best Practices
Git rules
- always work on your own branch
- never commit directly to main
- pull latest changes before starting work
- push your branch regularly
- create a pull request when your work is ready

Coding rules
- keep components small and readable
- reuse components where possible
- avoid duplicating code
- use clear function and variable names
- comment code when it helps beginners understand the logic

Before pushing
Make sure:
- the app runs
- your changes do not break other pages
- code is formatted
- there are no obvious console errors

# 22. Troubleshooting
## Reinstall dependencies

If something is broken with packages:

        rm -rf node_modules package-lock.json
        npm install

## Check your current branch
git branch

## Port already in use

If port 3000 is busy:

        npm run dev -- -p 3001

## Uncommitted changes blocking branch switch

If Git refuses to change branches because of local changes:

        git stash
        git checkout main

Then later:

        git stash pop
Pull request shows too many unrelated changes

Your branch may be behind main.

Fix with:

        git checkout main
        git pull origin main
        git checkout yourname
        git merge main
        git push

# 23. Beginner Tips
## Tip 1: Read these files first

If you are new to the project, start by opening these files:

        src/app/layout.js

        src/app/page.js

        src/components/layouts/AppShell.jsx

        src/app/customer/layout.jsx

        src/app/staff/layout.jsx

        src/lib/cart-store.js

        src/lib/menu.js

        src/lib/session.js

These files will help you understand:
- overall app structure
- shared layouts
- routing
- cart logic
- session logic
- reusable UI patterns

## Tip 2: Start with a small change
If you are new to Next.js, begin with something small:
- change a heading
- update button text
- add a menu item
- improve spacing
- add a small section

## Tip 3: Understand the flow

A good mental model for this project is:

        src/app = pages and routes

        src/components = reusable building blocks

        src/lib = shared logic and helpers

## Tip 4: Learn the difference between page, layout, and component

page = a route users visit

layout = a wrapper shared across several pages

component = a reusable UI piece used inside pages or layouts

Example Full Workflow
First time setup
        git clone https://github.com/Picnic-Bas-git/CSC8019---Software-engineering-project---Team-6-Code-Repository-.git
        cd whistlestop-coffee
        npm install
        git checkout -b chana
        npm run dev
        After making changes
        git add .
        git commit -m "Improve account page and cart navigation"
        git push -u origin chana

Then go to GitHub and create a Pull Request into main.