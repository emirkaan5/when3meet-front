// src/pages/CreateEvent.jsx
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/create-event.css'

export default function CreateEvent() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('') // ADDED
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selected, setSelected] = useState([])
  const navigate = useNavigate()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthLabel = useMemo(
    () => currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
    [currentDate]
  )

  // Build calendar cells with weekday headers + leading blanks
  const { cells } = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay() // 0=Sun..6=Sat
    const blanks = (firstDay + 6) % 7 // move Monday-first look (M..S)
    const cells = []

    // headers: M T W T F S S
    const headers = ['M','T','W','T','F','S','S'].map((d, i) => ({ type: 'hdr', key: `hdr-${i}`, text: d }))
    headers.forEach(h => cells.push(h))

    // leading blanks
    for (let i = 0; i < blanks; i++) cells.push({ type: 'blank', key: `b-${i}` })

    // month days
    for (let d = 1; d <= daysInMonth; d++) cells.push({ type: 'day', key: `d-${d}`, day: d })

    return { cells }
  }, [year, month])

  const toggle = (d) => {
    setSelected(s => (s.includes(d) ? s.filter(x => x !== d) : [...s, d]))
  }

  function prevMonth() {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

  async function create() { // CHANGED: added async
    if (!title || !start || !end || !selected.length) return alert('Missing fields.')

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
    if (!timeRegex.test(start) || !timeRegex.test(end)) {
      alert('Enter 24h times like 09:00 / 17:30')
      return
    }

    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.email) {
      alert('Please log in to create an event.')
      navigate('/login')
      return
    }

    const first = new Date(year, month, Math.min(...selected))
    const last  = new Date(year, month, Math.max(...selected))
    const formattedStart = first.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const formattedEnd   = last.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const dateRange = selected.length > 1 ? `${formattedStart} – ${formattedEnd}` : formattedStart

    // ADDED: Calculate window for backend
    const [startHour, startMin] = start.split(':').map(Number)
    const [endHour, endMin] = end.split(':').map(Number)
    const windowStart = new Date(year, month, Math.min(...selected), startHour, startMin)
    const windowEnd = new Date(year, month, Math.max(...selected), endHour, endMin)

    // Save to backend
    try {
      const userEmail = JSON.parse(localStorage.getItem('user') || '{}').email || 'anonymous'
      
      const response = await fetch('http://localhost:5000/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          startTime: start,
          endTime: end,
          selectedDays: selected,
          month,
          year,
          creatorEmail: userEmail
        })
      })

      if (!response.ok) throw new Error('Failed to create event')
      const savedEvent = await response.json()

      // Keep your original localStorage logic
      const event = {
        ...savedEvent, // ADDED: include backend response
        title,
        startTime: start,
        endTime: end,
        selectedDays: selected,
        month,
        year,
        startDate: formattedStart,
        endDate: formattedEnd,
        dateRange
      }

      localStorage.setItem('eventData', JSON.stringify(event))
      const all = JSON.parse(localStorage.getItem('savedEvents') || '[]')
      localStorage.setItem('savedEvents', JSON.stringify([event, ...all]))
      
      navigate('/availability')
    } catch (err) {
      alert('Failed to create event: ' + err.message)
    }
  }

  return (
    <div className="ce-page">
      <div className="card">
        <h1>New event</h1>

        <label>Event name</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Planning Meeting" />

        {/* ADDED: Description field */}
        <label>Description (optional)</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="What's this meeting about?"
          rows="3"
          style={{ 
            width: '100%', 
            padding: '8px', 
            marginBottom: '12px',
            fontFamily: 'inherit',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />

        <label>What times might work?</label>
        <div className="time-range">
          <input value={start} onChange={e => setStart(e.target.value)} placeholder="09:00" /> to
          <input value={end} onChange={e => setEnd(e.target.value)} placeholder="17:00" />
        </div>

        <label>What dates might work?</label>
        <p className="helper">Click to select multiple dates</p>

        <div className="calendar-header">
          <button onClick={prevMonth}>&#8249;</button>
          <h3>{monthLabel}</h3>
          <button onClick={nextMonth}>&#8250;</button>
        </div>

        <div className="calendar">
          {cells.map(cell => {
            if (cell.type === 'hdr') return <div key={cell.key} className="header">{cell.text}</div>
            if (cell.type === 'blank') return <div key={cell.key} />
            return (
              <div
                key={cell.key}
                className={selected.includes(cell.day) ? 'selected' : ''}
                onClick={() => toggle(cell.day)}
              >
                {cell.day}
              </div>
            )
          })}
        </div>

        <div className="actions">
          <button className="cancel-btn" onClick={() => navigate('/home')}>Cancel</button>
          <button className="create-btn" onClick={create}>Create</button>
        </div>
      </div>
    </div>
  )
}
