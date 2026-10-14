const navigationItems = [
    'Dashboard',
    'Tickets',
    'My Tasks',
    'Notifications',
]

function Sidebar() {
    return (
        <aside className="fixed inset-y-0 left-0 z-20 flex w-[245px] flex-col border-r border-slate-200 bg-white px-[18px] py-7 max-[1000px]:w-[200px] max-[650px]:static max-[650px]:w-full max-[650px]:px-4 max-[650px]:py-4">
            <div className="mx-2 mb-[42px] flex items-center gap-[10px] max-[650px]:mb-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[#365fe7] font-bold text-white">
                    H
                </span>

                <span className="text-[21px] font-bold text-slate-900">
                    Helpdesk
                </span>
            </div>

            <p className="mb-3 mx-[10px] text-[11px] font-bold tracking-[1.1px] text-slate-400 max-[650px]:hidden">
                WORKSPACE
            </p>

            <nav className="grid gap-1.5 max-[650px]:grid-cols-2">
                {navigationItems.map((item) => (
                    <div
                        key={item}
                        className={`cursor-pointer rounded-[9px] px-3 py-3 text-sm ${item === 'Dashboard'
                            ? 'bg-indigo-50 font-semibold text-indigo-700'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        {item}
                    </div>
                ))}
            </nav>

            <div className="mt-auto flex items-center gap-[10px] border-t border-slate-200 px-[5px] pt-[18px] max-[650px]:hidden">
                <div className="flex h-[35px] w-[35px] shrink-0 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-700">
                    U
                </div>

                <div className="min-w-0">
                    <strong className="block text-[13px] font-semibold text-slate-900">
                        Demo User
                    </strong>

                    <small className="mt-1 block text-[11px] text-slate-400">
                        Support workspace
                    </small>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
