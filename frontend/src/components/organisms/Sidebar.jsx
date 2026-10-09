
const navigationItems = [
    'Dashboard',
    'Tickets',
    'My Tasks',
    'Notifications',
]

function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="brand">
                <span className="brand-icon">H</span>
                <span>Helpdesk</span>
            </div>

            <p className="nav-heading">WORKSPACE</p>

            <nav className="navigation">
                {navigationItems.map((item) => (
                    <div
                        className={`nav-item ${item === 'Dashboard' ? 'active' : ''}`}
                        key={item}
                    >
                        {item}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="avatar">U</div>
                <div>
                    <strong>Demo User</strong>
                    <small>Support workspace</small>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
