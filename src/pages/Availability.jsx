// src/pages/Availability.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/availability.css'
import { loadGapiClient, loadGoogleIdentity } from '../lib/google'

const GOOGLE_CLIENT_ID = '1001839997214-8n0b2cs605n52ltdri13ccgqnct2furc.apps.googleusercontent.com'
const GOOGLE_API_KEY = 'AIzaSyCGnUe0eCtxp77DTEjbo8a-oM_Jn-EuCl8'
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly'
const API_BASE_URL = 'http://localhost:5000'

export default function Availability() {
  const navigate = useNavigate()
  const eventData = useMemo(() => JSON.parse(localStorage.getItem('eventData') || 'null'), [])
  const [responses, setResponses] = useState(() => JSON.parse(localStorage.getItem('responses') || '{}'))
  const [cellsActive, setCellsActive] = useState([]) // boolean[][] per day
  const [tokenClient, setTokenClient] = useState(null)
  const importBtnRef = useRef(null)

  const startH = useMemo(() => eventData ? parseInt(eventData.startTime.split(':')[0]) : 9, [eventData])
  const endH   = useMemo(() => eventData ? parseInt(eventData.endTime.split(':')[0])   : 17, [eventData])
  const totalCells = (endH - startH) * 4 // 15-min slots

  useEffect(() => {
    if (!eventData) return
    // Sort selected days in ascending order (chronological)
    const sortedDays = [...eventData.selectedDays].sort((a, b) => a - b)
    eventData.selectedDays = sortedDays
    // init empty grid per day
    setCellsActive(Array(eventData.selectedDays.length).fill(0).map(() => Array(totalCells).fill(false)))
  }, [eventData, totalCells])

  // Load Google API + Identity
  useEffect(() => {
    async function initGoogle() {
      await loadGapiClient()
      await new Promise((res) => window.gapi.load('client', res))
      await window.gapi.client.init({ apiKey: GOOGLE_API_KEY, discoveryDocs: [DISCOVERY_DOC] })

      await loadGoogleIdentity()
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: () => {}
      })
      setTokenClient(client)
    }
    initGoogle()
  }, [])

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    alert('Link copied to clipboard!')
  }

  function renderResponses() {
    const key = eventData?.title || 'defaultEvent'
    const eventResponses = responses[key] || []
    return (
      <>
        <h3 id="responseHeader">Responses ({eventResponses.length}/{eventResponses.length})</h3>
        <ul className="muted" style={{ paddingLeft: 18, margin: '8px 0 0' }}>
          {eventResponses.map((r, i) => <li key={i}>{r.name}</li>)}
        </ul>
      </>
    )
  }

  function setCell(dayIndex, slotIndex, value) {
    setCellsActive(prev => {
      const next = prev.map(row => row.slice())
      next[dayIndex][slotIndex] = value
      return next
    })
  }

  function toggleCell(dayIndex, slotIndex) {
    setCellsActive(prev => {
      const next = prev.map(row => row.slice())
      next[dayIndex][slotIndex] = !prev[dayIndex][slotIndex]
      return next
    })
  }

  async function addAvailability() {
    const name = prompt('Enter your name')
    if (!name) return
    
    // Create selectedByDay format
    const selectedByDay = {}
    eventData.selectedDays.forEach((dayDate, dayIndex) => {
      const activeSlotsForDay = cellsActive[dayIndex]?.reduce((acc, isActive, slotIndex) => {
        if (isActive) {
          const slotHour = startH + Math.floor(slotIndex / 4)
          const slotMinute = (slotIndex % 4) * 15
          const timeString = `${slotHour.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}`
          const endHour = slotHour + (slotMinute === 45 ? 1 : 0)
          const endMinute = (slotMinute + 15) % 60
          const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`
          
          acc.push({
            slot: slotIndex,
            time: timeString,
            endTime: endTime
          })
        }
        return acc
      }, []) || []
      
      if (activeSlotsForDay.length > 0) {
        const dayKey = `${eventData.year}-${eventData.month + 1}-${dayDate}`
        selectedByDay[dayKey] = {
          date: dayDate,
          month: eventData.month,
          year: eventData.year,
          dayName: new Date(eventData.year, eventData.month, dayDate).toLocaleDateString('en-US', { weekday: 'short' }),
          timeSlots: activeSlotsForDay
        }
      }
    })
    
    const eventKey = eventData?.title || 'defaultEvent'
    const userEmail = JSON.parse(localStorage.getItem('user') || '{}').email || 'anonymous'
    
    try {
      const response = await fetch(`${API_BASE_URL}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventKey, name, selectedByDay, userEmail })
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Availability saved to database!')
        
        // Also update local state
        const newResponses = { ...responses }
        newResponses[eventKey] = newResponses[eventKey] || []
        newResponses[eventKey].push({ name, selectedByDay })
        setResponses(newResponses)
        localStorage.setItem('responses', JSON.stringify(newResponses))
        
        // Clear after save
        setCellsActive(cellsActive.map(arr => arr.map(() => false)))
        alert('Availability saved successfully!')
      } else {
        alert('Failed to save availability: ' + result.message)
      }
    } catch (error) {
      console.error('Error saving availability:', error)
      alert('Error saving availability: ' + error.message)
    }
  }

  async function handleImport() {
    if (!tokenClient) return
    const btn = importBtnRef.current
    const original = btn.innerHTML
    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        alert('Failed to authenticate with Google. Please try again.')
        btn.innerHTML = original
        btn.disabled = false
        return
      }
      btn.innerHTML = '⏳ Loading calendar...'
      btn.disabled = true
      try {
        await importCalendarAvailability()
      } finally {
        btn.innerHTML = original
        btn.disabled = false
      }
    }
    if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' })
    } else {
      tokenClient.requestAccessToken({ prompt: '' })
    }
  }

  async function importCalendarAvailability() {
    if (!eventData) { alert('No event data found. Create an event first.'); return }
    const { selectedDays, month, year } = eventData

    const firstDay = Math.min(...selectedDays)
    const lastDay  = Math.max(...selectedDays)
    const timeMin = new Date(year, month, firstDay); timeMin.setHours(0,0,0,0)
    const timeMax = new Date(year, month, lastDay);  timeMax.setHours(23,59,59,999)

    const response = await window.gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      showDeleted: false,
      singleEvents: true,
      orderBy: 'startTime'
    })

    const events = response.result.items || []
    if (!events.length) { alert('No events found in your calendar for the selected dates.'); return }

    // Build busy slots per dayIndex
    const busyByDay = new Map()
    events.forEach(ev => {
      if (!ev.start?.dateTime || !ev.end?.dateTime) return
      const evStart = new Date(ev.start.dateTime)
      const evEnd   = new Date(ev.end.dateTime)

      eventData.selectedDays.forEach((dayNum, dayIndex) => {
        if (evStart.getDate() === dayNum &&
            evStart.getMonth() === eventData.month &&
            evStart.getFullYear() === eventData.year) {
          const evStartHour = evStart.getHours() + evStart.getMinutes()/60
          const evEndHour   = evEnd.getHours() + evEnd.getMinutes()/60
          if (evEndHour > startH && evStartHour < endH) {
            const startSlot = Math.max(0, Math.floor((evStartHour - startH) * 4))
            const endSlot   = Math.min((endH - startH) * 4, Math.ceil((evEndHour - startH) * 4))
            if (!busyByDay.has(dayIndex)) busyByDay.set(dayIndex, new Set())
            for (let i = startSlot; i < endSlot; i++) busyByDay.get(dayIndex).add(i)
          }
        }
      })
    })

    // Free slots = not busy
    setCellsActive(prev => prev.map((arr, dayIndex) => {
      const busy = busyByDay.get(dayIndex) || new Set()
      return arr.map((_, slot) => !busy.has(slot))
    }))

    alert(`Imported ${events.length} events from your Google Calendar.`)
  }

  if (!eventData) {
    return (
      <div className="availability-page">
        <div className="main"><p>No event loaded. <button onClick={() => navigate('/create')}>Create one</button></p></div>
      </div>
    )
  }

  // header dates
  const firstDate = new Date(eventData.year, eventData.month, Math.min(...eventData.selectedDays))
  const lastDate  = new Date(eventData.year, eventData.month, Math.max(...eventData.selectedDays))
  const eventDates =
    firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    (eventData.selectedDays.length > 1 ? ' – ' + lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '')

  return (
    <div className="availability-page">
      <div className="container">
        <div className="main">
          <div className="header">
            <div className="header-left">
              <button className="nav-link" onClick={() => navigate('/home')}>
                ← Back to Home
              </button>
              <h1>{eventData.title}</h1>
              <span>{eventDates}</span>
            </div>
            <div className="header-right">
              <button className="btn" onClick={copyLink}>Copy link</button>
              <button className="btn primary" onClick={addAvailability}>Add availability</button>
              <button className="btn primary" ref={importBtnRef} onClick={handleImport} title="Import availability">
                Import availability
              </button>
            </div>
          </div>

          <div className="schedule">
            {/* Time labels */}
            <div className="time-labels">
              {Array.from({ length: endH - startH + 1 }, (_, i) => {
                const h = startH + i
                const ampm = h >= 12 ? 'PM' : 'AM'
                const display = ((h + 11) % 12) + 1
                return <div className="time-label" key={h} style={{ top: `${i * 26 * 4}px` }}>{display} {ampm}</div>
              })}
            </div>

            {/* Day columns */}
            <div className="day-columns">
              {eventData.selectedDays.map((dayNum, dayIndex) => {
                const dateObj = new Date(eventData.year, eventData.month, dayNum)
                const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
                const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

                // drag-select logic (per column)
                let dragging = false
                let addMode = true

                const onDown = (slotIndex) => {
                  dragging = true
                  const willAdd = !cellsActive[dayIndex]?.[slotIndex]
                  addMode = willAdd
                  setCell(dayIndex, slotIndex, willAdd)
                }
                const onEnter = (slotIndex) => {
                  if (dragging) setCell(dayIndex, slotIndex, addMode)
                }
                const onUp = () => { dragging = false }

                return (
                  <div className="day-column" key={dayIndex}>
                    <div className="day-header">
                      <span>{monthDay}</span>
                      <h3>{weekday}</h3>
                    </div>
                    <div className="day-grid" onMouseUp={onUp}>
                      {Array.from({ length: totalCells }, (_, slotIndex) => (
                        <div
                          key={slotIndex}
                          className={`cell ${cellsActive[dayIndex]?.[slotIndex] ? 'active' : ''}`}
                          onMouseDown={() => onDown(slotIndex)}
                          onMouseEnter={() => onEnter(slotIndex)}
                          onClick={() => toggleCell(dayIndex, slotIndex)}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="timezone-bar">
            <span>Shown in</span>
            <select className="select">
              <option>(GMT-4:00) Eastern Time (US & Canada)</option>
            </select>
            <select className="select">
              <option>12h</option>
              <option>24h</option>
            </select>
          </div>
        </div>

        <div className="sidebar">
          <div className="responses-box">
            {renderResponses()}
          </div>
        </div>
      </div>
    </div>
  )
}
