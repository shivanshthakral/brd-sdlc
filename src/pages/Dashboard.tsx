import { useNavigate } from "react-router-dom"
import { Plus, Loader2 } from "lucide-react"
import { useAppContext } from "../context/AppContext"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import { Badge } from "../components/ui/badge"

export default function Dashboard() {
  const { projects, loading } = useAppContext()
  const navigate = useNavigate()

  const total = projects.length
  const active = projects.filter(p => p.status !== "Completed").length
  const completed = projects.filter(p => p.status === "Completed").length
  const inRequirement = projects.filter(p => p.status === "Requirement Gathering").length

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Requirement Gathering": return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300"
      case "Analysis": return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300"
      case "Development": return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-300"
      case "Testing": return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300"
      case "Completed": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300"
      default: return ""
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button onClick={() => navigate("/projects")}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Project
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Requirement Phase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inRequirement}</div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold leading-none tracking-tight">Recent Projects</h3>
        </div>
        <div className="p-6 pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project ID</TableHead>
                <TableHead>Project Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Geography</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.projectId}>
                  <TableCell className="font-medium">{project.projectId}</TableCell>
                  <TableCell>{project.projectName}</TableCell>
                  <TableCell>{project.client}</TableCell>
                  <TableCell>{project.geography}</TableCell>
                  <TableCell>{project.owner}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
