
import { useState } from 'react'
import Sidebar from './components/organisms/Sidebar'
import StatusBadge from './components/atoms/StatusBadge'
import './App.css'

const sampleTickets = [
  {
    id: 104,
    title: 'Internet is not working',
    customer: 'Ali Khan',
    priority: 'High',
    status: 'Open',
  },
  {
    id: 103,
    title: 'Unable to reset password',
    customer: 'Sara Ahmed',
    priority: 'Medium',
    status: 'In Progress',
  },
  {
    id: 102,
    title: 'Request for account access',
    customer: 'Usman Malik',
    priority: 'Low',
    status: 'Resolved',
  },
  {
    id: 101,
    title: 'Application is running slowly',
    customer: 'Ayesha Noor',
    priority: 'High',
    status: 'Open',
  },
]

function App() {
  const [search, setSearch] = useState('')

  const filteredTickets = sampleTickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">

        <header className="topbar">
          <div>
            <p className="eyebrow">SUPPORT WORKSPACE</p>
            <h1>Dashboard</h1>
          </div>

          <div className="topbar-user">
            <div className="avatar">U</div>
            <div>User</div>
          </div>
        </header>


        <section className="welcome-section">
          <div>
            <p className="eyebrow">TICKET WORKSPACE</p>
            <h2>Welcome back!</h2>
            <p>Here is an overview of your support tickets.</p>
          </div>
          <button
            className="primary-button"
            type="button"
            onClick={() => alert('We will build ticket creation next.')}
          >
            + Create ticket
          </button>
        </section>


        <section className="stats-grid">
          <div className="stat-card">
            <span>Total tickets</span>
            <strong>{sampleTickets.length}</strong>
            <small>All sample tickets</small>
          </div>

          <div className="stat-card">
            <span>Open</span>
            <strong>
              {sampleTickets.filter((ticket) => ticket.status === 'Open').length}
            </strong>
            <small>Waiting for action</small>
          </div>

          <div className="stat-card">
            <span>In progress</span>
            <strong>
              {sampleTickets.filter((ticket) => ticket.status === 'In Progress').length}
            </strong>
            <small>Currently being handled</small>
          </div>

          <div className="stat-card">
            <span>Resolved</span>
            <strong>
              {sampleTickets.filter((ticket) => ticket.status === 'Resolved').length}
            </strong>
            <small>Completed tickets</small>
          </div>
        </section>


        <section className="tickets-section">
          <div className="section-heading">
            <div>
              <h2>Recent tickets</h2>
              <p>Review and search support requests.</p>
            </div>
            <input
              className="search-input"
              type="search"
              placeholder="Search tickets..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Customer</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <strong>{ticket.title}</strong>
                      <small>#{ticket.id}</small>
                    </td>
                    <td>{ticket.customer}</td>
                    <td>
                      <span className={`priority ${ticket.priority.toLowerCase()}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={ticket.status} />
                    </td>
                  </tr>
                ))}

                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan="4" className="empty-state">
                      No matching tickets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
