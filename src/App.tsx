import { Route, Routes } from 'react-router'
import Home from './pages/Home'
import AllProjects from './pages/AllProjects'
import ProjectPage from './pages/ProjectPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projects" element={<AllProjects />} />
      <Route path="/projects/:slug" element={<ProjectPage />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
