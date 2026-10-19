
const adminNavigationItems = [
    { label: 'Dashboard', icon: '▦' },
    { label: 'Tickets', icon: '▤' },
]

const agentNavigationItems = [
    { label: 'Dashboard', icon: '▦' },
    { label: 'My Tickets', icon: '▤' },
]

const customerNavigationItems = [
    { label: 'Dashboard', icon: '▦' },
    { label: 'My Tickets', icon: '▤' },
]

function Sidebar({ currentUser, activePage, onNavigate }) {
    const role = currentUser?.role

    const navigationItems =
        role === 'admin'
            ? adminNavigationItems
            : role === 'agent'
                ? agentNavigationItems
                : customerNavigationItems

    const roleLabel = role
        ? role.charAt(0).toUpperCase() + role.slice(1)
        : 'Support workspace'

    return (
        <aside className="fixed inset-y-0 left-0 z-20 flex w-[250px] flex-col border-r border-slate-200/80 bg-white px-5 py-7 shadow-[4px_0_24px_rgba(30,41,59,0.025)] transition-all duration-200 max-[1000px]:w-[210px] max-[650px]:static max-[650px]:w-full max-[650px]:px-4 max-[650px]:py-4">

            {/* Brand */}
            <div className="mb-10 flex items-center gap-3 px-1 max-[650px]:mb-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-extrabold text-white shadow-lg shadow-indigo-200/70">
                    H
                </div>

                <div>
                    <p className="text-lg font-extrabold tracking-tight text-slate-900">
                        Helpdesk
                    </p>
                    <p className="text-xs font-medium text-slate-400">
                        Support workspace
                    </p>
                </div>
            </div>

            {/* Section heading */}
            <div className="mb-3 flex items-center justify-between px-2 max-[650px]:hidden">
                <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-slate-400">
                    Workspace
                </p>

                <span className="rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-600">
                    {roleLabel}
                </span>
            </div>

            {/* Navigation */}
            <nav className="grid gap-2 max-[650px]:grid-cols-2">
                {navigationItems.map((item) => {
                    const isActive = item.label === activePage

                    return (
                        <button
                            key={item.label}
                            type="button"
                            onClick={() => onNavigate?.(item.label)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-left text-sm transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${isActive
                                ? 'bg-indigo-50 font-semibold text-indigo-700 shadow-sm shadow-indigo-100/70'
                                : 'font-medium text-slate-600 hover:translate-x-0.5 hover:bg-slate-50 hover:text-indigo-700'
                                }`}
                        >
                            {isActive && (
                                <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-indigo-600" />
                            )}

                            <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg transition-colors duration-200 ${isActive
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                                    }`}
                                aria-hidden="true"
                            >
                                {item.icon}
                            </span>

                            <span>{item.label}</span>

                            {isActive && (
                                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-600" />
                            )}
                        </button>
                    )
                })}
            </nav>

            {/* Bottom profile */}
            <div className="mt-auto border-t border-slate-100 pt-5 max-[650px]:hidden">
                <div className="flex items-center gap-3 rounded-xl p-2 transition-colors duration-200 hover:bg-slate-50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 font-bold text-indigo-700 ring-1 ring-indigo-100">
                        {(currentUser?.email?.[0] || 'U').toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-slate-800">
                            {currentUser?.email || 'Demo User'}
                        </p>

                        <p className="mt-1 text-xs capitalize text-slate-400">
                            {role || 'Support workspace'}
                        </p>
                    </div>

                    <span
                        className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-50"
                        title="Signed in"
                    />
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
