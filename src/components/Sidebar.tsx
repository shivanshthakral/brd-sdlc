import { NavLink } from "react-router-dom"
import { LayoutDashboard, FolderPlus, MessageSquareQuote, FileText } from "lucide-react"
import { cn } from "../lib/utils"

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderPlus },
  { name: "Requirement Input", href: "/requirement", icon: MessageSquareQuote },
  { name: "BRD Generator", href: "/brd", icon: FileText },
]

export function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card text-card-foreground">
      <div className="flex h-14 items-center border-b px-4">
        <h1 className="text-lg font-bold tracking-tight text-primary">ProjLifecycle</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                isActive ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="border-t p-4 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            MS
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Marc Smith</span>
            <span className="text-xs text-muted-foreground">Manager</span>
          </div>
        </div>
      </div>
    </div>
  )
}
