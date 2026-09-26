import { lazy, Suspense } from 'react'
import { domAnimation, LazyMotion } from 'motion/react'
import { Route, Routes } from 'react-router'
import Home from './pages/Home'

// Other routes and the footer load on demand, keeping the first page's bundle small
const AllProjects = lazy(() => import('./pages/AllProjects'))
const ProjectPage = lazy(() => import('./pages/ProjectPage'))
const Footer = lazy(() => import('./components/Footer'))

export default function App() {
  return (
    // Only the animation features the site uses (no layout/drag), via the lightweight `m` components
    <LazyMotion features={domAnimation} strict>
      <Suspense fallback={<div className="min-h-dvh" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<AllProjects />} />
          <Route path="/projects/:slug" element={<ProjectPage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
      <Suspense fallback={<div className="h-[720px]" />}>
        <Footer />
      </Suspense>
    </LazyMotion>
  )
}
