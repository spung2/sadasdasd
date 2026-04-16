import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMe, fetchAdminSettings, updateAdminSettings, fetchProfiles, createProfile, deleteProfile } from '@/data/api';
import { ArrowLeft, Save, Settings, Percent, Globe, Plus, Trash2, Link, Crosshair, Crown } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [localSettings, setLocalSettings] = useState(null);

  // Profiles
  const [profiles, setProfiles] = useState([]);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('valorant');
  const [newUrl, setNewUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const me = await fetchMe();
        setUser(me);
        if (!me.is_admin) { setError('Access denied. Admin only.'); setLoading(false); return; }
        const [s, p] = await Promise.all([fetchAdminSettings(), fetchProfiles()]);
        setSettings(s); setLocalSettings(s);
        setProfiles(p.profiles || []);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true); setSuccess(false);
    try {
      const updated = await updateAdminSettings({ default_region: localSettings.default_region, commission: localSettings.commission, admin_email: localSettings.admin_email, base_urls: localSettings.base_urls });
      setSettings(updated); setLocalSettings(updated); setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleCreateProfile = async () => {
    if (!newName.trim() || !newUrl.trim()) { setProfileError('Name and URL are required'); return; }
    setCreating(true); setProfileError('');
    try {
      const prof = await createProfile({ name: newName.trim(), category: newCategory, lzt_url: newUrl.trim() });
      setProfiles(prev => [...prev, prof]);
      setNewName(''); setNewUrl('');
    } catch (e) { setProfileError(e.message); }
    finally { setCreating(false); }
  };

  const handleDeleteProfile = async (profileId) => {
    try {
      await deleteProfile(profileId);
      setProfiles(prev => prev.filter(p => p.profile_id !== profileId));
    } catch (e) { setProfileError(e.message); }
  };

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><div className="w-8 h-8 border-2 border-valorant border-t-transparent rounded-full animate-spin" /></div>;
  if (error && !settings) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><div className="text-center"><p className="text-red-400">{error}</p><button onClick={() => navigate('/')} className="mt-4 text-sm text-zinc-400 underline">Back</button></div></div>;

  const valProfiles = profiles.filter(p => p.category === 'valorant');
  const lolProfiles = profiles.filter(p => p.category === 'lol');

  return (
    <div className="min-h-screen bg-[#09090b] noise-bg" data-testid="admin-dashboard">
      <div className="border-b border-white/5 bg-[#09090b]/70 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button data-testid="admin-back-btn" onClick={() => navigate('/')} className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"><ArrowLeft className="w-4 h-4" /></button>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-valorant to-valorant/60 flex items-center justify-center"><Settings className="w-5 h-5 text-white" /></div>
            <div><h1 className="text-lg font-heading font-bold text-white">Admin Panel</h1><p className="text-xs text-zinc-500">{user?.email}</p></div>
          </div>
          <button data-testid="admin-save-btn" onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-valorant text-white font-semibold text-sm rounded-lg hover:bg-valorant-hover disabled:opacity-50 transition-all"><Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
      {success && <div className="max-w-5xl mx-auto px-6 mt-4"><div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">Saved!</div></div>}

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* ===== BASE/DEFAULT FETCH URLs ===== */}
        <div className="glass rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-valorant" />
            <h2 className="text-base font-heading font-bold text-white">Base Fetch URLs</h2>
          </div>
          <p className="text-xs text-zinc-500">Set the default LZT Market URL for the "All" category view. This ensures users browsing the main categories only see curated accounts (e.g., no phishing).</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">All Valorant (Base URL)</label>
              <input data-testid="base-url-valorant" type="text" placeholder="https://lzt.market/riot?not_origin[]=phishing&..." value={localSettings?.base_urls?.valorant || ''} onChange={e => setLocalSettings(p => ({...p, base_urls: {...(p.base_urls||{}), valorant: e.target.value}}))}
                className="w-full px-3 py-2.5 bg-zinc-900/80 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-valorant/50 font-mono text-xs" />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">All League of Legends (Base URL)</label>
              <input data-testid="base-url-lol" type="text" placeholder="https://lzt.market/riot?not_origin[]=phishing&..." value={localSettings?.base_urls?.lol || ''} onChange={e => setLocalSettings(p => ({...p, base_urls: {...(p.base_urls||{}), lol: e.target.value}}))}
                className="w-full px-3 py-2.5 bg-zinc-900/80 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-valorant/50 font-mono text-xs" />
            </div>
          </div>
        </div>

        <Separator className="bg-white/5" />

        {/* ===== URL PROFILES ===== */}
        <div className="glass rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <Link className="w-5 h-5 text-electric" />
            <h2 className="text-base font-heading font-bold text-white">URL Fetch Profiles</h2>
          </div>
          <p className="text-xs text-zinc-500">Paste LZT Market URLs to create fetch presets. Each profile appears as a sub-category on the marketplace.</p>

          {/* Add new profile form */}
          <div className="p-4 rounded-lg bg-zinc-900/60 border border-white/5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input data-testid="profile-name-input" type="text" placeholder="Profile Name" value={newName} onChange={e => setNewName(e.target.value)}
                className="px-3 py-2.5 bg-zinc-800/60 border border-zinc-700/50 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500" />
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger data-testid="profile-category-select" className="bg-zinc-800/60 border-zinc-700/50 text-white text-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  <SelectItem value="valorant">Valorant</SelectItem>
                  <SelectItem value="lol">League of Legends</SelectItem>
                </SelectContent>
              </Select>
              <input data-testid="profile-url-input" type="text" placeholder="https://lzt.market/riot?..." value={newUrl} onChange={e => setNewUrl(e.target.value)}
                className="sm:col-span-2 px-3 py-2.5 bg-zinc-800/60 border border-zinc-700/50 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 font-mono text-xs" />
            </div>
            <div className="flex items-center justify-between">
              {profileError && <p className="text-xs text-red-400">{profileError}</p>}
              {!profileError && <div />}
              <button data-testid="add-profile-btn" onClick={handleCreateProfile} disabled={creating}
                className="flex items-center gap-2 px-4 py-2 bg-electric/10 text-electric text-sm font-semibold rounded-lg border border-electric/30 hover:bg-electric/20 disabled:opacity-50 transition-all">
                <Plus className="w-4 h-4" />{creating ? 'Adding...' : 'Add Profile'}
              </button>
            </div>
          </div>

          {/* Existing profiles */}
          {valProfiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2"><Crosshair className="w-3.5 h-3.5 text-valorant" />Valorant Profiles</h3>
              {valProfiles.map(p => (
                <div key={p.profile_id} data-testid={`profile-${p.profile_id}`} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{p.name}</p>
                    <p className="text-[10px] text-zinc-600 font-mono truncate mt-0.5">{p.lzt_url}</p>
                  </div>
                  <button data-testid={`delete-profile-${p.profile_id}`} onClick={() => handleDeleteProfile(p.profile_id)} className="p-2 text-zinc-600 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
          {lolProfiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" />League of Legends Profiles</h3>
              {lolProfiles.map(p => (
                <div key={p.profile_id} data-testid={`profile-${p.profile_id}`} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{p.name}</p>
                    <p className="text-[10px] text-zinc-600 font-mono truncate mt-0.5">{p.lzt_url}</p>
                  </div>
                  <button data-testid={`delete-profile-${p.profile_id}`} onClick={() => handleDeleteProfile(p.profile_id)} className="p-2 text-zinc-600 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
          {profiles.length === 0 && <p className="text-xs text-zinc-600 text-center py-4">No profiles yet. Add your first LZT URL above.</p>}
        </div>

        <Separator className="bg-white/5" />

        {/* Commission + Region + Email settings (kept from before) */}
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-electric" /><h2 className="text-base font-heading font-bold text-white">Default Region</h2></div>
          <Select value={localSettings?.default_region || 'eu'} onValueChange={v => setLocalSettings(p => ({ ...p, default_region: v }))}>
            <SelectTrigger data-testid="admin-region-select" className="bg-zinc-900/80 border-white/10 text-white text-sm w-64"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10 text-white">
              <SelectItem value="all">All Regions</SelectItem><SelectItem value="eu">Europe</SelectItem><SelectItem value="na">North America</SelectItem><SelectItem value="ap">Asia Pacific</SelectItem><SelectItem value="kr">Korea</SelectItem><SelectItem value="br">Brazil</SelectItem><SelectItem value="latam">LATAM</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="glass rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3"><Percent className="w-5 h-5 text-amber-400" /><h2 className="text-base font-heading font-bold text-white">Commission Markup</h2></div>
          <Separator className="bg-white/5" />
          {['valorant','lol'].map(cat => (
            <div key={cat} className="space-y-3">
              <div className="flex items-center justify-between"><label className="text-sm font-medium text-white capitalize">{cat === 'lol' ? 'League of Legends' : 'Valorant'}</label><span className="text-sm font-bold text-valorant">{localSettings?.commission?.[cat]||100}%</span></div>
              <Slider data-testid={`admin-commission-${cat}`} value={[localSettings?.commission?.[cat]||100]} onValueChange={([v]) => setLocalSettings(p => ({...p, commission:{...p.commission,[cat]:v}}))} min={0} max={300} step={5} className="[&_[role=slider]]:bg-amber-400 [&_[role=slider]]:border-amber-400/50 [&_.relative_.absolute]:bg-amber-400" />
            </div>
          ))}
        </div>

        <div className="glass rounded-xl p-6 space-y-4">
          <h2 className="text-base font-heading font-bold text-white">Admin Email</h2>
          <input data-testid="admin-email-input" type="email" value={localSettings?.admin_email||''} onChange={e => setLocalSettings(p => ({...p, admin_email:e.target.value}))} className="w-full px-4 py-2.5 bg-zinc-900/80 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-valorant/50" />
        </div>
      </div>
    </div>
  );
}
