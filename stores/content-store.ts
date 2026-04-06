import { create } from "zustand"

interface ContentDraft {
  type: string
  platform: string
  topic: string
  tone: string
  audience: string
  keywords: string[]
  length: string
  additionalContext: string
  generatedText: string
}

interface ContentState {
  // Current generation form draft (survives navigation)
  draft: ContentDraft
  updateDraft: (fields: Partial<ContentDraft>) => void
  resetDraft: () => void

  // Generation state
  isGenerating: boolean
  setIsGenerating: (v: boolean) => void

  streamingText: string
  appendStreamingText: (chunk: string) => void
  clearStreamingText: () => void
}

const defaultDraft: ContentDraft = {
  type: "BLOG_POST",
  platform: "",
  topic: "",
  tone: "professional",
  audience: "",
  keywords: [],
  length: "medium",
  additionalContext: "",
  generatedText: "",
}

export const useContentStore = create<ContentState>((set) => ({
  draft: defaultDraft,
  updateDraft: (fields) => set((s) => ({ draft: { ...s.draft, ...fields } })),
  resetDraft: () => set({ draft: defaultDraft }),

  isGenerating: false,
  setIsGenerating: (v) => set({ isGenerating: v }),

  streamingText: "",
  appendStreamingText: (chunk) => set((s) => ({ streamingText: s.streamingText + chunk })),
  clearStreamingText: () => set({ streamingText: "" }),
}))
