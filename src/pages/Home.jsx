import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/home.css'

export default function Home() {
  const [events, setEvents] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('savedEvents') || '[]')
    // Sort meetings by date (near future to far future)
    const sortedEvents = stored.sort((a, b) => {
      const dateA = new Date(a.year, a.month, Math.min(...a.selectedDays))
      const dateB = new Date(b.year, b.month, Math.min(...b.selectedDays))
      return dateA - dateB
    })
    setEvents(sortedEvents)
  }, [])

  const view = (e) => {
    localStorage.setItem('eventData', JSON.stringify(e))
    navigate('/availability')
  }

  return (
    <div className="home">
      {/* Flowers background */}
      <div className="bottom-decor">
        <div className="flower-gradient"></div>
        <img src="/image.png" alt="Lavender Field" className="bottom-flowers" />
      </div>
      
      <div className="content">
        <header className="header">
          <img src="/logo.png" alt="When3Meet Logo" className="logo" />
          <h1>When3Meet</h1>
        </header>

        <button className="create-btn" onClick={() => navigate('/create')}>
          + Create New Meeting
        </button>

        <section className="meetings-container">
          {events.map((e, i) => (
            <div className="meeting-card" key={i}>
              <h3 className="meeting-title">{e.title || 'Untitled'}</h3>
              <p className="meeting-dates">{e.dateRange || 'No dates'}</p>
              <button className="view-btn" onClick={() => view(e)}>View</button>
            </div>
          ))}
        </section>

        {events.length === 0 && <p className="empty-state">No meetings yet.</p>}
      </div>
    </div>
  )
}
