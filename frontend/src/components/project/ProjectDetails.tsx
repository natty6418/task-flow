"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import NewTaskModal from "../modals/NewTaskModal";
import { Project } from "@/types/type";
import { useDebounce } from "use-debounce";
import API from "@/services/api";
import toast from "react-hot-toast";
import AddMemberModal from "../modals/AddMemberModal";
import AddBoardModal from "../modals/AddBoardModal";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { useRouter } from "next/navigation";
import {updateProject as updateProjectService} from "@/services/projectService";
import { Role } from "@/types/type";
import FloatingActionButton from "../common/FloatingActionButton";
import { Task, Status, Priority } from "@/types/type";
import { v4 as uuidv4 } from "uuid";
import ProjectHeader from "./ProjectHeader";
import ProjectMainContent from "./ProjectMainContent";
import ProjectStatsPanel from "./ProjectStatsPanel";
import ProjectMembersPanel from "./ProjectMembersPanel";
import { getTargetBoardIdForStatus, handleTaskStatusChange } from "@/utils/boardUtils";
import { createTask , deleteTask, updateTask, assignTask} from "@/services/taskSevice";
import { useDebouncedCallback } from "use-debounce";

export default function ProjectDetails({ project, setProject }: { project: Project, setProject: (project: Project) => void; }) {
	const [name, setName] = useState(project.name);
	const [description, setDescription] = useState(project.description || "");
	const [members, setMembers] = useState(project.projectMemberships);
	const [boards, setBoards] = useState(project.boards);
	const [tasks, setTasks] = useState(project.tasks);
	const [showAddMemberModal, setShowAddMemberModal] = useState(false);
	const [showAddBoardModal, setShowAddBoardModal] = useState(false);
	const [showTaskModal, setShowTaskModal] = useState(false);
	const [boardView, setBoardView] = useState<"list" | "kanban">("kanban");
	const [removingId, setRemovingId] = useState<string | null>(null);

	const [debouncedName] = useDebounce(name, 2000);
	const [debouncedDescription] = useDebounce(description, 2000);
	const [menuOpen, setMenuOpen] = useState(false);
	const { user } = useAuth();
	const { setProjects } = useApp();
	const router = useRouter();

	const [updatingTasks, setUpdatingTasks] = useState<Set<string>>(new Set());
	const pendingChangesRef = useRef<Record<string, Partial<Task>>>({});
	const originalTasksRef = useRef<Record<string, Task>>({});

	useEffect(() => {
		// Update the project with current state
		setProject({
			...project,
			name: debouncedName,
			description: debouncedDescription,
			projectMemberships: members,
			boards: boards,
			tasks: tasks,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedName, debouncedDescription, members, boards, tasks]); // Intentionally excluding project and setProject to prevent recursion

	// Ensure default boards exist - commented out to prevent infinite loops
	// TODO: Implement this in a way that doesn't cause infinite API calls
	// useEffect(() => {
	//   const initializeDefaultBoards = async () => {
	//     if (project?.id && boards.length !== undefined) {
	//       await ensureDefaultBoards(project.id, boards, setBoards);
	//     }
	//   };
	//   
	//   initializeDefaultBoards();
	// }, [project?.id, boards, setBoards]); // Include all dependencies

	
	const isAdmin = members.some((m) => m.user.id === user?.id && m.role === Role.ADMIN);
	const handleRemoveMember = async (id: string) => {
		if (!confirm("Are you sure you want to remove this member?")) return;

		try {
			setRemovingId(id);
			await API.post(`/project/removeMember/${project.id}`, { memberId: id }, { withCredentials: true });
			setMembers((prev) => prev.filter((m) => m.user.id !== id));
		} catch (error) {
			console.error("Error removing member:", error);
			toast.error("Failed to remove member.");
		} finally {
			setRemovingId(null);
		}
	};

	useEffect(() => {
		const updateProject = async () => {
			try {
				await updateProjectService(project.id, {
					name: debouncedName,
					description: debouncedDescription,
				})
					setName(debouncedName);
					setDescription(debouncedDescription);
					toast.success("Project updated successfully");
			} catch (error) {
				toast.error("Failed to update project");
				console.error("Failed to update project:", error);
			}
		};

		if (
			debouncedName !== project.name ||
			debouncedDescription !== project.description
		) {
			updateProject();
		}
	}, [
		debouncedName,
		debouncedDescription,
		project.id,
		project.name,
		project.description,
	]);

	const handleRemoveProject = async (projectId: string) => {
		try {
			const response = await API.delete(`/project/${projectId}`, {
				withCredentials: true,
			});
			if (response.status === 200) {
				toast.success("Project removed successfully");
				setProjects((prevProjects) =>
					prevProjects.filter((proj) => proj.id !== projectId)
				);
				router.push("/");
				router.refresh();
			}
		} catch (error) {
			toast.error("Failed to remove project");
			console.error("Failed to remove project:", error);
		}
	};

	const confirmLeave = () => {
		const confirmed = window.confirm(
			"Are you sure you want to leave this project?"
		);
		if (confirmed) {
			handleRemoveProject(project.id);
		}
	};

	const getUniqueTaskName = useCallback(() => {
		const existingNames = new Set(tasks.map((task) => task.title.toLowerCase()));
		let newName = "Untitled Task";
		let counter = 1;

		while (existingNames.has(newName.toLowerCase())) {
			newName = `Untitled Task ${counter}`;
			counter++;
		}

		return newName;
	}, [tasks]);

	 const handleAddTask = () => {
		// Find the appropriate board for TODO status
		const targetBoardId = getTargetBoardIdForStatus(boards, Status.TODO);
		
		const newTask: Task = {
			id: `temp-${uuidv4()}`,
			title: getUniqueTaskName(),
			description: "",
			status: Status.TODO,
			priority: Priority.MEDIUM,
			dueDate: new Date(),
			createdAt: new Date(),
			updatedAt: new Date(),
			projectId: project.id,
			boardId: targetBoardId, // Assign to the TODO board if it exists
		};

		setTasks((prev) => [newTask, ...prev]);

		const addTask = async () => {
			try {
			 

				const savedTask = await createTask(newTask);
				console.log("Task created:", savedTask);
				setTasks((prev) =>
					prev.map((task) => (task.id === newTask.id ? savedTask : task))
				);
			} catch (error) {
				console.error("Failed to create task:", error);
				setTasks((prev) => prev.filter((task) => task.id !== newTask.id));
			}
		};

		addTask();
	};

	const handleRemoveTask = 
			async (taskId: string) => {
				try {
					await deleteTask(taskId)
					setTasks((prev) => prev.filter((t) => t.id !== taskId));
				} catch (error) {
					console.error("Failed to delete task:", error);
				}
			}
			
	const flushChanges = useDebouncedCallback(async () => {
		const changesToFlush = { ...pendingChangesRef.current };
		pendingChangesRef.current = {};

		if (Object.keys(changesToFlush).length === 0) return;

		const updatePromises = Object.entries(changesToFlush).map(
			async ([taskId, changes]) => {
				const originalTask = originalTasksRef.current[taskId];
				// The backend requires the title, so we ensure it's part of the payload.
				// We get it from the original task snapshot to avoid issues with stale state.
				const payload = { 
					...originalTask,
					...changes,
				};

				try {
					const updatedTask = await updateTask(payload)
					// Success: Update the task with server's response
					setTasks((prevTasks) =>
						prevTasks.map((task) =>
							task.id === taskId ? updatedTask : task
						)
					);
					delete originalTasksRef.current[taskId];
				} catch (error) {
					console.error(error);
					// Failure: Rollback to the original state
					if (originalTask) {
						setTasks((prevTasks) =>
							prevTasks.map((task) =>
								task.id === taskId ? originalTask : task
							)
						);
						delete originalTasksRef.current[taskId];
					}
				} finally {
					setUpdatingTasks((prev) => {
						const newSet = new Set(prev);
						newSet.delete(taskId);
						return newSet;
					});
				}
			}
		);

		await Promise.all(updatePromises);
	}, 1500);

	// Add this new function to handle task assignment
	const handleTaskAssignment = async (taskId: string, assignedToId: string | undefined) => {
		const currentTask = tasks.find((t) => t.id === taskId);
		if (!currentTask) return;

		try {
			setUpdatingTasks((prev) => new Set(prev).add(taskId));

			// Optimistic UI update
			setTasks((prevTasks) =>
				prevTasks.map((task) =>
					task.id === taskId
						? { 
								...task, 
								assignedToId, 
								assignedTo: assignedToId 
									? members.find(m => m.user.id === assignedToId)?.user 
									: undefined,
								updatedAt: new Date() 
							}
						: task
				)
			);

			let updatedTask;
			if (assignedToId) {
				// Assign task
				updatedTask = await assignTask(taskId, assignedToId);
			} else {
				// Unassign task - use the generic update task with assignedToId: undefined
				updatedTask = await updateTask({ ...currentTask, assignedToId: undefined, assignedTo: undefined });
			}

			// Update with server response
			setTasks((prevTasks) =>
				prevTasks.map((task) =>
					task.id === taskId ? updatedTask : task
				)
			);

			toast.success(assignedToId ? 'Task assigned successfully' : 'Task unassigned successfully');

		} catch (error) {
			console.error('Failed to update task assignment:', error);
			
			// Rollback optimistic update
			setTasks((prevTasks) =>
				prevTasks.map((task) =>
					task.id === taskId ? currentTask : task
				)
			);
			
			toast.error('Failed to update task assignment');
		} finally {
			setUpdatingTasks((prev) => {
				const newSet = new Set(prev);
				newSet.delete(taskId);
				return newSet;
			});
		}
	};

	const handleUpdateTask = (
		taskId: string,
		field: keyof Task,
		value: Task[keyof Task]
	) => {
		const currentTask = tasks.find((t) => t.id === taskId);
		if (!currentTask) return;

		// Check if the value has actually changed
		if (currentTask[field] === value) {
			return; // No change, don't do anything
		}

		// Handle assignedToId changes with dedicated services
		if (field === 'assignedToId') {
			handleTaskAssignment(taskId, value as string | undefined);
			return;
		}

		// Handle status changes - move task to appropriate board
		if (field === 'status' && value !== currentTask.status) {
			const newStatus = value as Status;
			const targetBoardId = handleTaskStatusChange(taskId, newStatus, boards, tasks, setTasks);
			
			// Store the original task state if this is the first change in a batch
			if (!originalTasksRef.current[taskId]) {
				originalTasksRef.current[taskId] = currentTask;
			}

			setUpdatingTasks((prev) => new Set(prev).add(taskId));

			// Include boardId in pending changes if a target board was found
			pendingChangesRef.current[taskId] = {
				...pendingChangesRef.current[taskId],
				[field]: value,
				...(targetBoardId && { boardId: targetBoardId }),
			} as Partial<Task>;

			flushChanges();
			return;
		}
	
		// Store the original task state if this is the first change in a batch
		if (!originalTasksRef.current[taskId]) {
			originalTasksRef.current[taskId] = currentTask;
		}

		// Optimistic UI update
		setTasks((prevTasks) =>
			prevTasks.map((task) =>
				task.id === taskId
					? { ...task, [field]: value, updatedAt: new Date() }
					: task
			)
		);

		setUpdatingTasks((prev) => new Set(prev).add(taskId));

		pendingChangesRef.current[taskId] = {
			...pendingChangesRef.current[taskId],
			[field]: value,
		};

		flushChanges();
	};



	return (
		<div className="min-h-screen bg-gray-50">
			<div className="w-full mx-auto px-4 py-6">
				{/* Project Header */}
				<ProjectHeader
					name={name}
					description={description}
					project={project}
					setName={setName}
					setDescription={setDescription}
					menuOpen={menuOpen}
					setMenuOpen={setMenuOpen}
					confirmLeave={confirmLeave}
				/>

				{/* Floating Action Button */}
				<FloatingActionButton
					setShowAddBoardModal={setShowAddBoardModal}
					setShowTaskModal={setShowTaskModal}
					setShowAddMemberModal={setShowAddMemberModal}
				/>

				{/* Main Content Grid */}
				<div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
					{/* Left Column - Main Content */}
					<div className="xl:col-span-3">
						<ProjectMainContent
							projectId={project.id}
							boards={boards}
							tasks={tasks}
							members={members}
							boardView={boardView}
							setBoardView={setBoardView}
							setTasks={setTasks}
							setBoards={setBoards}
							setShowAddBoardModal={setShowAddBoardModal}
							handleAddTask={handleAddTask}
							handleUpdateTask={handleUpdateTask}
							handleRemoveTask={handleRemoveTask}
							updatingTasks={updatingTasks}
						/>
					</div>

					{/* Right Column - Sidebar */}
					<div className="xl:col-span-1 space-y-6">
						{/* Project Stats Panel */}
						<ProjectStatsPanel
							tasks={tasks}
							members={members}
							boards={boards}
						/>

						{/* Team Members Panel */}
						<ProjectMembersPanel
							members={members}
							isAdmin={isAdmin}
							user={user}
							setShowAddMemberModal={setShowAddMemberModal}
							handleRemoveMember={handleRemoveMember}
							removingId={removingId}
						/>

						{/* Recent Tasks Panel */}
					</div>
				</div>
			</div>

			{/* Modals */}
			{showTaskModal && (
				<NewTaskModal
					projectId={project.id}
					onClose={() => setShowTaskModal(false)}
					setTasks={setTasks}
				/>
			)}
			{showAddMemberModal && (
				<AddMemberModal
					projectId={project.id}
					setMembers={setMembers}
					onClose={() => setShowAddMemberModal(false)}
				/>
			)}
			{showAddBoardModal && (
				<AddBoardModal
					projectId={project.id}
					setBoards={setBoards}
					onClose={() => setShowAddBoardModal(false)}
				/>
			)}
		</div>
	);
}
