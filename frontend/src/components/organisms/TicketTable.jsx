
import StatusBadge from '../atoms/StatusBadge'

function TicketTable({ tickets, onViewDetails }) {
    return (
        <div className="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>Ticket</th>
                        <th>Customer</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {tickets.map((ticket) => (
                        <tr key={ticket.id}>
                            <td>
                                <strong>{ticket.title}</strong>
                                <small>#{ticket.id}</small>
                            </td>

                            <td>{ticket.customer}</td>

                            <td>
                                <span
                                    className={`priority ${ticket.priority.toLowerCase()}`}
                                >
                                    {ticket.priority}
                                </span>
                            </td>

                            <td>
                                <StatusBadge status={ticket.status} />
                            </td>

                            <td>
                                <button
                                    type="button"
                                    onClick={() => onViewDetails(ticket)}
                                >
                                    View Details
                                </button>
                            </td>
                        </tr>
                    ))}

                    {tickets.length === 0 && (
                        <tr>
                            <td colSpan="5" className="empty-state">
                                No matching tickets found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default TicketTable
