import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Download, FileText, Printer, ChevronDown, Plus } from "lucide-react"
import { useAppContext } from "../context/AppContext"
import api from "../lib/axios"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import ReactMarkdown from "react-markdown"
import toast from "react-hot-toast"

export default function BRDOutput() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { projects, draftBrdContent } = useAppContext()
  
  const [project, setProject] = useState(projects.find(p => p.projectId === id))
  const [versions, setVersions] = useState<any[]>([])
  const [activeVersion, setActiveVersion] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If we land here but context hasn't loaded project yet, let's wait or fetch it
    const foundProject = projects.find(p => p.projectId === id)
    if (foundProject) setProject(foundProject)
  }, [id, projects])

  useEffect(() => {
    if (id) {
      if (draftBrdContent && draftBrdContent[id]) {
        const draftVersion = {
          _id: "draft",
          projectId: id,
          version: "Draft (Unsaved)",
          content: draftBrdContent[id],
          generatedAt: new Date().toISOString()
        };
        setVersions([draftVersion]);
        setActiveVersion(draftVersion);
        setLoading(false);
      } else {
        fetchVersions()
      }
    }
  }, [id, draftBrdContent])

  const fetchVersions = async () => {
    try {
      const { data } = await api.get(`/brd/${id}`)
      setVersions(data)
      if (data.length > 0) {
        setActiveVersion(data[0]) // Select latest version by default
      }
    } catch (error) {
      toast.error("Failed to load BRD versions")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadWord = () => {
    if (!project || !activeVersion) return;
    
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Business Requirement Document V${activeVersion.version}</title></head><body>`;
    const footer = `</body></html>`;
    
    // We can convert markdown to basic HTML or just wrap in <pre> if simple, or we can let the user download it.
    // For Word, sending formatted HTML is best. We'll build a simple plain-text renderer for the word doc blob.
    // A better approach in a real app would be to use docx library or use a proper HTML converter.
    // We will render the content inside a div since activeVersion.content has markdown.
    // For this prototype, we'll export the raw markdown enclosed in basic styling.
    const content = `
      <h1>Business Requirement Document - ${project.projectName}</h1>
      <p><strong>Project ID:</strong> ${project.projectId}</p>
      <p><strong>Version:</strong> ${activeVersion.version}</p>
      <hr />
      <pre style="font-family: inherit; white-space: pre-wrap;">${activeVersion.content}</pre>
    `
  
    const blob = new Blob(['\ufeff', header + content + footer], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BRD_${project.projectId}_V${activeVersion.version}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading Document...</div>
  }

  if (!project || versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
        <FileText className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
        <h2 className="text-2xl font-bold tracking-tight mb-2">No Document Available</h2>
        <p className="text-muted-foreground mb-6">
          You need to generate a BRD from the requirement input page first.
        </p>
        <Button onClick={() => navigate("/requirement")}>Go to Requirement Input</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-12">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">BRD Viewer</h2>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <select 
              className="appearance-none bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md py-2 pl-4 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary h-10"
              value={activeVersion?._id || ""}
              onChange={(e) => {
                const ver = versions.find(v => v._id === e.target.value)
                if (ver) setActiveVersion(ver)
              }}
            >
              {versions.map(v => (
                <option key={v._id} value={v._id}>
                  Version {v.version} - {new Date(v.generatedAt).toLocaleDateString()}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>

          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button className="gap-2" onClick={handleDownloadWord}>
            <Download className="h-4 w-4" />
            Export Word
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border shadow-md">
        <div className="bg-primary/5 border-b p-8 pb-4 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-2">Business Requirement Document</h1>
            <p className="text-xl text-muted-foreground">{project.projectName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-500">CONFIDENTIAL</p>
            <p className="text-sm text-muted-foreground mt-1 text-primary font-medium">
              Version {activeVersion?.version}
            </p>
            <p className="text-sm text-muted-foreground">
              Generated: {new Date(activeVersion?.generatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-muted/30 border-b p-6 px-8 grid grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Project ID</span>
            <span className="font-medium">{project.projectId}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Client</span>
            <span className="font-medium">{project.client}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Prepared By</span>
            <span className="font-medium">{project.owner}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Geography</span>
            <span className="font-medium">{project.geography}</span>
          </div>
        </div>

        <CardContent className="p-10 space-y-10 bg-white dark:bg-slate-950 font-serif leading-relaxed text-slate-800 dark:text-slate-300">
          <div className="markdown-body [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-primary [&>h1]:mb-6 [&>h1]:border-b [&>h1]:pb-2 [&>h1]:font-sans [&>h1]:uppercase [&>h1]:tracking-wide
                          [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-primary [&>h2]:mb-4 [&>h2]:mt-8 [&>h2]:border-b [&>h2]:pb-2 [&>h2]:font-sans [&>h2]:uppercase [&>h2]:tracking-wide 
                          [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-slate-800 [&>h3]:dark:text-slate-200 [&>h3]:mt-6 [&>h3]:mb-2 
                          [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-2 [&>ul]:mb-4
                          [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-3 [&>ol]:mb-4
                          [&>p]:mb-4 [&>strong]:font-bold [&>table]:w-full [&>table]:border-collapse [&>table]:mb-6
                          [&>table>thead]:bg-muted [&>table>thead>tr>th]:p-3 [&>table>thead>tr>th]:text-left [&>table>thead>tr>th]:font-medium
                          [&>table>tbody>tr>td]:p-3 [&>table>tbody>tr>td]:border-b">
            {activeVersion && (
              <ReactMarkdown>{activeVersion.content}</ReactMarkdown>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
