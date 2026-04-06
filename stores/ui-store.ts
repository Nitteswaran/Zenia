import { create } from "zustand"

interface UIState {
  // Command palette
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void
  toggleCommandPalette: () => void

  // Upgrade modal
  upgradeModalOpen: boolean
  upgradeModalMessage: string
  openUpgradeModal: (message?: string) => void
  closeUpgradeModal: () => void

  // Global loading
  globalLoading: boolean
  setGlobalLoading: (loading: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),

  upgradeModalOpen: false,
  upgradeModalMessage: "",
  openUpgradeModal: (message = "Upgrade your plan to unlock this feature.") =>
    set({ upgradeModalOpen: true, upgradeModalMessage: message }),
  closeUpgradeModal: () => set({ upgradeModalOpen: false }),

  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
}))
