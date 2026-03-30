'use client';

import { MaterialIcon } from '@/components/icons/material-icon';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// Mock data for chat
const mockConversations = [
  {
    id: 1,
    name: 'Sarah Connor',
    lastMessage: 'Is the T-800 model decommissioned yet?',
    status: 'online',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiP1JBYmb9CqO49EfeY5_nLvJC6llydItwcA0N_gln8tST4eYrc5I7KceD3drk9CGl5yOrL_Wreglyzwn0vYOiwgreJNXnPCR99nCykzawSN2D03fI_XwEfN81drRyI-x6pGpIFc8WRP-oyAWCZWSB3Cw9tOZ-0rCdHd9P77qSO7ZQS7S_jDM-sztNUMCaqOYKq2rKJFsg7bWiIMaCywaD7pjtXQ2ljqtrfbkKEGxFdhFkjUCBMEie2CsaSgx6D4d1NwldsrqYd70',
    badge: 'Active',
    unread: 0,
    isActive: true,
  },
  {
    id: 2,
    name: 'Miles Dyson',
    lastMessage: 'The neural net processor is ready for testing.',
    status: 'offline',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRN6G04WDMc8e481UAxy1XLX4G8aHoeG9lmryPXQsmBjWT4A3BGOd8BSSKDihMBTnCpLHllu2rZoN4bG1JS7N5w3CXiIdBwFhsm1plkLrPlzFSs9uaUkc0wV2v05vvpz0rgiiPthr8AcnnawQob-c_Z1Tyecl6SGDiCJZmaN_fJ97-pFU-ONEfqyTnbliD3r5GcdLjWnIWq4hXodurZk5UJnCOsw2YdKfhQoOVjem7RmWOy9GP9ySnuF-fK5IiH3w-EfZ5o6LkGxs',
    time: '10:45 AM',
    unread: 0,
    isActive: false,
  },
  {
    id: 3,
    name: 'John Connor',
    lastMessage: 'No fate but what we make for ourselves.',
    status: 'offline',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyQ0jW-pLE6MwAktijPnOxVmi88oQ16hYuTEf-H76q46LQQAkH_w2KC2NRAuQJHL1iBR657WpmLDv2uV5QgTSM5lnkKUzo0hbaQLAq7qDtOd5cpqrbZi4CKZdwTu2yGQnN90K2NjKHg1jPt7NjFz1bKX4QvMV8K6bJwRPbCDxHMB8RX8-zNmZM8eJOKjxa-l61uReldX6MqeOyCyouJ31ZDz6NVDELIn-wCELa0VsgI-kp2OdAM-WyY2Zhm79ZpnQ8qGfGJEm-z8Q',
    time: 'Yesterday',
    unread: 3,
    isActive: false,
  },
  {
    id: 4,
    name: 'Skynet Support',
    lastMessage: 'Automated maintenance scheduled for 03:00.',
    status: 'bot',
    avatar: null,
    time: 'Monday',
    unread: 0,
    isActive: false,
  },
];

const mockMessages = [
  {
    id: 1,
    author: 'Sarah Connor',
    content: 'The perimeter at Cyberdyne has been breached. I need immediate override codes for the vault access. Are you receiving this?',
    timestamp: '02:14 PM',
    isOwn: false,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClhTCcFcC6kK_LekIbeTOU4tC1HOxyhSUw9U8zYYiPZ_KmBL1e4iRJf3_M68k1LNe7bhM0ycePzjQRv-xr86ajlScYIp_zAWLAA_xfavU1obBCdrVO4j8Ri56CIWA5joiTIpXa81WzvUx9jr9T6_q9l2u8drDHpPf4X5t8sJp1QAc0Mw0BbU7IJayN6Hi4Dzrq4DNLyTTEB27zYWCj4ODZoKFRV_-NK10qmmTBgLi7DMXk91vIMkOjozWgoq2TWorM6jC2fwZbda4',
  },
  {
    id: 2,
    author: 'System',
    content: 'Receiving loud and clear. Sending the Tier-1 cryptographic keys now. Ensure the encryption remains localized.',
    timestamp: '02:15 PM',
    isOwn: true,
    icon: 'shield_with_heart',
  },
  {
    id: 3,
    author: 'Sarah Connor',
    content: 'Understood. Dyson is with me. We are proceeding to the lab. Monitor our signal frequency, it might drop near the cooling fans.',
    timestamp: '02:17 PM',
    isOwn: false,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5xbIX1SPpSXmtf1EpoKM9BWd0hJ_5AkkUqnNGDN2mr97YMdO0QkXL2ummrv2fNy5eve6pesM2yHzYGc8JJ8y7NgEr8lo6Y8XsQnzWSVGqbTNhvHnoAmYHTp9HkP8jjI0dBkzhCeuagmc7KVI9qExDYwCFOzwnyFKPFoVuGLoz15KarkhE4fnebmG2k6ZKCsiaE3gH-dIoL9QKJ4pqf2NiVnwWadPmfn9u9UHGJBxmS0w8dcuoPjCAGHY8J_ky4tVaIS-diTGVJq0',
  },
  {
    id: 4,
    author: 'System',
    content: null,
    file: {
      name: 'cyberdyne_schematics.enc',
      size: '4.2 MB',
      type: 'Encrypted Data',
    },
    timestamp: '02:18 PM',
    isOwn: true,
  },
];

