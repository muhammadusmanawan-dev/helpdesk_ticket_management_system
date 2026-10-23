import {
    LayoutDashboard,
    Ticket,
    Headset,
    ShieldCheck,
    UserRound,
    ChevronRight,
} from 'lucide-react'
import { NavLink } from 'react-router'

const navigationByRole = {
    admin: [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Tickets', path: '/admin/tickets', icon: Ticket },
    ],
    agent: [
        { label: 'Dashboard', path: '/agent/dashboard', icon: LayoutDashboard },
        { label: 'My Tickets', path: '/agent/tickets', icon: Ticket },
    ],
    customer: [
        { label: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
        { label: 'My Tickets', path: '/customer/tickets', icon: Ticket },
    ],
}

function Sidebar({ currentUser }) {
    const role = currentUser?.role
    const navigationItems = navigationByRole[role] ?? []
    const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Support workspace'
    const userInitial = (currentUser?.email?.[0] || 'U').toUpperCase()

    return (
        <aside className="fixed inset-y-0 left-0 z-20 flex w-[250px] flex-col border-r border-slate-800 bg-slate-950 px-5 py-6 shadow-[4px_0_24px_rgba(15,23,42,0.12)] transition-all duration-200 max-[1000px]:w-[210px] max-[650px]:static max-[650px]:w-full max-[650px]:px-4 max-[650px]:py-4">
            <div className="mb-10 flex items-center gap-3 px-1 max-[650px]:mb-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-950/40">
                    <Headset size={23} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                    <p className="text-lg font-bold tracking-tight text-white">Helpdesk</p>
                    <p className="text-xs text-slate-400">Support workspace</p>
                </div>
            </div>
            <div className="mb-3 flex items-center justify-between px-2 max-[650px]:hidden">
                <p className="text-[11px] font-bold uppercase tracking-[1.4px] text-slate-500">Workspace</p>
                <span className="rounded-md bg-slate-800 px-2 py-1 text-[10px] font-semibold text-indigo-300">{roleLabel}</span>
            </div>
            <nav aria-label="Main navigation" className="grid gap-2 max-[650px]:grid-cols-2">
                {navigationItems.map((item) => {
                    const Icon = item.icon
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end
                            className={({ isActive }) =>
                                `group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-left transition-all duration-200 ${isActive
                                    ? 'bg-indigo-500/15 font-semibold text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200'
                                    : 'font-medium text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-indigo-400" />}
                                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${isActive
                                        ? 'bg-indigo-500/20 text-indigo-300'
                                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'
                                        }`}>
                                        <Icon size={19} strokeWidth={2} />
                                    </span>
                                    <span className="text-sm">{item.label}</span>
                                    {isActive && <ChevronRight size={16} className="ml-auto text-indigo-300" />}
                                </>
                            )}
                        </NavLink>
                    )
                })}
            </nav>
            <div className="mt-auto border-t border-slate-800 pt-5 max-[650px]:hidden">
                <div className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-900">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-sm font-bold text-indigo-300 ring-1 ring-indigo-400/20">
                        {userInitial}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-slate-100">{currentUser?.email || 'Demo User'}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                            <ShieldCheck size={13} className="text-emerald-400" />
                            <p className="text-xs capitalize text-slate-400">{role || 'Support workspace'}</p>
                        </div>
                    </div>
                    <UserRound size={16} className="shrink-0 text-slate-500" />
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
