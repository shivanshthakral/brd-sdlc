import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAppContext, type Project } from "../context/AppContext"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Select } from "../components/ui/select"
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"

export default function CreateProject() {
  const navigate = useNavigate()
  const { addProject } = useAppContext()

  const [formData, setFormData] = useState({
    projectId: `PRJ${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    projectName: "",
    clientName: "",
    geography: "North America",
    owner: "",
    startDate: new Date().toISOString().split('T')[0],
    description: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const newProject: Partial<Project> = {
        projectId: formData.projectId,
        projectName: formData.projectName,
        client: formData.clientName,
        geography: formData.geography,
        owner: formData.owner,
        startDate: formData.startDate,
        status: "Requirement Gathering",
        description: formData.description
      }
      await addProject(newProject)
      toast.success("Project created successfully!")
      navigate("/")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create project")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Create Project</h2>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Enter the basic information to initialize a new project.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectId">Project ID</Label>
                <Input id="projectId" name="projectId" value={formData.projectId} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input id="projectName" name="projectName" required value={formData.projectName} onChange={handleChange} placeholder="e.g. Digital Transformation" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input id="clientName" name="clientName" required value={formData.clientName} onChange={handleChange} placeholder="e.g. Acme Corp" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="geography">Geography</Label>
                <Select id="geography" name="geography" value={formData.geography} onChange={handleChange}>
                  <option value="North America">North America</option>
                  <option value="Europe">Europe</option>
                  <option value="APAC">APAC</option>
                  <option value="LATAM">LATAM</option>
                  <option value="Global">Global</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner">Project Owner</Label>
                <Input id="owner" name="owner" required value={formData.owner} onChange={handleChange} placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input type="date" id="startDate" name="startDate" required value={formData.startDate} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Project Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="Briefly describe the project objectives and scope..." 
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            <Button type="button" variant="outline" onClick={() => navigate("/")} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Project
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
