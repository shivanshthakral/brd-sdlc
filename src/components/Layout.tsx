import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

export function Layout() {
  return (
    <div className="flex min-h-screen w-full flex-row bg-muted/40 font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 sm:gap-4 sm:py-4 sm:pl-4 bg-background pl-0">
        <div className="flex flex-col rounded-tl-xl border bg-background overflow-hidden flex-1 shadow-sm">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
