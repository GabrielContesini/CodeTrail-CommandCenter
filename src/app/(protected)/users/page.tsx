import { getCommandCenterSnapshot } from "@/lib/command-center-data";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const snapshot = await getCommandCenterSnapshot();

  return (
    <main className="pt-24 pb-12 pl-64 pr-8 lg:pr-12 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <section>
          <h2 className="text-3xl font-black text-white tracking-tight">Gerenciamento de Usuários</h2>
          <p className="text-neutral-400 mt-1">Manage team members, roles, and permissions.</p>
        </section>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total Users", value: snapshot.users.length },
            { label: "Active Now", value: Math.floor(snapshot.users.length * 0.75) },
            { label: "Subscription Revenue", value: "$42.1k" },
            { label: "System Health", value: "99.9%" },
          ].map((metric, i) => (
            <div key={i} className="bg-surface-container rounded-xl p-6 border border-neutral-800">
              <p className="text-neutral-400 text-sm font-medium">{metric.label}</p>
              <div className="flex items-end justify-between mt-2">
                <h3 className="text-3xl font-black text-on-background">
                  {typeof metric.value === "number" ? metric.value.toLocaleString() : metric.value}
                </h3>
                {i === 3 && <span className="material-symbols-outlined text-cyan-400">verified</span>}
                {i === 1 && (
                  <div className="flex gap-1">
                    <span className="w-1.5 h-6 bg-cyan-400 rounded-full animate-pulse"></span>
                    <span className="w-1.5 h-4 bg-cyan-400/50 rounded-full"></span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Directory Filter Bar */}
        <div className="bg-surface-container-low rounded-xl p-4 border border-neutral-800 mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Filter By:</span>
          </div>
          <select className="bg-neutral-800 border-none rounded-lg text-sm px-4 py-2 text-on-background focus:ring-1 focus:ring-cyan-400 cursor-pointer">
            <option>Account Status: All</option>
            <option>Active</option>
            <option>Suspended</option>
            <option>Pending</option>
          </select>
          <select className="bg-neutral-800 border-none rounded-lg text-sm px-4 py-2 text-on-background focus:ring-1 focus:ring-cyan-400 cursor-pointer">
            <option>System Role: All</option>
            <option>Administrator</option>
            <option>Editor</option>
            <option>Viewer</option>
          </select>
          <select className="bg-neutral-800 border-none rounded-lg text-sm px-4 py-2 text-on-background focus:ring-1 focus:ring-cyan-400 cursor-pointer">
            <option>Subscription: All</option>
            <option>Enterprise</option>
            <option>Professional</option>
            <option>Free Tier</option>
          </select>
          <div className="ml-auto flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 transition-colors">
              <span className="material-symbols-outlined">grid_view</span>
            </button>
            <button className="p-2 rounded-lg bg-neutral-800 text-cyan-400 transition-colors">
              <span className="material-symbols-outlined">list</span>
            </button>
          </div>
        </div>

        {/* User Directory Table */}
        <div className="bg-surface-container rounded-xl border border-neutral-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-800/50 border-b border-neutral-800">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">User Profile</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">System Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Subscription</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {snapshot.users.slice(0, 5).map((user, idx) => (
                <tr key={user.id} className="hover:bg-neutral-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-neutral-700 flex items-center justify-center text-xs font-bold text-white">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-on-background">{user.name}</p>
                        <p className="text-xs text-neutral-500">{user.email || `user${idx}@command.io`}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-800 text-neutral-300">
                      <span className="material-symbols-outlined text-xs">
                        {idx === 0 ? "shield" : idx === 1 ? "edit_note" : "visibility"}
                      </span>
                      {idx === 0 ? "Administrator" : idx === 1 ? "Editor" : "Viewer"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-cyan-400">
                      {idx === 0 ? "Enterprise Plus" : idx === 1 ? "Professional" : "Free Tier"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-neutral-500 hover:text-cyan-400 transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between py-4">
          <p className="text-sm text-neutral-400">Showing 1 to 5 of {snapshot.users.length} results</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-lg text-sm text-neutral-400 border border-neutral-800 hover:border-cyan-400 transition-colors">
              Previous
            </button>
            <button className="px-3 py-1 rounded-lg text-sm bg-cyan-400 text-neutral-900 font-bold">1</button>
            <button className="px-3 py-1 rounded-lg text-sm text-neutral-400 border border-neutral-800 hover:border-cyan-400 transition-colors">
              2
            </button>
            <button className="px-3 py-1 rounded-lg text-sm text-neutral-400 border border-neutral-800 hover:border-cyan-400 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
