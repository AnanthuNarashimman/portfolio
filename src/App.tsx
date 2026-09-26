import { lazy, Suspense } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { domAnimation, LazyMotion } from 'motion/react'
import { Route, Routes } from 'react-router'
import Intro from './components/Intro'
import Home from './pages/Home'
import { useAfterIntro } from './lib/intro'

// Other routes and the footer load on demand, keeping the first page's bundle small
const AllProjects = lazy(() => import('./pages/AllProjects'))
const ProjectPage = lazy(() => import('./pages/ProjectPage'))
const Footer = lazy(() => import('./components/Footer'))

export default function App() {
  const later = useAfterIntro()
  return (
    // Only the animation features the site uses (no layout/drag), via the lightweight `m` components
    <LazyMotion features={domAnimation} strict>
      <Intro />
      {/* Vercel Web Analytics: page views, including client-side route changes */}
      <Analytics />
      <Suspense fallback={<div className="min-h-dvh" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<AllProjects />} />
          <Route path="/projects/:slug" element={<ProjectPage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
      {later ? (
        <Suspense fallback={<div className="h-[720px]" />}>
          <Footer />
        </Suspense>
      ) : (
        <div className="h-[720px]" />
      )}
    </LazyMotion>
  )
}
