import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMe, fetchAdminSettings, updateAdminSettings } from '@/data/api';
import { Crosshair, Settings, ArrowLeft, Save, Globe, Percent } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
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
        setSettings(s);
        setLocalSettings(s);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true); setSuccess(false);
    try {
      const updated = await updateAdminSettings({
        default_region: localSettings.default_region,
        commission: localSettings.commission,
        admin_email: localSettings.admin_email,
      });
      setSettings(updated); setLocalSettings(updated); setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><div className="w-8 h-8 border-2 border-valorant border-t-transparent rounded-full animate-spin" /></div>;
  if (error && !settings) return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="text-center"><p className="text-red-400">{error}</p><button onClick={() => navigate('/')} className="mt-4 text-sm text-zinc-400 underline">Back to Marketplace</button></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090b] noise-bg" data-testid="admin-dashboard">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#09090b]/70 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button data-testid="admin-back-btn" onClick={() => navigate('/')} className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white transition-colors"><ArrowLeft className="w-4 h-4" /></button>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-valorant to-valorant/60 flex items-center justify-center"><Settings className="w-5 h-5 text-white" /></div>
            <div>
              <h1 className="text-lg font-heading font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-zinc-500">{user?.email}</p>
            </div>
          </div>
          <button data-testid="admin-save-btn" onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-valorant text-white font-semibold text-sm rounded-lg hover:bg-valorant-hover disabled:opacity-50 transition-all">
            <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {success && <div className="max-w-4xl mx-auto px-6 mt-4"><div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">Settings saved successfully!</div></div>}

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Default Region */}
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-5 h-5 text-electric" />
            <h2 className="text-base font-heading font-bold text-white">Default Fetch Region</h2>
          </div>
          <p className="text-xs text-zinc-500">Default region filter applied when users load the marketplace. Users can override in their filters.</p>
          <Select value={localSettings?.default_region || 'eu'} onValueChange={v => setLocalSettings(prev => ({ ...prev, default_region: v }))}>
            <SelectTrigger data-testid="admin-region-select" className="bg-zinc-900/80 border-white/10 text-white text-sm w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10 text-white">
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="eu">Europe (EU)</SelectItem>
              <SelectItem value="na">North America (NA)</SelectItem>
              <SelectItem value="ap">Asia Pacific (AP)</SelectItem>
              <SelectItem value="kr">Korea (KR)</SelectItem>
              <SelectItem value="br">Brazil (BR)</SelectItem>
              <SelectItem value="latam">Latin America (LATAM)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Commission Settings */}
        <div className="glass rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Percent className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-heading font-bold text-white">Commission Markup</h2>
          </div>
          <p className="text-xs text-zinc-500">Percentage added on top of the original LZT price. 100% = Price x 2.</p>
          <Separator className="bg-white/5" />
          {['valorant', 'lol'].map(cat => (
            <div key={cat} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white capitalize flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-valorant" /> {cat === 'lol' ? 'League of Legends' : 'Valorant'}
                </label>
                <span className="text-sm font-bold text-valorant">{localSettings?.commission?.[cat] || 100}%</span>
              </div>
              <Slider
                data-testid={`admin-commission-${cat}`}
                value={[localSettings?.commission?.[cat] || 100]}
                onValueChange={([v]) => setLocalSettings(prev => ({ ...prev, commission: { ...prev.commission, [cat]: v } }))}
                min={0} max={300} step={5}
                className="[&_[role=slider]]:bg-amber-400 [&_[role=slider]]:border-amber-400/50 [&_.relative_.absolute]:bg-amber-400"
              />
              <div className="flex justify-between text-xs text-zinc-600"><span>0% (no markup)</span><span>300% (4x price)</span></div>
            </div>
          ))}
        </div>

        {/* Admin Email */}
        <div className="glass rounded-xl p-6 space-y-4">
          <h2 className="text-base font-heading font-bold text-white">Admin Email</h2>
          <p className="text-xs text-zinc-500">The Google account email that has admin access.</p>
          <input
            data-testid="admin-email-input"
            type="email"
            value={localSettings?.admin_email || ''}
            onChange={e => setLocalSettings(prev => ({ ...prev, admin_email: e.target.value }))}
            className="w-full px-4 py-2.5 bg-zinc-900/80 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-valorant/50"
          />
        </div>
      </div>
    </div>
  );
}
