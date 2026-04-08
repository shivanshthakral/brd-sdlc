import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAppContext } from "../context/AppContext"
import api from "../lib/axios"

import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Select } from "../components/ui/select"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Input } from "../components/ui/input"
import { Loader2, Paperclip, Link as LinkIcon, FileText, Upload } from "lucide-react"
import toast from "react-hot-toast"

export default function RequirementInput() {
  const navigate = useNavigate()
  const { projects, updateProject } = useAppContext()

  const [selectedProjectId, setSelectedProjectId] = useState("")
  const [requirements, setRequirements] = useState<any[]>([])
  const [loadingReqs, setLoadingReqs] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Form State
  const [type, setType] = useState("Client Discussion")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [textContent, setTextContent] = useState("")
  const [links, setLinks] = useState("")
  const [files, setFiles] = useState<FileList | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch requirements when project changes
  useEffect(() => {
    if (selectedProjectId) {
      fetchRequirements()
    } else {
      setRequirements([])
    }
  }, [selectedProjectId])

  const fetchRequirements = async () => {
    setLoadingReqs(true)
    try {
      const { data } = await api.get(`/requirements/${selectedProjectId}`)
      setRequirements(data)
    } catch (error) {
      toast.error("Failed to load requirements")
    } finally {
      setLoadingReqs(false)
    }
  }

  const handleAddRequirement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProjectId) {
      toast.error("Please select a project first")
      return;
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("projectId", selectedProjectId)
      formData.append("type", type)
      formData.append("date", date)
      formData.append("textContent", textContent)

      const linkArray = links.split(",").map(l => l.trim()).filter(l => l)
      formData.append("links", JSON.stringify(linkArray))

      if (files) {
        for (let i = 0; i < files.length; i++) {
          formData.append("files", files[i])
        }
      }

      const { data } = await api.post("/requirements", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      setRequirements(prev => [data, ...prev])
      toast.success("Requirement added successfully")

      // Reset form
      setTextContent("")
      setLinks("")
      setFiles(null)
      const fileInput = document.getElementById('files') as HTMLInputElement
      if (fileInput) fileInput.value = ""

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add requirement")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGenerateBRD = async () => {
    if (!selectedProjectId) return

    setIsGenerating(true)
    try {
      await api.post("/brd/generate", { projectId: selectedProjectId })

      updateProject(selectedProjectId, { status: "Analysis" })

      toast.success("BRD Generated and Saved Successfully!")
      navigate(`/brd/${selectedProjectId}`)
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.message || error.message || "Failed to generate BRD backend")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-12">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Requirement Gathering</h2>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-4 border-b">
          <CardTitle>Select Project</CardTitle>
          <CardDescription>Choose the project to add requirements or generate a BRD for.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Select
            id="project"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="" disabled>-- Select a project --</option>
            {projects.map(p => (
              <option key={p.projectId} value={p.projectId}>
                {p.projectId} - {p.projectName} ({p.client})
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      {selectedProjectId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Requirement Form */}
          <Card>
            <form onSubmit={handleAddRequirement}>
              <CardHeader className="border-b bg-slate-50 dark:bg-slate-900 rounded-t-xl">
                <CardTitle className="text-xl">Add New Resource</CardTitle>
                <CardDescription>Upload files, add external links, or paste meeting transcripts.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Source Type</Label>
                    <Select id="type" value={type} onChange={(e) => setType(e.target.value)}>
                      <option value="Client Discussion">Client Discussion</option>
                      <option value="Internal Discussion">Internal Discussion</option>
                      <option value="Old Document">Old Document</option>
                      <option value="External Link">External Link</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textContent">Content Notes / Transcript</Label>
                  <Textarea
                    id="textContent"
                    placeholder="Provide meeting notes, transcript, or summary..."
                    rows={6}
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="links">External Links (comma separated)</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="links"
                      className="pl-9"
                      placeholder="https://example.com/doc1, https://example.com/doc2"
                      value={links}
                      onChange={(e) => setLinks(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="files">Upload Documents (.pdf, .doc, .txt)</Label>
                  <div className="relative">
                    <Upload className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="files"
                      type="file"
                      multiple
                      className="pl-9 cursor-pointer"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => setFiles(e.target.files)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 dark:bg-slate-900 border-t p-4 flex justify-end rounded-b-xl">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Paperclip className="mr-2 h-4 w-4" />}
                  Save to Project
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Timeline / Existing Requirements */}
          <div className="flex flex-col gap-4">
            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardHeader className="bg-primary text-primary-foreground rounded-t-xl py-4 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-xl">Project Brain</CardTitle>
                  <CardDescription className="text-primary-foreground/80">
                    All data that Gemini will use to write the BRD
                  </CardDescription>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleGenerateBRD}
                  className="font-semibold shadow-sm"
                >
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Generate New BRD"}
                </Button>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto max-h-[600px] bg-slate-50 dark:bg-slate-950/50">
                {loadingReqs ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : requirements.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                    <FileText className="h-12 w-12 mb-4 opacity-20" />
                    <p>No requirements added yet.</p>
                    <p className="text-sm">Add transcripts or files to build the project context.</p>
                  </div>
                ) : (
                  <div className="divide-y relative h-full">
                    {requirements.map((req, idx) => (
                      <div key={idx} className="p-5 bg-card hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-sm text-primary">{req.type}</span>
                          <span className="text-xs text-muted-foreground">{new Date(req.date).toLocaleDateString()}</span>
                        </div>
                        {req.textContent && (
                          <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3 mb-3">
                            "{req.textContent}"
                          </p>
                        )}
                        {(req.files?.length > 0 || req.links?.length > 0) && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {req.files?.map((f: string, i: number) => (
                              <span key={i} className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-medium dark:bg-blue-900/40 dark:text-blue-300">
                                <Paperclip className="h-3 w-3 mr-1" />
                                File Attached
                              </span>
                            ))}
                            {req.links?.map((l: string, i: number) => (
                              <a key={i} href={l} target="_blank" rel="noreferrer" className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-xs font-medium dark:bg-emerald-900/40 dark:text-emerald-300">
                                <LinkIcon className="h-3 w-3 mr-1" />
                                External Link
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
