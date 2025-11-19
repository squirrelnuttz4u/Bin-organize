import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import ContainerList from './pages/ContainerList'
import ContainerDetail from './pages/ContainerDetail'
import Search from './pages/Search'
import Settings from './pages/Settings'
import ScanPage from './pages/ScanPage'

function App() {
  return (
    <div className="app">
      <Header />
      <main style={{ flex: 1, paddingBottom: '24px' }}>
        <Routes>
          <Route path="/" element={<ContainerList />} />
          <Route path="/container/:id" element={<ContainerDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
