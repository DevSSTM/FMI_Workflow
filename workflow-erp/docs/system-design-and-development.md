# 11. System Architecture Design

The Workflow and Document Management System is designed as a web-based single-page application with a React front end, a Supabase-backed application layer, and a PostgreSQL database. The architecture separates presentation, business logic, and data persistence so the system can be extended in future with additional modules, services, and user roles. The deployed application is hosted on Vercel, while data, storage, and RPC-based business operations are handled through Supabase.

## 11.1 Front-End

The front end is developed as a Single Page Application (SPA) using React with Vite as the build tool. Routing is handled through `react-router-dom`, form state is managed using `react-hook-form`, and global client state is managed with Zustand. The user interface includes modules for login, dashboards, workflow management, project tracking, approvals, notifications, and document handling.

The front-end layer is responsible for:

- rendering the user interface
- collecting user input
- validating form submissions
- calling Supabase services through the application service layer
- displaying workflow, project, approval, and document data in real time

The front-end structure is organized into reusable components, modules, hooks, services, and utility functions to improve maintainability and scalability.

## 11.2 Back-End

The back end is implemented using Supabase services instead of a separately hosted custom server. Business logic is handled through:

- Supabase PostgreSQL database tables
- SQL functions and RPC endpoints
- Row Level Security (RLS) policies
- Supabase Storage for document files

The application communicates with the back end through the Supabase JavaScript client. Core backend responsibilities include:

- user authentication through custom RPC-based login functions
- workflow and project data management
- approval processing
- notification management
- document metadata storage and file upload handling

This backend design keeps the application lightweight while still supporting future expansion.

## 11.3 Database

The database is implemented using PostgreSQL on Supabase. The design follows a normalized structure with separate tables for each major system concern. This improves maintainability, avoids duplicated data, and supports future system growth.

The main database entities include:

- `app_users`
- `workflows`
- `workflow_departments`
- `workflow_steps`
- `documents`
- `projects`
- `project_workflows`
- `project_team_members`
- `approvals`
- `approval_comments`
- `approval_history`
- `notifications`

The database also includes triggers, policies, and SQL functions to support automated updates, password handling, and secure data access.

## 11.4 Security

Security is implemented through both application-level and database-level mechanisms.

The main security measures include:

- authenticated access to the system through username and password
- encrypted password storage using PostgreSQL cryptographic functions
- Row Level Security policies on database tables
- separation between publishable client keys and privileged server/admin credentials
- Supabase Storage access policies for document management
- environment variable configuration for sensitive integration values

For production use, service-role keys and database passwords must be protected and rotated when exposed. The system is designed so only public configuration is used in the front-end deployment.

# 12. Database Design

The database design follows a relational model. Each major function of the system is stored in a separate table to support modular expansion and cleaner maintenance.

## 12.1 User Table

The `app_users` table stores user account information such as:

- user ID
- username
- password hash
- full name
- email
- role
- department
- phone number
- status
- login timestamps

## 12.2 Workflow Tables

Workflow management is split across multiple related tables:

- `workflows` stores the main workflow record
- `workflow_departments` stores department assignments
- `workflow_steps` stores the ordered process steps within each workflow

This structure supports multi-step workflows, department-based assignments, and workflow progress tracking.

## 12.3 Project Tables

Project-related data is divided into:

- `projects`
- `project_workflows`
- `project_team_members`

This allows a project to contain multiple workflows and multiple assigned team members without duplicating project records.

## 12.4 Approval Tables

Approval processing is stored using:

- `approvals`
- `approval_comments`
- `approval_history`

This design captures the current state of an approval request, user comments, and the full historical decision trail.

## 12.5 Document and Notification Tables

- `documents` stores document metadata and linked file information
- `notifications` stores system alerts for individual users

Actual uploaded files are stored in Supabase Storage, while descriptive metadata remains in the relational database.

# 13. Front-End Development

The front-end development process focused on usability, responsiveness, and modular design. React was used to build reusable UI components and feature modules. Vite was selected for fast local development and efficient production builds.

The major front-end features include:

- login page
- dashboard interface
- workflow creation and editing
- project management views
- approval request screens
- document upload and listing
- notification display

The front end uses a service-based architecture where UI modules call centralized service functions instead of directly embedding database logic into components. This improves readability and simplifies maintenance.

Styling is implemented through CSS and Tailwind-compatible project tooling, with emphasis on responsive layout, visual clarity, and a modern user experience.

# 14. Back-End Development

The back-end development was carried out using Supabase as the backend platform and PostgreSQL as the database engine. Instead of using a separate Express or Node API server, the system uses:

- Supabase table operations
- RPC functions
- storage services
- security policies

Key backend development tasks included:

- designing normalized SQL tables
- creating relationships between entities
- writing SQL functions for authentication and user management
- implementing workflow, project, approval, and notification persistence
- configuring document storage buckets and access policies
- integrating the front-end service layer with Supabase APIs

This approach reduced infrastructure complexity while still supporting real backend behavior.

# 15. System Integration and Technologies Used

System integration combines the front end, Supabase backend, database, file storage, and deployment platform into one working application.

## 15.1 Integration Overview

The integration flow is as follows:

1. The user interacts with the React front end.
2. The front end sends requests through the Supabase JavaScript client.
3. Supabase processes table operations, RPC calls, and storage actions.
4. PostgreSQL stores and retrieves structured application data.
5. Supabase Storage manages uploaded document files.
6. Vercel serves the deployed web application to end users.

## 15.2 Languages Used

The main languages used in the system are:

- JavaScript
- SQL
- HTML
- CSS

## 15.3 Frameworks and Libraries Used

The main frameworks and libraries used are:

- React
- Vite
- React Router DOM
- React Hook Form
- Zustand
- Supabase JavaScript Client
- DnD Kit

## 15.4 Platforms and Services Used

The main platforms and services used are:

- Supabase
- PostgreSQL
- Supabase Storage
- Vercel

## 15.5 Benefits of the Integrated Architecture

The integrated design provides:

- centralized data management
- faster development and deployment
- easier scaling for future modules
- structured separation of concerns
- improved maintainability
- support for secure user and document management

Overall, the system integration approach enables the application to function as a modern workflow and document management platform with clear separation between interface, logic, persistence, and deployment infrastructure.
