import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HabitProvider } from './contexts/HabitContext'
import { UserProvider } from './contexts/UserContext'
import { ToastProvider } from './components/ToastContainer'
import ErrorBoundary from './components/ErrorBoundary'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Habits from './pages/Habits'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Setup from './pages/Setup'
import Components from './pages/Components'
import Database from './pages/Database'

function App() {
  const [isSetup, setIsSetup] = useState(false)

  useEffect(() => {
    // Check if user has completed setup
    const setupStatus = localStorage.getItem('habit-tks-setup')
    setIsSetup(!!setupStatus)
  }, [])

  if (!isSetup) {
    return (
      <ErrorBoundary>
        <ToastProvider>
          <UserProvider>
            <Setup onSetupComplete={() => setIsSetup(true)} />
          </UserProvider>
        </ToastProvider>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <UserProvider>
            <HabitProvider>
              <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="container mx-auto px-4 py-8">
                  <Routes>
                                    <Route path="/" element={<Dashboard />} />
                <Route path="/habits" element={<Habits />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/components" element={<Components />} />
                <Route path="/database" element={<Database />} />
                  </Routes>
                </main>
              </div>
            </HabitProvider>
          </UserProvider>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
