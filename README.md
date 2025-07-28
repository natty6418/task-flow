# TaskFlow 📋

A modern, collaborative project management application built with Next.js, Express.js, and PostgreSQL. TaskFlow helps teams organize, track, and manage their projects with intuitive Kanban boards, task management, and real-time collaboration features.

![TaskFlow Dashboard](https://img.shields.io/badge/Status-Active-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)

## ✨ Features

### 🏠 **Dashboard**
- Unified task panel with drag-and-drop functionality
- Real-time project overview and statistics
- Calendar integration for task scheduling
- Activity feed and recent task tracking
- Quick access to projects and boards

### 📊 **Project Management**
- Create and manage multiple projects
- Project ownership and member management
- Role-based access control (Admin, Member, Viewer)
- Project statistics and progress tracking
- Team collaboration features

### 📋 **Kanban Boards**
- Interactive Kanban boards with drag-and-drop
- Customizable board columns and status tracking
- Real-time board updates and synchronization
- Task assignment to boards
- Board view switching (List/Kanban)

### ✅ **Task Management**
- Create, edit, and delete tasks
- Task prioritization (Low, Medium, High)
- Status tracking (Todo, In Progress, Done)
- Due date management
- Task assignment to team members
- Rich text descriptions with TipTap editor

### 👥 **Team Collaboration**
- Multi-user project support
- Role-based permissions
- Team member management
- Task assignment and ownership
- Real-time updates across team members

### 🔐 **Authentication & Security**
- JWT-based authentication
- Secure password hashing with bcrypt
- Google OAuth integration
- Session management with cookies
- Passport.js authentication strategies

### 🎨 **Modern UI/UX**
- Responsive design with Tailwind CSS
- Material-UI components integration
- Drag-and-drop interfaces (@dnd-kit)
- Toast notifications for user feedback
- Loading states and error handling
- Modern glassmorphism design elements

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Material-UI (MUI)
- **State Management**: React Context API
- **Drag & Drop**: @dnd-kit
- **Rich Text Editor**: TipTap
- **HTTP Client**: Axios
- **Date Handling**: date-fns, dayjs
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: Passport.js + JWT
- **Password Hashing**: bcrypt
- **Session Management**: express-session
- **CORS**: cors middleware
- **Environment**: dotenv

### Database Schema
- **Users**: Authentication and profile management
- **Projects**: Project organization and ownership
- **ProjectMembers**: Many-to-many user-project relationships
- **Boards**: Kanban board management
- **Tasks**: Task tracking and assignment
- **Enums**: Role, Status, Priority, AuthProvider

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/natty6418/task-flow.git
   cd task-flow
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   
   Create `.env` files in both backend and frontend directories:
   
   **Backend `.env`:**
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/taskflow"
   JWT_SECRET="your-jwt-secret-key"
   GOOGLE_CLIENT_ID="your-google-oauth-client-id"
   GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
   NODE_ENV="development"
   PORT=3001
   HOST="localhost"
   ```

5. **Database Setup**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on `http://localhost:4000`

2. **Start the Frontend Application**
   ```bash
   cd frontend
   npm run dev
   ```
   Application will be available at `http://localhost:3000`

## 📁 Project Structure

```
task-flow/
├── backend/                 # Express.js API server
│   ├── config/             # Authentication & JWT configuration
│   ├── models/             # Prisma client setup
│   ├── prisma/             # Database schema & migrations
│   ├── routes/             # API route handlers
│   │   ├── auth.ts         # Authentication routes
│   │   ├── user.ts         # User management
│   │   ├── project.ts      # Project operations
│   │   ├── task.ts         # Task management
│   │   └── board.ts        # Board operations
│   └── app.ts              # Express app configuration
├── frontend/               # Next.js React application
│   ├── src/
│   │   ├── app/            # Next.js app router pages
│   │   ├── components/     # Reusable React components
│   │   │   ├── dashboard/  # Dashboard-specific components
│   │   │   ├── kanban/     # Kanban board components
│   │   │   ├── project/    # Project management components
│   │   │   └── settings/   # Settings components
│   │   ├── contexts/       # React Context providers
│   │   ├── services/       # API service functions
│   │   └── types/          # TypeScript type definitions
│   └── public/             # Static assets
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `GET /auth/google` - Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback

### Projects
- `GET /project/` - Get user projects
- `POST /project/create` - Create new project
- `PUT /project/update/:id` - Update project
- `DELETE /project/delete/:id` - Delete project
- `POST /project/addMember/:id` - Add team member
- `POST /project/removeMember/:id` - Remove team member
- `POST /project/addTask` - Add task to project

### Tasks
- `GET /task/` - Get user tasks
- `POST /task/create` - Create new task
- `PUT /task/update/:id` - Update task
- `DELETE /task/delete/:id` - Delete task

### Boards
- `GET /board/:projectId` - Get project boards
- `POST /board/create` - Create new board
- `PUT /board/update/:id` - Update board
- `DELETE /board/delete/:id` - Delete board


### Users
- `GET /user/me` - Get current user profile
- `PUT /user/update` - Update user profile

### Notifications
- `GET /notification/` - Get user notifications
- `POST /notification/markRead/:id` - Mark notification as read
- `DELETE /notification/delete/:id` - Delete notification

### Activities
- `GET /activity/` - Get recent project or user activities

## 🎯 Key Features in Detail


### Kanban Board System
- **Drag & Drop**: Seamless task movement between boards
- **Real-time Updates**: Instant synchronization across team members
- **Custom Boards**: Create boards with custom names and descriptions
- **Task Assignment**: Assign unassigned tasks to specific boards
- **Status Tracking**: Automatic status updates based on board positions

### Notifications & Activities
- **In-App Notifications**: Receive real-time notifications for task assignments, mentions, project updates, and more
- **Notification Center**: View, mark as read, or delete notifications
- **Activity Feed**: Track all recent project and team activities in a unified feed

### Task Management
- **Priority Levels**: Low, Medium, High priority classification
- **Due Dates**: Calendar-based due date selection
- **Rich Descriptions**: TipTap editor for detailed task descriptions
- **Status Workflow**: Todo → In Progress → Done progression
- **Assignment**: Assign tasks to specific team members

### Project Collaboration
- **Role Management**: Admin, Member, Viewer permissions
- **Team Invitations**: Email-based team member invitations
- **Access Control**: Role-based feature access
- **Project Ownership**: Clear project ownership and administration

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **CORS Protection**: Configured CORS for secure cross-origin requests
- **Session Management**: Secure session handling
- **Input Validation**: Server-side input validation and sanitization

## 🎨 UI/UX Highlights

- **Responsive Design**: Mobile-first responsive layouts
- **Modern Aesthetics**: Glassmorphism and modern UI patterns
- **Interactive Elements**: Smooth animations and transitions
- **Accessibility**: ARIA labels and keyboard navigation support
- **Loading States**: Comprehensive loading and error states
- **Toast Notifications**: User-friendly feedback system

## 🚧 Development

### Scripts

**Backend:**
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint

**Frontend:**
- `npm run dev` - Start Next.js development server
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run Next.js linter

### Database Management
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 🙏 Acknowledgments

- Next.js team for the amazing React framework
- Prisma team for the excellent ORM
- Material-UI for beautiful components
- Tailwind CSS for utility-first styling
- The open-source community for the incredible tools and libraries

---

⭐ **Star this repository if you found it helpful!**
