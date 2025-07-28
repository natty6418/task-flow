
# TaskFlow

> A modern, collaborative project and task management app built with Next.js, React, and Tailwind CSS.

## Features

- 🏠 **Dashboard**: Get a quick overview of your projects, boards, and recent activity.
- 📋 **Projects & Boards**: Organize your work into projects, each with its own Kanban boards and tasks.
- ✅ **Task Management**: Create, edit, prioritize, and track tasks with due dates, priorities, and statuses (To Do, In Progress, Done).
- 👥 **Collaboration**: Add members to projects, assign tasks, and manage team roles.
- 🔔 **Notifications**: Manage how you receive updates about tasks, mentions, and project activity.
- ⚙️ **Settings**: Personalize your profile, account, notification preferences, and more.

- 🔌 **Integrations**: (Planned) Connect with tools like Slack and Google Calendar.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000) to use TaskFlow.

## Folder Structure

- `src/app/` — App routes and pages (dashboard, login, signup, project, settings, etc.)
- `src/components/` — Reusable UI components (modals, lists, kanban, settings, etc.)
- `src/contexts/` — React context providers (e.g., authentication)
- `src/services/` — API and data service logic
- `src/types/` — TypeScript types and enums
- `public/` — Static assets

## Customization

- **Styling:** Uses Tailwind CSS for rapid UI development and theming.
- **Icons:** Uses [Lucide](https://lucide.dev/) for modern, consistent icons.
- **Fonts:** Uses [Geist](https://vercel.com/font) for a clean, readable interface.

## Contributing

Pull requests and issues are welcome! Please open an issue to discuss your ideas or report bugs.

## License

MIT
