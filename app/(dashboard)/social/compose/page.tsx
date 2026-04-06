import { PostComposer } from "@/components/social/PostComposer"

export const metadata = { title: "Compose Post — Zenia" }

export default function ComposePage() {
  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Social Media Hub</p>
        <h1 className="text-3xl font-display font-bold tracking-tight">Compose Post</h1>
      </div>
      <PostComposer />
    </div>
  )
}
