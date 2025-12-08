

import { useEffect } from 'react'
import { Layout } from './components/Layout'
import { Dashboard } from './components/Dashboard'
import { Editor } from './components/Editor'
import { useStore } from './store/useStore'

function App() {
  const { view, activeDocId, init } = useStore()

  useEffect(() => {
    init()
  }, [])

  return (
    <Layout>
      {view === 'dashboard' && <Dashboard />}
      {view === 'editor' && activeDocId && <Editor docId={activeDocId} />}
    </Layout>
  )
}

export default App
