import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMe, fetchAdminSettings, updateAdminSettings } from '@/data/api';
import { ArrowLeft, Save, Settings, Percent, Globe } from 'lucide-react';
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

  useEffect(() => {
    (async () => {
      try {
        const me = await fetchMe();
        setUser(me);
        if (!me.is_admin) { setError('Access denied. Admin only.'); setLoading(false); return; }
        const s = await fetchAdminSettings();
        setSettings(s); setLocalSettings(s);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true); setSuccess(false);
    try {
      const updated = await updateAdminSettings({ default_region: localSettings.default_region, commission: localSettings.commission, admin_email: localSettings.admin_email });
      setSettings(updated); setLocalSettings(updated); setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><div className="w-8 h-8 border-2 border-valorant border-t-transparent rounded-full animate-spin" /></div>;
  if (error && !settings) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><div className="text-center"><p className="text-red-400">{error}</p><button onClick={() => navigate('/')} className="mt-4 text-sm text-zinc-400 underline">Back</button></div></div>;

  return (
    <div className="min-h-screen bg-[#09090b] noise-bg" data-testid="admin-dashboard">
      <div className="border-b border-white/5 bg-[#09090b]/70 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button data-testid="admin-back-btn" onClick={() => navigate('/')} className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"><ArrowLeft className="w-4 h-4" /></button>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-valorant to-valorant/60 flex items-center justify-center"><Settings className="w-5 h-5 text-white" /></div>
            <div><h1 className="text-lg font-heading font-bold text-white">Admin Panel</h1><p className="text-xs text-zinc-500">{user?.email}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <button data-testid="nav-sync-settings" onClick={() => navigate('/admin/sync-settings')} className="px-4 py-2 bg-electric/10 text-electric text-sm font-semibold rounded-lg border border-electric/30 hover:bg-electric/20 transition-all">Sync Settings</button>
            <button data-testid="admin-save-btn" onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-valorant text-white font-semibold text-sm rounded-lg hover:bg-valorant-hover disabled:opacity-50 transition-all"><Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </div>
      {success && <div className="max-w-5xl mx-auto px-6 mt-4"><div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">Saved!</div></div>}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2"><Globe className="w-5 h-5 text-electric" /><h2 className="text-base font-heading font-bold text-white">Default Fetch Region</h2></div>
          <Select value={localSettings?.default_region || 'eu'} onValueChange={v => setLocalSettings(p => ({ ...p, default_region: v }))}>
            <SelectTrigger data-testid="admin-region-select" className="bg-zinc-900/80 border-white/10 text-white text-sm w-64"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10 text-white">
              <SelectItem value="all">All Regions</SelectItem><SelectItem value="eu">Europe</SelectItem><SelectItem value="na">North America</SelectItem><SelectItem value="ap">Asia Pacific</SelectItem><SelectItem value="kr">Korea</SelectItem><SelectItem value="br">Brazil</SelectItem><SelectItem value="latam">LATAM</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="glass rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2"><Percent className="w-5 h-5 text-amber-400" /><h2 className="text-base font-heading font-bold text-white">Commission Markup</h2></div>
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
