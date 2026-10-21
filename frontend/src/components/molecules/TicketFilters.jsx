import SearchBar from './SearchBar'

const priorities = ['All', 'Low', 'Medium', 'High', 'Urgent']
const statuses = ['All', 'Open', 'Assigned', 'In Progress', 'Resolved', 'Closed']

function TicketFilters({ search, onSearchChange, priority, onPriorityChange, status, onStatusChange }) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <SearchBar value={search} onChange={onSearchChange} />
            <select value={priority} onChange={(event) => onPriorityChange(event.target.value)} aria-label="Filter by priority" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                {priorities.map((item) => <option key={item} value={item}>{item === 'All' ? 'All Priorities' : item}</option>)}
            </select>
            <select value={status} onChange={(event) => onStatusChange(event.target.value)} aria-label="Filter by status" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                {statuses.map((item) => <option key={item} value={item}>{item === 'All' ? 'All Statuses' : item}</option>)}
            </select>
        </div>
    )
}

export default TicketFilters