const userDetails = {
  name: 'Sarah Connor',
  role: 'Resistance Movement Lead',
  priority: 'Priority A',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfGAXJ_uSxPMoh1-rj0iraHolMB8sePCwdKxsPMVK0L29uSwOt6Qjqnk-LS6CZ8Cb_FirU5q5bxUbZNdwntKBRbv5VIhXbwGtPObG2mhmXvksMCC1tjuoo3kUlztZq0-im86AfHidwyI4u9QFdIvKDYrNIsCk-7Aj7XvL8Ar20zwib_5Ce6wC9patTDtK65IS8WZEOMp9X_iXnkeCn1c3oPf5iAi6npJNnO1mBrciKeXAVmiks4tsEgyEdrPtfWDU8nzqd5Rx3Cc0',
  location: 'Cyberdyne Systems HQ, LA',
  uptime: '99.8% Stability',
  security: 'Minimal (Internal)',
  securityLevel: 'LEVEL 1',
};

export default function SupportPage() {
  return (
    <main className="ml-20 md:ml-64 pt-16 h-screen flex overflow-hidden">
      {/* Left Column: Chat Contacts List (w-80) */}
      <section className="w-80 border-r border-neutral-800 flex flex-col bg-surface-container-lowest">
        {/* Contacts Header */}
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-surface-container-low">
          <h2 className="font-bold text-lg text-on-surface">Messages</h2>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-neutral-800 rounded-full text-neutral-400 transition-colors">
              <MaterialIcon name="edit_square" />
            </button>
            <button className="p-2 hover:bg-neutral-800 rounded-full text-neutral-400 transition-colors">
              <MaterialIcon name="filter_list" />
            </button>
          </div>
        </div>

        {/* Contacts List */}
        <div className="overflow-y-auto flex-1">
          {mockConversations.map((contact, index) => (
            <div
              key={contact.id}
              className={cn(
                'p-4 flex gap-3 cursor-pointer transition-colors border-b border-neutral-900',
                contact.isActive
                  ? 'bg-cyan-500/10 border-r-4 border-cyan-400'
                  : 'hover:bg-neutral-800/50'
              )}
            >
              <div className="relative flex-shrink-0">
                {contact.avatar ? (
                  <img
                    className={cn(
                      "w-12 h-12 rounded-full object-cover",
                      !contact.isActive && contact.status === "offline" ? "grayscale opacity-70" : ""
                    )}
                    src={contact.avatar}
                    alt={contact.name}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center">
                    <MaterialIcon name="robot_2" className="text-neutral-500" />
                  </div>
                )}
                {contact.status === 'online' && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-cyan-400 border-2 border-neutral-900 rounded-full"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className={cn(
                    'font-semibold truncate',
                    contact.isActive ? 'text-cyan-400' : 'text-on-surface'
                  )}>
                    {contact.name}
                  </h3>
                  <span className={cn(
                    'text-[10px] font-bold ml-2 flex-shrink-0',
                    contact.isActive ? 'text-cyan-500 uppercase' : 'text-neutral-500'
                  )}>
                    {contact.isActive ? contact.badge : contact.time}
                  </span>
                </div>
                <p className={cn(
                  "text-xs truncate",
                  contact.isActive ? "text-on-surface-variant" : "text-neutral-500"
                )}>{contact.lastMessage}</p>
              </div>
              {contact.unread > 0 && (
                <div className="flex items-center">
                  <span className="bg-cyan-500 text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0">
                    {contact.unread}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Center Column: Chat Area (flex-1) */}
      <section className="flex-1 flex flex-col relative bg-neutral-900">
        {/* Chat Header */}
        <header className="h-16 px-6 border-b border-neutral-800 flex justify-between items-center bg-surface-container/30 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                className="w-10 h-10 rounded-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBShkZ_SpqhRLn4j_vMINJnXClZW5ipyOlMFDsYc46l_nKjOlY59zl-XK7OPttKrn5OIPqeA1-PSqmB0MC5h7QPZ8tx1WRT21OGa_z_7nWTjRIHkswdmlYHGniMHjzA5ZIsWVdYRFHLQfB2DO606cff4xkDBXWFAL7lekmfNjvpiBrHR-DMjRF-yVQ84CSW4brV_Jml_VMKM5G0-zanOqOpmP-qh4WT8bwIOYlmNml5_pThImPrEP3ThAGvT5-usTYIfwcMk44XhQ"
                alt={userDetails.name}
              />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-cyan-400 border-2 border-neutral-900 rounded-full"></div>
            </div>
            <div>
              <h3 className="font-bold text-on-surface leading-none">{userDetails.name}</h3>
              <p className="text-[10px] text-cyan-400 font-medium uppercase tracking-tighter mt-1">
                Level 5 Clearance • Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-neutral-400 hover:text-cyan-400 transition-colors">
              <MaterialIcon name="videocam" />
            </button>
            <button className="text-neutral-400 hover:text-cyan-400 transition-colors">
              <MaterialIcon name="call" />
            </button>
            <div className="w-px h-6 bg-neutral-800 mx-2"></div>
            <button className="text-neutral-400 hover:text-cyan-400 transition-colors">
              <MaterialIcon name="search" />
            </button>
            <button className="text-neutral-400 hover:text-cyan-400 transition-colors">
              <MaterialIcon name="more_vert" />
            </button>
          </div>
        </header>

        {/* Messages Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800/20 via-transparent to-transparent">
          {/* Date Separator */}
          <div className="flex justify-center">
            <span className="px-3 py-1 bg-surface-container rounded-full text-[10px] font-bold text-neutral-500 uppercase tracking-widest border border-neutral-800">
              August 29, 1997
            </span>
          </div>

          {/* Messages */}
          {mockMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-end gap-3',
                message.isOwn ? 'flex-row-reverse ml-auto' : '',
                'max-w-[80%]'
              )}
            >
              {message.isOwn ? (
                <div className="w-8 h-8 rounded-full bg-cyan-400 flex items-center justify-center flex-shrink-0">
                  <MaterialIcon
                    name={message.icon || "shield_with_heart"}
                    className="text-black text-sm"
                    filled
                  />
                </div>
              ) : (
                message.avatar && (
                  <img
                    className={cn(
                      "w-8 h-8 rounded-full object-cover flex-shrink-0",
                      !message.isOwn ? "border border-neutral-800" : ""
                    )}
                    src={message.avatar}
                    alt={message.author}
                  />
                )
              )}

              <div className={cn(
                'flex flex-col gap-1',
                message.isOwn ? 'items-end' : ''
              )}>
                {message.file ? (
                  // File Message
                  <div className="bg-surface-container-highest border-l-4 border-cyan-400 p-3 rounded-xl flex items-center gap-4 min-w-[280px]">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400">
                      <MaterialIcon name="description" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-on-surface">{message.file.name}</p>
                      <p className="text-[10px] text-neutral-500">{message.file.size} • {message.file.type}</p>
                    </div>
                    <button className="p-2 hover:bg-neutral-800 rounded-lg text-cyan-400 transition-colors">
                      <MaterialIcon name="download" />
                    </button>
                  </div>
                ) : (
                  // Text Message
                  <div className={cn(
                    'px-4 py-2.5 rounded-2xl text-sm leading-relaxed border',
                    message.isOwn
                      ? 'bg-cyan-400 text-black font-medium rounded-br-none shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                      : 'bg-surface-container-high text-on-surface rounded-bl-none border-neutral-800 shadow-sm'
                  )}>
                    {message.content}
                  </div>
                )}
                <div className={cn(
                  'flex items-center gap-1',
                  message.isOwn ? 'mr-1' : 'ml-1'
                )}>
                  <span className="text-[10px] text-neutral-500">{message.timestamp}</span>
                  {message.isOwn && (
                    <MaterialIcon
                      name="done_all"
                      className="text-cyan-400 text-xs"
                      filled
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <footer className="p-4 bg-surface-container-low border-t border-neutral-800">
          <div className="flex items-center gap-3">
            <button className="p-2 text-neutral-400 hover:text-cyan-400 transition-colors">
              <MaterialIcon name="add" />
            </button>
            <div className="flex-1 relative">
              <input
                className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-cyan-400 text-on-surface placeholder-neutral-500"
                placeholder="Type a message..."
                type="text"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-cyan-400">
                <MaterialIcon name="sentiment_satisfied" />
              </button>
            </div>
            <button className="w-11 h-11 bg-cyan-400 text-black rounded-xl flex items-center justify-center hover:bg-cyan-300 active:scale-90 transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)]">
              <MaterialIcon name="send" className="text-sm" filled />
            </button>
          </div>
        </footer>
      </section>

      {/* Right Column: User Details Panel (w-80) */}
      <aside className="w-80 border-l border-neutral-800 bg-surface-container-lowest hidden lg:flex flex-col">
        {/* User Profile Summary */}
        <div className="p-8 flex flex-col items-center text-center border-b border-neutral-800">
          <div className="relative mb-4">
            <img
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-cyan-500/10"
              src={userDetails.avatar}
              alt={userDetails.name}
            />
            <div className="absolute -bottom-2 -right-2 bg-cyan-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              {userDetails.priority}
            </div>
          </div>
          <h2 className="text-xl font-bold text-on-surface">{userDetails.name}</h2>
          <p className="text-xs text-neutral-500 font-medium">{userDetails.role}</p>
          <div className="grid grid-cols-2 gap-2 w-full mt-6">
            <button className="flex flex-col items-center gap-1 p-3 rounded-xl bg-surface-container-low hover:bg-neutral-800 transition-colors border border-neutral-800">
              <MaterialIcon name="person_search" className="text-cyan-400" />
              <span className="text-[10px] text-neutral-400 font-bold uppercase">Profile</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 rounded-xl bg-surface-container-low hover:bg-neutral-800 transition-colors border border-neutral-800">
              <MaterialIcon name="lock_open" className="text-cyan-400" />
              <span className="text-[10px] text-neutral-400 font-bold uppercase">Permissions</span>
            </button>
          </div>
        </div>

        {/* System Context & Metadata */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-4">
              Live Session Data
            </h3>
            <div className="space-y-3">
              <div className="bg-surface-container-low p-3 rounded-lg border border-neutral-800">
                <p className="text-[10px] text-neutral-500 mb-1">GEO-LOCATION</p>
                <div className="flex items-center gap-2">
                  <MaterialIcon name="location_on" className="text-xs text-cyan-400" />
                  <span className="text-sm font-medium text-on-surface">{userDetails.location}</span>
                </div>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-neutral-800">
                <p className="text-[10px] text-neutral-500 mb-1">NETWORK UPTIME</p>
                <div className="flex items-center gap-2">
                  <MaterialIcon name="bolt" className="text-xs text-cyan-400" />
                  <span className="text-sm font-medium text-on-surface">{userDetails.uptime}</span>
                </div>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-neutral-800">
                <p className="text-[10px] text-neutral-500 mb-1">SECURITY RISK</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-on-surface">{userDetails.security}</span>
                  <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold rounded">
                    {userDetails.securityLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-4">
              Shared Assets
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="aspect-square rounded-lg bg-surface-container overflow-hidden group cursor-pointer relative">
                <img
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoR_h-4pVmnxSZEwocd3IZ3vdNb3z1TToSslQ8IaPFGQQdzKaP71GHMqiGsiMsZ1R0TIkFUm05FDD_0lPglTPnrd--g5JQ1YEWR57OBnm8_3cNQejBV9xYVOoCbhKoaXc_rvJT-DrKrxbkBuKxI7gzrWSKnU1yX_QjWuwhp15vpO4ht8uXDxPqY2pFy1dildBnVkm_BOR2euCvuM0hrt3YjbMssYaAZeHEGvKeA3JC6k0VcX8w_E7mEl1IrSU65__YUM19332nr-U"
                  alt="Circuit board"
                />
              </div>
              <div className="aspect-square rounded-lg bg-surface-container overflow-hidden group cursor-pointer relative">
                <img
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdIOepwdPLoZnCFMgcGbTuER2YETyYr-cVf1pohezdqsVAvBLusu60Hc73hiLyJqjq_uw_J9Pphie2Ok9caFc3MR53wPr6b4jjz_vZ_tel8lWM5RqkHMmjfpec9aFjXjlWfsf39Dn3nh6bt2-_GeEUSvvkb8GB_zEx1CONJORuqq-OPx1TwypXqAFpvnMFL8mG1YKFRJ67HIO5trUX-mfvn0V0gSQuJzaSmA05nUCaCGXAfZJZfbO3iFqhzBfd1cRoHWl0plnq3DA"
                  alt="Security server"
                />
              </div>
              <div className="aspect-square rounded-lg bg-surface-container overflow-hidden group cursor-pointer relative flex items-center justify-center bg-neutral-800 text-neutral-500">
                <span className="text-xs font-bold">+12</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button className="w-full py-3 rounded-xl border-2 border-error text-error font-bold text-sm hover:bg-error/10 transition-all flex items-center justify-center gap-2">
              <MaterialIcon name="gpp_maybe" />
              TERMINATE SESSION
            </button>
          </div>
        </div>
      </aside>
    </main>
  );
}
