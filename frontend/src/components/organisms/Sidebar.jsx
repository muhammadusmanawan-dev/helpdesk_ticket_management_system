import {
    LayoutDashboard,
    Ticket,
    Headset,
    ShieldCheck,
    UserRound,
    ChevronRight,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

const navigationByRole = {
    admin: [
        { label: 'Dashboard', icon: LayoutDashboard },
        { label: 'Tickets', icon: Ticket },
    ],
    agent: [
        { label: 'Dashboard', icon: LayoutDashboard },
        { label: 'My Tickets', icon: Ticket },
    ],
    customer: [
        { label: 'Dashboard', icon: LayoutDashboard },
        { label: 'My Tickets', icon: Ticket },
    ],
}

function Sidebar({ currentUser, activePage, onNavigate }) {
    const role = currentUser?.role
    const navigationItems = navigationByRole[role] ?? []

    const roleLabel = role
        ? role.charAt(0).toUpperCase() + role.slice(1)
        : 'Support workspace'

    const userInitial = (currentUser?.email?.[0] || 'U').toUpperCase()

    return (
        <aside className="fixed inset-y-0 left-0 z-20 flex w-[250px] flex-col border-r border-slate-200/80 bg-white px-5 py-6 shadow-[4px_0_24px_rgba(30,41,59,0.025)] transition-all duration-200 max-[1000px]:w-[210px] max-[650px]:static max-[650px]:w-full max-[650px]:px-4 max-[650px]:py-4">
            {/* Brand */}
            <div className="mb-10 flex items-center gap-3 px-1 max-[650px]:mb-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200/60">
                    <Headset size={23} strokeWidth={2.2} />
                </div>

                <div className="min-w-0">
                    <p className="text-lg font-bold tracking-tight text-slate-900">
                        Helpdesk
                    </p>
                    <p className="text-xs text-slate-500">
                        Support workspace
                    </p>
                </div>
            </div>

            {/* Workspace heading */}
            <div className="mb-3 flex items-center justify-between px-2 max-[650px]:hidden">
                <p className="text-[11px] font-bold uppercase tracking-[1.4px] text-slate-400">
                    Workspace
                </p>

                <span className="rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700">
                    {roleLabel}
                </span>
            </div>

            {/* Navigation */}
            <nav
                aria-label="Main navigation"
                className="grid gap-2 max-[650px]:grid-cols-2"
            >
                {navigationItems.map((item) => {
                    const isActive = item.label === activePage
                    const Icon = item.icon

                    return (
                        <Button
                            key={item.label}
                            type="button"
                            variant="ghost"
                            onClick={() => onNavigate?.(item.label)}
                            className={`group relative !h-auto w-full justify-start gap-3 overflow-hidden rounded-xl px-3 py-3 text-left transition-all duration-200 ${isActive
                                ? 'bg-indigo-50 font-semibold text-indigo-700 hover:bg-indigo-50 hover:text-indigo-700'
                                : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-700'
                                }`}
                        >
                            {isActive && (
                                <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-indigo-600" />
                            )}

                            <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${isActive
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                                    }`}
                            >
                                <Icon size={19} strokeWidth={2} />
                            </span>

                            <span className="text-sm">{item.label}</span>

                            {isActive && (
                                <ChevronRight
                                    size={16}
                                    className="ml-auto text-indigo-500"
                                />
                            )}
                        </Button>
                    )
                })}
            </nav>

            {/* User profile */}
            <div className="mt-auto border-t border-slate-100 pt-5 max-[650px]:hidden">
                <div className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-sm font-bold text-indigo-700 ring-1 ring-indigo-100">
                        {userInitial}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-slate-800">
                            {currentUser?.email || 'Demo User'}
                        </p>

                        <div className="mt-1 flex items-center gap-1.5">
                            <ShieldCheck size={13} className="text-emerald-600" />
                            <p className="text-xs capitalize text-slate-500">
                                {role || 'Support workspace'}
                            </p>
                        </div>
                    </div>

                    <UserRound size={16} className="shrink-0 text-slate-400" />
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
