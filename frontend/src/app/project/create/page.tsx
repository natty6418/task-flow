import CreateProjectForm from "@/components/CreateProjectForm";

export default function CreateProject() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">
          🚀 Create a New Project
        </h1>
        <CreateProjectForm />
      </div>
    </div>
  );
}
