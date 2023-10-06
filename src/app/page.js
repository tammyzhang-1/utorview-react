'use client'
import styles from './page.module.css'
import Controls from './components/Controls.js'
import Visualizations from './components/Visualizations.js'

export default function App() {
  return (
      <main>
          <Controls />
          <Visualizations />
      </main>
  )
}

