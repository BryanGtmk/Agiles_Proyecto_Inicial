"use client"

import { Wrench } from "lucide-react"
import { MobileNav } from "./mobile-nav"

interface AppHeaderProps {
  title: string
}

export function AppHeader({ title }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
      <MobileNav />
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Wrench className="h-4 w-4 text-primary-foreground" />
        </div>
      </div>
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
    </header>
  )
}
