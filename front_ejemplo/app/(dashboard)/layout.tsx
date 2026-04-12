import { AppSidebar } from "@/components/app-sidebar"
import { StoreProvider } from "@/lib/store-context"
import { Toaster } from "@/components/ui/sonner"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StoreProvider>
      <div className="min-h-screen bg-background">
        <AppSidebar />
        <div className="lg:pl-64">
          <main className="min-h-screen">{children}</main>
        </div>
      </div>
      <Toaster position="top-right" />
    </StoreProvider>
  )
}
