import { Crosshair, ShieldCheck, Flame, Store } from 'lucide-react';

export default function Navbar() {
  return (
    <nav
      data-testid="navbar"
      className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#09090b]/70 backdrop-blur-xl"
    >
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-valorant to-valorant/60 flex items-center justify-center shadow-[0_0_15px_rgba(255,70,85,0.3)]">
            <Crosshair className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-heading font-bold text-white tracking-tight leading-none">
              LZT <span className="text-valorant">Vault</span>
            </h1>
            <p className="text-[10px] font-body text-zinc-500 tracking-[0.15em] uppercase">
              Premium Accounts
            </p>
          </div>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: 'Marketplace', icon: Store, active: true },
            { label: 'Verified', icon: ShieldCheck },
            { label: 'Hot Deals', icon: Flame },
          ].map((item) => (
            <button
              key={item.label}
              data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                item.active
                  ? 'text-white bg-white/5'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/60 border border-white/5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-zinc-400 font-body">API Connected</span>
          </div>
          <button
            data-testid="sign-in-btn"
            className="px-4 py-2 text-sm font-semibold text-white bg-valorant/90 hover:bg-valorant rounded-lg transition-all hover:shadow-[0_0_20px_rgba(255,70,85,0.3)]"
          >
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
}
