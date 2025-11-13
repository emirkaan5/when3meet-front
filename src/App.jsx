import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Availability from './pages/Availability.jsx'
import CreateEvent from './pages/CreateEvent.jsx'
import MeetingSummary from './pages/MeetingSummary.jsx' 

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/availability" element={<Availability />} />
      <Route path="/create" element={<CreateEvent />} />
      <Route path="/event/:eventId/summary" element={<MeetingSummary />} /> {/* After meeting sceduled have this page*/}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}
