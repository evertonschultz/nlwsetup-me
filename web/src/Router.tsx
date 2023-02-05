import { Route, Routes } from 'react-router-dom'

import PublicProfileSummary from './pages/PublicProfileSummary'
import { Home } from './pages/Home'

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/user/:id" element={<PublicProfileSummary />} />
    </Routes>
  )
}
