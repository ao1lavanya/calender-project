import React from 'react'
import Calendar from './components/Calendar'
import { TaskProvider } from './state/TaskContext'
import './styles.css'

export default function App() {
  return (
    <TaskProvider>
      <Calendar />
    </TaskProvider>
  )
}