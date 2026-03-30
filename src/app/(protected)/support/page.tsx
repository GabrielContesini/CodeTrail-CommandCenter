import { getCommandCenterSnapshot } from "@/lib/command-center-data";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const snapshot = await getCommandCenterSnapshot();

  // Mock data for chat
  const conversations = [
    {
      id: 1,
      name: "Sarah Connor",
      lastMessage: "Is the T-800 model decommissioned...",
      status: "online",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDiP1JBYmb9CqO49EfeY5_nLvJC6llydItwcA0N_gln8tST4eYrc5I7KceD3drk9CGl5yOrL_Wreglyzwn0vYOiwgreJNXnPCR99nCykzawSN2D03fI_XwEfN81drRyI-x6pGpIFc8WRP-oyAWCZWSB3Cw9tOZ-0rCdHd9P77qSO7ZQS7S_jDM-sztNUMCaqOYKq2rKJFsg7bWiIMaCywaD7pjtXQ2ljqtrfbkKEGxFdhFkjUCBMEie2CsaSgx6D4d1NwldsrqYd70",
      badge: "ACTIVE",
      unread: 0,
      isActive: true,
    },
    {
      id: 2,
      name: "Miles Dyson",
      lastMessage: "The neural net processor is ready for testing.",
      status: "offline",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBRN6G04WDMc8e481UAxy1XLX4G8aHoeG9lmryPXQsmBjWT4A3BGOd8BSSKDihMBTnCpLHllu2rZoN4bG1JS7N5w3CXiIdBwFhsm1plkLrPlzFSs9uaUkc0wV2v05vvpz0rgiiPthr8AcnnawQob-c_Z1Tyecl6SGDiCJZmaN_fJ97-pFU-ONEfqyTnbliD3r5GcdLjWnIWq4hXodurZk5UJnCOsw2YdKfhQoOVjem7RmWOy9GP9ySnuF-fK5IiH3w-EfZ5o6LkGxs",
      time: "10:45 AM",
      unread: 0,
      isActive: false,
    },
    {
      id: 3,
      name: "John Connor",
      lastMessage: "No fate but what we make for ourselves.",
      status: "offline",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAyQ0jW-pLE6MwAktijPnOxVmi88oQ16hYuTEf-H76q46LQQAkH_w2KC2NRAuQJHL1iBR657WpmLDv2uV5QgTSM5lnkKUzo0hbaQLAq7qDtOd5cpqrbZi4CKZdwTu2yGQnN90K2NjKHg1jPt7NjFz1bKX4QvMV8K6bJwRPbCDxHMB8RX8-zNmZM8eJOKjxa-l61uReldX6MqeOyCyouJ31ZDz6NVDELIn-wCELa0VsgI-kp2OdAM-WyY2Zhm79ZpnQ8qGfGJEm-z8Q",
      time: "Yesterday",
      unread: 3,
      isActive: false,
    },
    {
      id: 4,
      name: "Skynet Support",
      lastMessage: "Automated maintenance scheduled for 03:00.",
      status: "bot",
      avatar: null,
      time: "Monday",
      unread: 0,
      isActive: false,
    },
  ];

  const messages = [
    {
      id: 1,
      author: "Sarah Connor",
      content: "The perimeter at Cyberdyne has been breached. I need immediate override codes for the vault access. Are you receiving this?",
      timestamp: "02:14 PM",
      isOwn: false,
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuClhTCcFcC6kK_LekIbeTOU4tC1HOxyhSUw9U8zYYiPZ_KmBL1e4iRJf3_M68k1LNe7bhM0ycePzjQRv-xr86ajlScYIp_zAWLAA_xfavU1obBCdrVO4j8Ri56CIWA5joiTIpXa81WzvUx9jr9T6_q9l2u8drDHpPf4X5t8sJp1QAc0Mw0BbU7IJayN6Hi4Dzrq4DNLyTTEB27zYWCj4ODZoKFRV_-NK10qmmTBgLi7DMXk91vIMkOjozWgoq2TWorM6jC2fwZbda4",
    },
    {
      id: 2,
      author: "System",
      content: "Receiving loud and clear. Sending the Tier-1 cryptographic keys now. Ensure the encryption remains localized.",
      timestamp: "02:15 PM",
      isOwn: true,
      icon: "shield_with_heart",
    },
    {
      id: 3,
      author: "Sarah Connor",
      content: "Understood. Dyson is with me. We are proceeding to the lab. Monitor our signal frequency, it might drop near the cooling fans.",
      timestamp: "02:17 PM",
      isOwn: false,
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5xbIX1SPpSXmtf1EpoKM9BWd0hJ_5AkkUqnNGDN2mr97YMdO0QkXL2ummrv2fNy5eve6pesM2yHzYGc8JJ8y7NgEr8lo6Y8XsQnzWSVGqbTNhvHnoAmYHTp9HkP8jjI0dBkzhCeuagmc7KVI9qExDYwCFOzwnyFKPFoVuGLoz15KarkhE4fnebmG2k6ZKCsiaE3gH-dIoL9QKJ4pqf2NiVnwWadPmfn9u9UHGJBxmS0w8dcuoPjCAGHY8J_ky4tVaIS-diTGVJq0",
    },
    {
      id: 4,
      author: "System",
      content: null,
      file: {
        name: "cyberdyne_schematics.enc",
        size: "4.2 MB",
        type: "Encrypted Data",
      },
      timestamp: "02:18 PM",
      isOwn: true,
      icon: "shield_with_heart",
    },
  ];

  const activeUser = {
    name: "Sarah Connor",
    role: "Resistance Movement Lead",
    status: "online",
    clearance: "LEVEL 5",
    priority: "PRIORITY A",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfGAXJ_uSxPMoh1-rj0iraHolMB8sePCwdKxsPMVK0L29uSwOt6Qjqnk-LS6CZ8Cb_FirU5q5bxUbZNdwntKBRbv5VIhXbwGtPObG2mhmXvksMCC1tjuoo3kUlztZq0-im86AfHidwyI4u9QFdIvKDYrNIsCk-7Aj7XvL8Ar20zwib_5Ce6wC9patTDtK65IS8WZEOMp9X_iXnkeCn1c3oPf5iAi6npJNnO1mBrciKeXAVmiks4tsEgyEdrPtfWDU8nzqd5Rx3Cc0",
    location: "Cyberdyne Systems HQ, LA",
    uptime: "99.8% Stability",
    security: "Minimal (Internal)",
    securityLevel: "LEVEL 1",
    assets: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAoR_h-4pVmnxSZEwocd3IZ3vdNb3z1TToSslQ8IaPFGQdzKaP71GHMqiGsiMsZ1R0TIkFUm05FDD_0lPglTPnrd--g5JQ1YEWR57OBnm8_3cNQejBV9xYVOoCbhKoaXc_rvJT-DrKrxbkBuKxI7gzrWSKnU1yX_QjWuwhp15vpO4ht8uXDxPqY2pFy1dildBnVkm_BOR2euCvuM0hrt3YjbMssYaAZeHEGvKeA3JC6k0VcX8w_E7mEl1IrSU65__YUM19332nr-U",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDdIOepwdPLoZnCFMgcGbTuER2YETyYr-cVf1pohezdqsVAvBLusu60Hc73hiLyJqjq_uw_J9Pphie2Ok9caFc3MR53wPr6b4jjz_vZ_tel8lWM5RqkHMmjfpec9aFjXjlWfsf39Dn3nh6bt2-_GeEUSvvkb8GB_zEx1CONJORuqq-OPx1TwypXqAFpvnmFL8mG1YKFRJ67HIO5trUX-mfvn0V0gSQuJzaSmA05nUCaCGXAfZJZfbO3iFqhzBfd1cRoHWl0plnq3DA",
    ],
  };

  return (
    <main className="pt-16 pb-12 pl-64 pr-8 min-h-screen bg-background flex overflow-hidden">
      {/* Chat Contacts List - Left Sidebar */}
      <section className="w-80 border-r border-[var(--border-neutral)] flex flex-col bg-surface-container-low">
        {/* Messages Header */}
        <div className="p-4 border-b border-[var(--border-neutral)] flex justify-between items-center bg-surface-container-low">
          <h2 className="font-bold text-lg text-[var(--text-primary)]">Messages</h2>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-neutral-800 rounded-full text-[var(--text-secondary)] transition-colors">
              <span className="material-symbols-outlined">edit_square</span>
            </button>
            <button className="p-2 hover:bg-neutral-800 rounded-full text-[var(--text-secondary)] transition-colors">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="overflow-y-auto flex-1">
          {conversations.map((convo) => (
            <div
              key={convo.id}
              className={`p-4 flex gap-3 cursor-pointer transition-colors border-b border-[var(--border-neutral)] ${
                convo.isActive
                  ? "bg-primary-container/10 border-r-4 border-primary-container"
                  : "hover:bg-neutral-800/50"
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {convo.avatar ? (
                  <img
                    src={convo.avatar}
                    alt={convo.name}
                    className={`w-12 h-12 rounded-full object-cover ${!convo.isActive ? "grayscale opacity-70" : ""}`}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center">
                    <span className="material-symbols-outlined text-[var(--text-secondary)]">robot_2</span>
                  </div>
                )}
                {convo.status === "online" && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary-container border-2 border-background rounded-full"></div>
                )}
              </div>

              {/* Conversation Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2">
                  <h3 className={`font-semibold truncate ${convo.isActive ? "text-primary-container" : "text-[var(--text-primary)]"}`}>
                    {convo.name}
                  </h3>
                  {convo.badge && (
                    <span className="text-[10px] text-primary-container uppercase font-bold flex-shrink-0">{convo.badge}</span>
                  )}
                  {convo.time && (
                    <span className="text-[10px] text-[var(--text-secondary)] flex-shrink-0">{convo.time}</span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-secondary)] truncate">{convo.lastMessage}</p>
              </div>

              {/* Unread Badge */}
              {convo.unread > 0 && (
                <div className="flex items-center">
                  <span className="bg-primary-container text-background text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0">
                    {convo.unread}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Main Chat Area */}
      <section className="flex-1 flex flex-col relative bg-neutral-900">
        {/* Chat Header */}
        <header className="h-16 px-6 border-b border-[var(--border-neutral)] flex justify-between items-center bg-surface-container/30 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary-container border-2 border-background rounded-full"></div>
            </div>
            <div>
              <h3 className="font-bold text-[var(--text-primary)] leading-none">{activeUser.name}</h3>
              <p className="text-[10px] text-primary-container font-medium uppercase tracking-tighter mt-1">
                {activeUser.clearance} CLEARANCE • {activeUser.status.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-4">
            <button className="text-[var(--text-secondary)] hover:text-primary-container transition-colors">
              <span className="material-symbols-outlined">videocam</span>
            </button>
            <button className="text-[var(--text-secondary)] hover:text-primary-container transition-colors">
              <span className="material-symbols-outlined">call</span>
            </button>
            <div className="w-px h-6 bg-[var(--border-neutral)] mx-2"></div>
            <button className="text-[var(--text-secondary)] hover:text-primary-container transition-colors">
              <span className="material-symbols-outlined">search</span>
            </button>
            <button className="text-[var(--text-secondary)] hover:text-primary-container transition-colors">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </header>

        {/* Messages Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800/20 via-transparent to-transparent">
          {/* Date Separator */}
          <div className="flex justify-center">
            <span className="px-3 py-1 bg-surface-container rounded-full text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest border border-[var(--border-neutral)]">
              AUGUST 29, 1997
            </span>
          </div>

          {/* Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-3 ${msg.isOwn ? "flex-row-reverse ml-auto max-w-[80%]" : "max-w-[80%]"}`}
            >
              {/* Avatar/Icon */}
              {msg.isOwn ? (
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-background text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {msg.icon || "shield_with_heart"}
                  </span>
                </div>
              ) : (
                msg.avatar && (
                  <img
                    src={msg.avatar}
                    alt={msg.author}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-[var(--border-neutral)]"
                  />
                )
              )}

              {/* Message Content */}
              <div className={`flex flex-col gap-1 ${msg.isOwn ? "items-end" : ""}`}>
                {/* Text Message */}
                {msg.content && (
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.isOwn
                        ? "bg-primary-container text-background font-medium rounded-br-none shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                        : "bg-surface-container-high text-[var(--text-primary)] rounded-bl-none border border-[var(--border-neutral)] shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                )}

                {/* File Message */}
                {msg.file && (
                  <div className="bg-surface-container-highest border-l-4 border-primary-container p-3 rounded-xl flex items-center gap-4 min-w-[280px]">
                    <div className="w-10 h-10 bg-primary-container/20 rounded-lg flex items-center justify-center text-primary-container">
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-[var(--text-primary)]">{msg.file.name}</p>
                      <p className="text-[10px] text-[var(--text-secondary)]">{msg.file.size} • {msg.file.type}</p>
                    </div>
                    <button className="p-2 hover:bg-neutral-800 rounded-lg text-primary-container transition-colors">
                      <span className="material-symbols-outlined">download</span>
                    </button>
                  </div>
                )}

                {/* Timestamp and Status */}
                <div className={`flex items-center gap-1 ${msg.isOwn ? "flex-row-reverse mr-1" : "ml-1"}`}>
                  <span className="text-[10px] text-[var(--text-secondary)]">{msg.timestamp}</span>
                  {msg.isOwn && (
                    <span className="material-symbols-outlined text-primary-container text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                      done_all
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input Footer */}
        <footer className="p-4 bg-surface-container-low border-t border-[var(--border-neutral)]">
          <div className="flex items-center gap-3">
            <button className="p-2 text-[var(--text-secondary)] hover:text-primary-container transition-colors">
              <span className="material-symbols-outlined">add</span>
            </button>
            <div className="flex-1 relative">
              <input
                className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-container text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
                placeholder="Type a message..."
                type="text"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-primary-container transition-colors">
                <span className="material-symbols-outlined">sentiment_satisfied</span>
              </button>
            </div>
            <button className="w-11 h-11 bg-primary-container text-background rounded-xl flex items-center justify-center hover:bg-cyan-300 active:scale-90 transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)]">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                send
              </span>
            </button>
          </div>
        </footer>
      </section>

      {/* Right System Context Sidebar */}
      <aside className="w-80 border-l border-[var(--border-neutral)] bg-surface-container-low hidden lg:flex flex-col">
        {/* User Profile Summary */}
        <div className="p-8 flex flex-col items-center text-center border-b border-[var(--border-neutral)]">
          <div className="relative mb-4">
            <img
              src={activeUser.avatar}
              alt={activeUser.name}
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-primary-container/10"
            />
            <div className="absolute -bottom-2 -right-2 bg-primary-container text-background text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              {activeUser.priority}
            </div>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{activeUser.name}</h2>
          <p className="text-xs text-[var(--text-secondary)] font-medium">{activeUser.role}</p>

          {/* Profile Buttons */}
          <div className="grid grid-cols-2 gap-2 w-full mt-6">
            <button className="flex flex-col items-center gap-1 p-3 rounded-xl bg-surface-container-low hover:bg-neutral-800 transition-colors border border-[var(--border-neutral)]">
              <span className="material-symbols-outlined text-primary-container">person_search</span>
              <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">Profile</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 rounded-xl bg-surface-container-low hover:bg-neutral-800 transition-colors border border-[var(--border-neutral)]">
              <span className="material-symbols-outlined text-primary-container">lock_open</span>
              <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">Permissions</span>
            </button>
          </div>
        </div>

        {/* System Context & Metadata */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Live Session Data */}
          <div>
            <h3 className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mb-4">
              Live Session Data
            </h3>
            <div className="space-y-3">
              {/* Geo Location */}
              <div className="bg-surface-container-low p-3 rounded-lg border border-[var(--border-neutral)]">
                <p className="text-[10px] text-[var(--text-secondary)] mb-1">GEO-LOCATION</p>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-primary-container">location_on</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{activeUser.location}</span>
                </div>
              </div>

              {/* Network Uptime */}
              <div className="bg-surface-container-low p-3 rounded-lg border border-[var(--border-neutral)]">
                <p className="text-[10px] text-[var(--text-secondary)] mb-1">NETWORK UPTIME</p>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-primary-container">bolt</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{activeUser.uptime}</span>
                </div>
              </div>

              {/* Security Risk */}
              <div className="bg-surface-container-low p-3 rounded-lg border border-[var(--border-neutral)]">
                <p className="text-[10px] text-[var(--text-secondary)] mb-1">SECURITY RISK</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--text-primary)]">{activeUser.security}</span>
                  <span className="px-2 py-0.5 bg-primary-container/10 text-primary-container text-[10px] font-bold rounded">
                    {activeUser.securityLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shared Assets */}
          <div>
            <h3 className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mb-4">
              Shared Assets
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {activeUser.assets.map((asset, idx) => (
                <div key={idx} className="aspect-square rounded-lg bg-surface-container overflow-hidden group cursor-pointer relative">
                  <img
                    src={asset}
                    alt="Asset"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                </div>
              ))}
              <div className="aspect-square rounded-lg bg-neutral-800 flex items-center justify-center cursor-pointer hover:bg-neutral-700 transition-colors">
                <span className="text-xs font-bold text-[var(--text-secondary)]">+12</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terminate Session Button */}
        <div className="p-6 pt-4">
          <button className="w-full py-3 rounded-xl border-2 border-red-500 text-red-500 font-bold text-sm hover:bg-red-500/10 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">gpp_maybe</span>
            TERMINATE SESSION
          </button>
        </div>
      </aside>
    </main>
  );
}
