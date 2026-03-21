import { Bell, Search, Settings } from "lucide-react"

export function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search projects..."
              className="w-full appearance-none bg-background pl-8 shadow-none focus-visible:outline-none sm:w-2/3 md:w-1/3 text-sm h-9 rounded-md border border-input"
            />
          </div>
        </form>
      </div>
      <button className="rounded-full w-8 h-8 flex items-center justify-center hover:bg-muted text-muted-foreground">
        <Bell className="h-4 w-4" />
        <span className="sr-only">Toggle notifications</span>
      </button>
      <button className="rounded-full w-8 h-8 flex items-center justify-center hover:bg-muted text-muted-foreground">
        <Settings className="h-4 w-4" />
        <span className="sr-only">Toggle settings</span>
      </button>
    </header>
  )
}
