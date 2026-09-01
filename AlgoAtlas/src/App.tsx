import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ThemeProvider } from './lib/theme'
import { AlgorithmPage } from './pages/AlgorithmPage'
import { AlgorithmsPage } from './pages/AlgorithmsPage'
import { ComparePage } from './pages/ComparePage'
import { ComplexityExplorerPage } from './pages/ComplexityExplorerPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="algorithms" element={<AlgorithmsPage />} />
            <Route path="algorithms/:slug" element={<AlgorithmPage />} />
            <Route path="complexity" element={<ComplexityExplorerPage />} />
            <Route path="compare" element={<ComparePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App