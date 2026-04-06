import { create } from "zustand"
import { persist } from "zustand/middleware"

interface WorkspaceState {
  // Workspace data (populated from dashboard layout)
  id: string | null
  name: string
  slug: string
  plan: string
  aiCreditsUsed: number
  aiCreditsLimit: number
  logoUrl: string | null

  // User data
  userId: string | null
  userEmail: string | null
  userName: string | null

  // Sidebar UI
  sidebarCollapsed: boolean

  // Actions
  setWorkspace: (data: Partial<WorkspaceState>) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  incrementCreditsUsed: () => void
  reset: () => void
}

const initialState = {
  id: null,
  name: "My Workspace",
  slug: "",
  plan: "FREE",
  aiCreditsUsed: 0,
  aiCreditsLimit: 25,
  logoUrl: null,
  userId: null,
  userEmail: null,
  userName: null,
  sidebarCollapsed: false,
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      ...initialState,

      setWorkspace: (data) => set((state) => ({ ...state, ...data })),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      incrementCreditsUsed: () =>
        set((state) => ({ aiCreditsUsed: state.aiCreditsUsed + 1 })),

      reset: () => set(initialState),
    }),
    {
      name: "zenia-workspace",
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
)
