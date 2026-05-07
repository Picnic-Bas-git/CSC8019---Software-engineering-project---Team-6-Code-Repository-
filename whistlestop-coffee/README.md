# Whistlestop Coffee Hut - Team 6

Whistlestop Coffee Hut is a full-stack coffee ordering web application built for the CSC8019 Software Engineering team project.

The system allows customers to browse the menu, add items to a cart, place pickup orders, track order status, and use loyalty features. Staff users can manage active orders, update order statuses, cancel late orders, and view archived orders.

## Code Standard
- **Consistent formatting**  
  Prettier is used to format the codebase so that spacing, indentation, and general formatting stays consistent across the team.

- **Linting**  
  ESLint is used to check for code issues and help catch mistakes before changes are pushed or merged.


## Naming Conventions

- **Folders use lowercase names**  
  Route and feature folders were named in lowercase, for example `customer`, `staff`, `auth`, `api`, `menu`, and `dashboard`.

- **Route folders describe the page purpose**  
  Folders inside `src/app` are named after the route or feature they represent, such as `customer/menu`, `staff/dashboard`, and `staff/archive`.

- **Components use PascalCase**  
  Reusable React components are named with capital letters, such as `AppShell`, `ThemeToggle`, and `Button`.

- **Utility files use lowercase or kebab-case**  
  Shared helper files use simple lowercase or kebab-case names, such as `utils.js`, `session.js`, and `cart-store.js`.

- **Functions and variables use camelCase**  
  JavaScript functions and variables are written in camelCase, such as `getCurrentUser`, `requireUser`, `pickupTime`, and `isAvailable`.

- **Database models use PascalCase**  
  Prisma models are written in PascalCase, such as `User`, `Order`, `OrderItem`, `MenuItem`, and `CartItem`.

- **Database fields use camelCase**  
  Prisma model fields use camelCase, such as `createdAt`, `updatedAt`, `pickupTime`, `passwordHash`, and `loyaltyPoints`.

- **Enums use clear uppercase-style values**  
  Status and role values are written clearly, such as `CUSTOMER`, `STAFF`, `ADMIN`, `PENDING`, `READY`, `COLLECTED`, and `CANCELLED`.

- **Names describe purpose rather than appearance**  
  Names are chosen based on what the file, function, or component does, rather than how it looks. For example, `cart-store.js` describes cart state logic, while `AppShell` describes the shared application layout.

- **Commit messages describe the change**  
  Commit messages are kept short but descriptive, for example `Update customer cart page` or `Add staff order archive`.

## Features

- Customer registration and login
- Menu browsing
- Cart and checkout flow
- Pickup time selection
- Order status tracking
- Loyalty points 
- Staff dashboard
- Order status management
- Archived orders
- Role-based access for customers, staff, and admin users
- Light and dark mode support

## Tech Stack

- Next.js
- React
- Prisma
- MariaDB/MySQL-compatible database
- Tailwind CSS
- shadcn/ui
- Radix UI
- Zod
- React Hook Form
- Zustand
- bcryptjs
- jsonwebtoken
- date-fns
- Sonner
- ESLint
- Prettier

## Getting Started

### Prerequisites

Make sure you have:

- Node.js LTS
- npm
- Git
- Access to the project repository
- The required environment variables from the project specification document

### Clone the Repository

        git clone https://github.com/Picnic-Bas-git/CSC8019---Software-engineering-project---Team-6-Code-Repository-.git
        cd whistlestop-coffee

### Install Dependencies
        
        npm install

### Environment Variables

The actual environment values are not included in the repository. They are documented separately in the project specification document.

### Run the Development Server
        npm run dev
We included the command to connect to the database in this command.

## Project Structure
        whistlestop-coffee/
        ├── prisma/
        ├── public/
        ├── src/
        │   ├── app/
        │   ├── components/
        │   └── lib/
        ├── package.json
        └── README.md