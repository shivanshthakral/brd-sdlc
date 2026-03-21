import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import api from "../lib/axios"

export type ProjectStatus = 
  | "Requirement Gathering"
  | "Analysis"
  | "Development"
  | "Testing"
  | "Completed"

export interface Project {
  _id?: string
  projectId: string
  projectName: string
  client: string
  geography: string
  owner: string
  startDate: string
  status: ProjectStatus
  description?: string
  brdGenerated?: boolean
}

interface AppContextType {
  projects: Project[]
  loading: boolean
  addProject: (p: Partial<Project>) => Promise<void>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  getProject: (id: string) => Project | undefined
  fetchProjects: () => Promise<void>
  draftBrdContent: Record<string, string>
  setDraftBrdContent: (projectId: string, content: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [draftBrdContent, setDraftBrdContentState] = useState<Record<string, string>>({})

  const setDraftBrdContent = (projectId: string, content: string) => {
    setDraftBrdContentState(prev => ({ ...prev, [projectId]: content }))
  }

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const { data } = await api.get("/projects")
      setProjects(data)
    } catch (e) {
      console.error("Failed to fetch projects", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const addProject = async (p: Partial<Project>) => {
    const { data } = await api.post("/projects", p)
    setProjects(prev => [data, ...prev])
  }
  
  const updateProject = async (id: string, updates: Partial<Project>) => {
    const { data } = await api.put(`/projects/${id}`, updates)
    setProjects(prev => prev.map(p => p.projectId === id ? data : p))
  }
  
  const getProject = (id: string) => projects.find(p => p.projectId === id)

  return (
    <AppContext.Provider value={{ projects, loading, addProject, updateProject, getProject, fetchProjects, draftBrdContent, setDraftBrdContent }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
