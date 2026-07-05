# Workflow ERP - Enterprise Workflow Management System

A scalable, modular web application for internal enterprise workflow management based on ERP + BPM principles.

## 🎯 Features

- **Dashboard** - Overview with pending approvals, active workflows, tasks, and activity timeline
- **Workflow Management** - Create, track, and manage multi-step business workflows
- **Approval System** - Multi-level approvals with approve/reject actions and comments
- **Document Management** - Upload, categorize, and attach documents to workflows
- **Project Management** - Create projects, assign teams, link workflows
- **User & Role Management** - Role-based access (Admin, Manager, Staff) with simulated login
- **Notification System** - Real-time notification simulation with alerts

## 🛠️ Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS 3
- **State Management**: Zustand
- **Routing**: React Router v7
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **Drag & Drop**: @dnd-kit

## 📦 Installation

```bash
cd workflow-erp
npm install
```

## 🚀 Development

```bash
npm run dev
```

The application will open at `http://localhost:3000`

## 🏗️ Build

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── app/
│   ├── router/          # React Router configuration
│   ├── layout/          # Main layout components (Sidebar, Header)
│   └── store/           # Zustand stores (auth, workflow, approvals, etc.)
│
├── modules/
│   ├── dashboard/       # Dashboard module
│   ├── workflow/        # Workflow management module
│   ├── approvals/       # Approval system module
│   ├── documents/       # Document management module
│   ├── projects/        # Project management module
│   ├── users/           # User & role management module
│   └── notifications/   # Notification system module
│
├── components/
│   ├── ui/              # Reusable UI components (Button, Modal, Card, etc.)
│   ├── forms/           # Form components
│   └── common/          # Common/shared components
│
├── services/
│   ├── api/             # API service layer (abstraction for backend)
│   └── mock/            # Mock data and simulated API services
│
├── hooks/               # Custom React hooks
├── utils/               # Utility functions and helpers
└── assets/              # Static assets
```

## 🔐 Demo Credentials

| Role     | Username | Password     |
|----------|----------|--------------|
| Admin    | admin    | admin123     |
| Manager  | manager  | manager123   |
| Staff    | staff    | staff123     |

## 🎨 UI Features

- ✅ Clean, modern minimalistic UI
- ✅ Responsive sidebar navigation (collapsible)
- ✅ Dark mode toggle
- ✅ Loading states and empty states
- ✅ Cards, tables, modals, badges
- ✅ Consistent spacing and typography
- ✅ Status indicators with color-coded badges

## 🔄 Architecture

### Service Layer Pattern
The app uses a service layer abstraction that separates data access from UI components. Currently uses mock data, but is structured for easy Supabase integration:

```
services/
├── api/           # API abstraction (currently points to mock)
└── mock/          # Mock data with simulated async API calls
```

To integrate Supabase later:
1. Replace mock service implementations in `services/mock/` with actual Supabase calls
2. Update `services/api/index.js` to import from Supabase services instead of mock

### State Management
- **Zustand stores** for global state (auth, workflows, approvals, etc.)
- **React Hook Form** for form state and validation
- **Local state** for UI-specific state (modals, filters, etc.)

### Role-Based Access
- **Admin**: Full access to all features
- **Manager**: Can approve, create workflows, manage projects
- **Staff**: Can view tasks, submit documents, comment

## 📋 Modules

### 1. Dashboard
- Overview cards with key metrics
- Active workflows with progress tracking
- Pending approvals list
- Activity timeline

### 2. Workflow Management
- Create workflows with multi-step processes
- Assign departments and users to steps
- Visual progress tracking
- Status: Pending / In Progress / Completed
- Timeline visualization

### 3. Approval System
- Multi-level approval requests
- Approve/Reject with comments
- Approval history tracking
- Due date monitoring

### 4. Document Management
- Upload documents (mock)
- Categorize by type (template, report, policy, etc.)
- Attach to workflows
- Search and filter

### 5. Project Management
- Create and track projects
- Assign team members
- Link workflows to projects
- Progress monitoring

### 6. User & Roles
- View all users and roles
- Role permissions display
- Simulated authentication

### 7. Notifications
- Real-time notification simulation
- Notification panel in header
- Mark as read/delete
- Navigate to related content

## 🔌 Future Backend Integration (Supabase)

The codebase is prepared for Supabase integration:

- ✅ Service layer abstraction
- ✅ No hardcoded logic in components
- ✅ Separated API calls
- ✅ Async/await pattern
- ✅ Error handling

Next steps for backend integration:
1. Install `@supabase/supabase-js`
2. Create `src/utils/supabaseClient.js`
3. Replace mock services with Supabase queries
4. Update Zustand stores to use real API calls

## 📝 Best Practices Followed

- ✅ Modular architecture with feature-based folders
- ✅ Component reusability
- ✅ Separation of concerns
- ✅ Clean code under 1200 lines per file
- ✅ Clear naming conventions
- ✅ Scalable structure for future growth

## 📄 License

ISC
