import { create } from "zustand";
import api from "@/lib/axios";

export const useGameStore = create((set, get) => ({
  // ----------------------------------
  // 🧠 STATE (The Data)
  // ----------------------------------
  user: null,          // { id, name, points, cursedEnergy, ... }
  tasks: [],           // List of active tasks
  inventory: [],       // List of characters owned
  battleLogs: [],      // History of simulations
  isLoading: false,    // Global loading state
  error: null,         // Error messages

  // ----------------------------------
  // ⚡ ACTIONS (The Logic)
  // ----------------------------------

  // 1. Initialize User Data (Profile + Points)
  fetchUserData: async () => {
    set({ isLoading: true });
    try {
      // We assume the auth endpoint returns the user profile
      const res = await api.post("/auth/google"); 
      set({ user: res.data.user, isLoading: false });
    } catch (err) {
      console.error("Failed to fetch user data", err);
      set({ error: "Failed to load profile", isLoading: false });
    }
  },

  // 2. Task Management (Kogane Dashboard)
  fetchTasks: async () => {
    try {
      const res = await api.get("/tasks");
      set({ tasks: res.data });
    } catch (err) {
      console.error(err);
    }
  },

  createTask: async (title, difficulty) => {
    const tempId = Date.now().toString(); // Temporary ID for optimistic UI
    const newTask = { 
      id: tempId, 
      title, 
      difficulty, 
      isCompleted: false, 
      pointsReward: 0 // Placeholder until server confirms
    };

    // Optimistic Update: Add to list immediately
    set((state) => ({ tasks: [newTask, ...state.tasks] }));

    try {
      const res = await api.post("/tasks", { title, difficulty });
      // Replace temp task with real server data
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === tempId ? res.data : t)),
      }));
    } catch (err) {
      // Rollback on failure
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== tempId) }));
      console.error("Task creation failed", err);
    }
  },

  completeTask: async (taskId) => {
    // Find the task to get its points (for optimistic score update)
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Optimistic Update: Mark complete & Add fake points
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, isCompleted: true } : t
      ),
      user: { ...state.user, points: state.user.points + task.pointsReward },
    }));

    try {
      const res = await api.patch(`/tasks/${taskId}/complete`);
      // Sync with real server data (Server might have bonus logic)
      set((state) => ({
        user: { ...state.user, points: res.data.userPoints },
      }));
    } catch (err) {
      // Rollback
      console.error("Task completion failed", err);
      get().fetchTasks(); // Re-fetch to reset state
      get().fetchUserData();
    }
  },

  deleteTask: async (taskId) => {
    // Optimistic Delete
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    }));

    try {
      await api.delete(`/tasks/${taskId}`);
    } catch (err) {
      console.error("Delete failed", err);
      get().fetchTasks(); // Rollback
    }
  },

  // 3. Gacha System (Summoning)
  summonCharacter: async () => {
    set({ isLoading: true });
    try {
      const res = await api.post("/gacha/summon");
      const { character, userPoints, isNew } = res.data;

      // Update Points & Inventory
      set((state) => ({
        user: { ...state.user, points: userPoints },
        inventory: isNew 
            ? [...state.inventory, { character }] // Add new char
            : state.inventory, // If duplicate, we just updated points (server handles levels)
        isLoading: false
      }));

      return res.data; // Return data so the UI can show the animation
    } catch (err) {
      set({ error: err.response?.data?.error || "Summon Failed", isLoading: false });
      throw err;
    }
  },

  fetchInventory: async () => {
    try {
      const res = await api.get("/characters/me");
      set({ inventory: res.data });
    } catch (err) {
      console.error(err);
    }
  },

  // 4. Colony System (Battle)
  startPatrol: async () => {
    set({ isLoading: true });
    try {
      const res = await api.post("/colony/patrol");
      const { result, pointsEarned } = res.data;

      // Update Energy & Points
      set((state) => ({
        user: { 
            ...state.user, 
            points: state.user.points + pointsEarned,
            cursedEnergy: state.user.cursedEnergy - 20 
        },
        isLoading: false
      }));

      return res.data; // Return logs for playback
    } catch (err) {
      set({ error: err.response?.data?.error || "Patrol Failed", isLoading: false });
      throw err;
    }
  },

  fetchBattleLogs: async () => {
    try {
      const res = await api.get("/colony/logs");
      set({ battleLogs: res.data });
    } catch (err) {
      console.error(err);
    }
  },
}));