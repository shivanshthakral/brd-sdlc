import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AppProvider } from "./context/AppContext"
import { Layout } from "./components/Layout"
import Dashboard from "./pages/Dashboard"
import CreateProject from "./pages/CreateProject"
import RequirementInput from "./pages/RequirementInput"
import BRDOutput from "./pages/BRDOutput"

function App() {
  return (
    <Router>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<CreateProject />} />
            <Route path="requirement" element={<RequirementInput />} />
            <Route path="brd" element={<BRDOutput />} />
            <Route path="brd/:id" element={<BRDOutput />} />
          </Route>
        </Routes>
      </AppProvider>
    </Router>
  )
}

export default App
