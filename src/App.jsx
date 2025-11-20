/**
What it does: Acts as the main wrapper for your entire application
Contains:
  Route definitions (which page shows for which URL)
  Global layout components
  Navigation structure

Meaning you add new page and its route here
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Availability from './pages/Availability.jsx'
import CreateEvent from './pages/CreateEvent.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/availability" element={<Availability />} />
      <Route path="/create" element={<CreateEvent />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}
