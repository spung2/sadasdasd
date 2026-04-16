import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMe } from '@/data/api';
import { ArrowLeft, Save, X, Settings } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

async function loadFetchSettings() {
  const r = await fetch(`${API}/admin/fetch-settings`, { credentials: 'include' });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
}
async function saveFetchSettings(data) {
  const r = await fetch(`${API}/admin/fetch-settings`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(data) });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
}

const ORIGINS = ['brute', 'phishing', 'stealer', 'personal', 'resale', 'autoreg', 'dummy', 'self_registration'];
const EMAIL_TYPES = ['autoreg', 'native', 'no', 'no_market'];
const VAL_REGIONS = ['EU', 'NA', 'AP', 'KR', 'BR', 'LATAM'];
const LOL_REGIONS = ['euw', 'eune', 'na', 'kr', 'jp', 'oce', 'br', 'las', 'lan', 'ru', 'tr', 'sg', 'ph', 'tw', 'vn', 'th'];
const VAL_RANKS = ['Unranked', 'Iron 1', 'Iron 2', 'Iron 3', 'Bronze 1', 'Bronze 2', 'Bronze 3', 'Silver 1', 'Silver 2', 'Silver 3', 'Gold 1', 'Gold 2', 'Gold 3', 'Platinum 1', 'Platinum 2', 'Platinum 3', 'Diamond 1', 'Diamond 2', 'Diamond 3', 'Ascendant 1', 'Ascendant 2', 'Ascendant 3', 'Immortal 1', 'Immortal 2', 'Immortal 3', 'Radiant'];

// Reusable Components
function TextInput({ label, value, onChange, placeholder, testId }) {
  return (
    <input data-testid={testId} type="text" placeholder={placeholder || label} value={value || ''} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-zinc-800/60 border border-zinc-700/50 rounded text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors" />
  );
}

function RangeInputs({ labelFrom, labelTo, valueFrom, valueTo, onChangeFrom, onChangeTo, testId }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <input data-testid={testId ? `${testId}-from` : undefined} type="text" placeholder={labelFrom || 'from'} value={valueFrom || ''} onChange={e => onChangeFrom(e.target.value)}
        className="w-full px-3 py-2 bg-zinc-800/60 border border-zinc-700/50 rounded text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500" />
      <input data-testid={testId ? `${testId}-to` : undefined} type="text" placeholder={labelTo || 'up to'} value={valueTo || ''} onChange={e => onChangeTo(e.target.value)}
        className="w-full px-3 py-2 bg-zinc-800/60 border border-zinc-700/50 rounded text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500" />
    </div>
  );
}

function TriToggle({ label, value, onChange, testId }) {
  const opts = ['nomatter', 'no', 'yes'];
  const display = { nomatter: 'No matter', no: 'No', yes: 'Yes' };
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-white">{label}</label>
      <div className="flex gap-1" data-testid={testId}>
        {opts.map(o => (
          <button key={o} type="button" onClick={() => onChange(o)}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-all ${value === o ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40' : 'bg-zinc-800/60 text-zinc-500 border border-zinc-700/40 hover:text-zinc-300'}`}>
            {display[o]}
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckboxField({ label, checked, onChange, testId }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group" data-testid={testId}>
      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${checked ? 'bg-emerald-600/30 border-emerald-500/50' : 'border-zinc-600 bg-zinc-800/40'}`}>
        {checked && <div className="w-2 h-2 rounded-sm bg-emerald-400" />}
      </div>
      <span className="text-sm text-zinc-400 group-hover:text-zinc-300">{label}</span>
    </label>
  );
}

function TagInput({ tags, onRemove, placeholder, onAdd, testId }) {
  const [input, setInput] = useState('');
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) { e.preventDefault(); onAdd(input.trim()); setInput(''); }
  };
  return (
    <div data-testid={testId}>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {(tags || []).map((t, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-800 rounded text-xs text-white font-semibold border border-zinc-700/50">
            {t}
            <button type="button" onClick={() => onRemove(t)} className="text-zinc-500 hover:text-white"><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder}
        className="w-full px-3 py-2 bg-zinc-800/60 border border-zinc-700/50 rounded text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500" />
    </div>
  );
}

function SelectInput({ value, onChange, options, placeholder, testId }) {
  return (
    <select data-testid={testId} value={value || ''} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-zinc-800/60 border border-zinc-700/50 rounded text-sm text-zinc-300 focus:outline-none focus:border-zinc-500 appearance-none">
      <option value="">{placeholder || 'Select...'}</option>
      {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
    </select>
  );
}

function RangeSelectInputs({ labelFrom, labelTo, options, valueFrom, valueTo, onChangeFrom, onChangeTo, testId }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <select data-testid={testId ? `${testId}-from` : undefined} value={valueFrom || ''} onChange={e => onChangeFrom(e.target.value)}
        className="w-full px-3 py-2 bg-zinc-800/60 border border-zinc-700/50 rounded text-sm text-zinc-300 focus:outline-none focus:border-zinc-500 appearance-none">
        <option value="">{labelFrom || 'from'}</option>
        {options.map((o, i) => <option key={i} value={o.value !== undefined ? o.value : i}>{o.label || o}</option>)}
      </select>
      <select data-testid={testId ? `${testId}-to` : undefined} value={valueTo || ''} onChange={e => onChangeTo(e.target.value)}
        className="w-full px-3 py-2 bg-zinc-800/60 border border-zinc-700/50 rounded text-sm text-zinc-300 focus:outline-none focus:border-zinc-500 appearance-none">
        <option value="">{labelTo || 'up to'}</option>
        {options.map((o, i) => <option key={i} value={o.value !== undefined ? o.value : i}>{o.label || o}</option>)}
      </select>
    </div>
  );
}

function SectionLabel({ children }) {
  return <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">{children}</label>;
}

export default function AdminSyncSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [general, setGeneral] = useState({});
  const [valorant, setValorant] = useState({});
  const [lol, setLol] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const me = await fetchMe();
        setUser(me);
        if (!me.is_admin) { setError('Admin access required'); setLoading(false); return; }
        const s = await loadFetchSettings();
        setGeneral(s.general || {}); setValorant(s.valorant || {}); setLol(s.lol || {});
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true); setSuccess(false); setError(null);
    try {
      await saveFetchSettings({ general, valorant, lol });
      setSuccess(true); setTimeout(() => setSuccess(false), 3000);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const gSet = (k, v) => setGeneral(p => ({ ...p, [k]: v }));
  const vSet = (k, v) => setValorant(p => ({ ...p, [k]: v }));
  const lSet = (k, v) => setLol(p => ({ ...p, [k]: v }));
  const addToArray = (setter, key, val) => setter(p => ({ ...p, [key]: [...(p[key] || []), val] }));
  const removeFromArray = (setter, key, val) => setter(p => ({ ...p, [key]: (p[key] || []).filter(v => v !== val) }));

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><div className="w-8 h-8 border-2 border-valorant border-t-transparent rounded-full animate-spin" /></div>;
  if (error && !user?.is_admin) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><div className="text-center"><p className="text-red-400">{error}</p><button onClick={() => navigate('/')} className="mt-4 text-sm text-zinc-400 underline">Back</button></div></div>;

  const rankOptions = VAL_RANKS.map((r, i) => ({ value: i <= 0 ? '0' : String(i + 2), label: r }));

  return (
    <div className="min-h-screen bg-[#0d0d0f]" data-testid="admin-sync-settings">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-zinc-800 bg-[#0d0d0f]/90 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button data-testid="sync-back-btn" onClick={() => navigate('/admin')} className="p-2 rounded-lg bg-zinc-900 border border-zinc-700/50 text-zinc-400 hover:text-white"><ArrowLeft className="w-4 h-4" /></button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-valorant to-valorant/60 flex items-center justify-center"><Settings className="w-4 h-4 text-white" /></div>
            <div>
              <h1 className="text-base font-heading font-bold text-white">Sync Fetch Settings</h1>
              <p className="text-[10px] text-zinc-600">LZT Market API Parameters</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {success && <span className="text-xs text-emerald-400 font-medium">Saved!</span>}
            {error && user?.is_admin && <span className="text-xs text-red-400">{error}</span>}
            <button data-testid="save-fetch-settings-btn" onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-valorant text-white font-semibold text-sm rounded-lg hover:bg-valorant-hover disabled:opacity-50 transition-all">
              <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Fetch Settings'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-5">
        {/* Top Bar: Price + Search */}
        <div className="flex gap-2 mb-5">
          <div className="flex items-center gap-0">
            <input data-testid="fs-pmin" type="text" placeholder="Price from" value={general.pmin || ''} onChange={e => gSet('pmin', e.target.value)}
              className="w-28 px-3 py-2.5 bg-zinc-900 border border-zinc-700/50 rounded-l text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500" />
            <span className="px-2 py-2.5 bg-zinc-900 border-y border-zinc-700/50 text-xs text-zinc-500">$</span>
            <input data-testid="fs-pmax" type="text" placeholder="up to" value={general.pmax || ''} onChange={e => gSet('pmax', e.target.value)}
              className="w-28 px-3 py-2.5 bg-zinc-900 border border-zinc-700/50 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500" />
            <span className="px-2 py-2.5 bg-zinc-900 border-y border-r border-zinc-700/50 rounded-r text-xs text-zinc-500">$</span>
          </div>
          <input data-testid="fs-title" type="text" placeholder="Search by title" value={general.title || ''} onChange={e => gSet('title', e.target.value)}
            className="flex-1 px-3 py-2.5 bg-zinc-900 border border-zinc-700/50 rounded text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500" />
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* ===== COLUMN 1: General Settings ===== */}
          <div className="space-y-3" data-testid="col-general">
            <TagInput testId="fs-origin" tags={general.origin || []} placeholder="Account origin" onAdd={v => addToArray(setGeneral, 'origin', v)} onRemove={v => removeFromArray(setGeneral, 'origin', v)} />
            <TextInput testId="fs-country" label="Country" value={general.country} onChange={v => gSet('country', v)} />
            <TextInput testId="fs-not-country" label="Exclude country" value={general.not_country} onChange={v => gSet('not_country', v)} />
            <TextInput testId="fs-daybreak" label="Last activity in days" value={general.daybreak} onChange={v => gSet('daybreak', v)} />
            <TriToggle testId="fs-email" label="Email linked" value={general.email || 'nomatter'} onChange={v => gSet('email', v)} />
            <TriToggle testId="fs-tel" label="Phone linked" value={general.tel || 'nomatter'} onChange={v => gSet('tel', v)} />
            <TagInput testId="fs-email-type" tags={general.email_type || []} placeholder="Email type (autoreg, native, no)" onAdd={v => addToArray(setGeneral, 'email_type', v)} onRemove={v => removeFromArray(setGeneral, 'email_type', v)} />
            <TextInput testId="fs-item-domain" label="Email domain" value={general.item_domain} onChange={v => gSet('item_domain', v)} />
            <TextInput testId="fs-not-item-domain" label="Exclude mail domain" value={general.not_item_domain} onChange={v => gSet('not_item_domain', v)} />
            <TextInput testId="fs-email-provider" label="Mail provider" value={general.email_provider} onChange={v => gSet('email_provider', v)} />
            <TextInput testId="fs-not-email-provider" label="Exclude mail provider" value={general.not_email_provider} onChange={v => gSet('not_email_provider', v)} />
            <div className="space-y-2 pt-2">
              <CheckboxField testId="fs-nsb" label="Not sold before" checked={!!general.nsb} onChange={() => gSet('nsb', !general.nsb)} />
              <CheckboxField testId="fs-sb" label="Sold before" checked={!!general.sb} onChange={() => gSet('sb', !general.sb)} />
              <CheckboxField testId="fs-nsb-by-me" label="Not sold before by me" checked={!!general.nsb_by_me} onChange={() => gSet('nsb_by_me', !general.nsb_by_me)} />
              <CheckboxField testId="fs-sb-by-me" label="Sold before by me" checked={!!general.sb_by_me} onChange={() => gSet('sb_by_me', !general.sb_by_me)} />
            </div>
          </div>

          {/* ===== COLUMN 2: Valorant ===== */}
          <div className="space-y-3" data-testid="col-valorant">
            <h2 className="text-sm font-heading font-bold text-white uppercase tracking-wider pb-1">Valorant</h2>
            <TextInput testId="fs-val-skins" label="Skins" value={valorant.weaponSkin} onChange={v => vSet('weaponSkin', v)} placeholder="Skins" />
            <CheckboxField testId="fs-val-knife" label="Has any knife" checked={!!valorant.knife} onChange={() => vSet('knife', !valorant.knife)} />
            <RangeInputs testId="fs-val-knifes" labelFrom="Knifes from" labelTo="up to" valueFrom={valorant.valorant_knife_min} valueTo={valorant.valorant_knife_max} onChangeFrom={v => vSet('valorant_knife_min', v)} onChangeTo={v => vSet('valorant_knife_max', v)} />
            <TextInput testId="fs-val-buddies" label="Gunbuddies" value={valorant.buddy} onChange={v => vSet('buddy', v)} placeholder="Gunbuddies" />
            <TextInput testId="fs-val-agents" label="Agents" value={valorant.agent} onChange={v => vSet('agent', v)} placeholder="Agents" />
            <TagInput testId="fs-val-region" tags={valorant.valorant_region || []} placeholder="Region" onAdd={v => addToArray(setValorant, 'valorant_region', v)} onRemove={v => removeFromArray(setValorant, 'valorant_region', v)} />
            <TextInput testId="fs-val-not-region" label="Exclude region" value={valorant.valorant_not_region} onChange={v => vSet('valorant_not_region', v)} placeholder="Exclude region" />

            <SectionLabel>Rank</SectionLabel>
            <RangeSelectInputs testId="fs-val-rank" labelFrom="Rank from" labelTo="up to" options={rankOptions} valueFrom={valorant.rmin} valueTo={valorant.rmax} onChangeFrom={v => vSet('rmin', v)} onChangeTo={v => vSet('rmax', v)} />

            <SectionLabel>Previous Season Rank</SectionLabel>
            <RangeSelectInputs testId="fs-val-prev-rank" labelFrom="from" labelTo="up to" options={rankOptions} valueFrom={valorant.previous_rmin} valueTo={valorant.previous_rmax} onChangeFrom={v => vSet('previous_rmin', v)} onChangeTo={v => vSet('previous_rmax', v)} />

            <SectionLabel>Last Rank</SectionLabel>
            <RangeSelectInputs testId="fs-val-last-rank" labelFrom="from" labelTo="up to" options={rankOptions} valueFrom={valorant.last_rmin} valueTo={valorant.last_rmax} onChangeFrom={v => vSet('last_rmin', v)} onChangeTo={v => vSet('last_rmax', v)} />

            <RangeInputs testId="fs-val-outfits" labelFrom="Min outfits" labelTo="up to" valueFrom={valorant.valorant_smin} valueTo={valorant.valorant_smax} onChangeFrom={v => vSet('valorant_smin', v)} onChangeTo={v => vSet('valorant_smax', v)} />
            <RangeInputs testId="fs-val-level" labelFrom="Level from" labelTo="up to" valueFrom={valorant.valorant_level_min} valueTo={valorant.valorant_level_max} onChangeFrom={v => vSet('valorant_level_min', v)} onChangeTo={v => vSet('valorant_level_max', v)} />
            <RangeInputs testId="fs-val-vp" labelFrom="VP from" labelTo="up to" valueFrom={valorant.vp_min} valueTo={valorant.vp_max} onChangeFrom={v => vSet('vp_min', v)} onChangeTo={v => vSet('vp_max', v)} />

            <SectionLabel>Inventory value</SectionLabel>
            <RangeInputs testId="fs-val-inv" labelFrom="from, VP" labelTo="up to, VP" valueFrom={valorant.inv_min} valueTo={valorant.inv_max} onChangeFrom={v => vSet('inv_min', v)} onChangeTo={v => vSet('inv_max', v)} />

            <RangeInputs testId="fs-val-agents-range" labelFrom="Free Agents from" labelTo="up to" valueFrom={valorant.amin} valueTo={valorant.amax} onChangeFrom={v => vSet('amin', v)} onChangeTo={v => vSet('amax', v)} />
          </div>

          {/* ===== COLUMN 3: League of Legends ===== */}
          <div className="space-y-3" data-testid="col-lol">
            <h2 className="text-sm font-heading font-bold text-white uppercase tracking-wider pb-1">League of Legends</h2>
            <TextInput testId="fs-lol-skins" label="Skins" value={lol.skin} onChange={v => lSet('skin', v)} placeholder="Skins" />
            <TextInput testId="fs-lol-champions" label="Champions" value={lol.champion} onChange={v => lSet('champion', v)} placeholder="Champions" />
            <TagInput testId="fs-lol-region" tags={lol.lol_region || []} placeholder="Region" onAdd={v => addToArray(setLol, 'lol_region', v)} onRemove={v => removeFromArray(setLol, 'lol_region', v)} />
            <TextInput testId="fs-lol-not-region" label="Exclude region" value={lol.lol_not_region} onChange={v => lSet('lol_not_region', v)} placeholder="Exclude region" />
            <TextInput testId="fs-lol-rank" label="Rank" value={lol.rank} onChange={v => lSet('rank', v)} placeholder="Rank" />
            <RangeInputs testId="fs-lol-level" labelFrom="Level from" labelTo="up to" valueFrom={lol.lol_level_min} valueTo={lol.lol_level_max} onChangeFrom={v => lSet('lol_level_min', v)} onChangeTo={v => lSet('lol_level_max', v)} />
            <RangeInputs testId="fs-lol-winrate" labelFrom="WinRate from" labelTo="up to" valueFrom={lol.win_rate_min} valueTo={lol.win_rate_max} onChangeFrom={v => lSet('win_rate_min', v)} onChangeTo={v => lSet('win_rate_max', v)} />
            <RangeInputs testId="fs-lol-skins-range" labelFrom="Skins from" labelTo="up to" valueFrom={lol.lol_smin} valueTo={lol.lol_smax} onChangeFrom={v => lSet('lol_smin', v)} onChangeTo={v => lSet('lol_smax', v)} />
            <RangeInputs testId="fs-lol-champs-range" labelFrom="Champions from" labelTo="up to" valueFrom={lol.champion_min} valueTo={lol.champion_max} onChangeFrom={v => lSet('champion_min', v)} onChangeTo={v => lSet('champion_max', v)} />
            <RangeInputs testId="fs-lol-blue" labelFrom="Blue essence from" labelTo="up to" valueFrom={lol.blue_min} valueTo={lol.blue_max} onChangeFrom={v => lSet('blue_min', v)} onChangeTo={v => lSet('blue_max', v)} />
            <RangeInputs testId="fs-lol-orange" labelFrom="Orange essence from" labelTo="up to" valueFrom={lol.orange_min} valueTo={lol.orange_max} onChangeFrom={v => lSet('orange_min', v)} onChangeTo={v => lSet('orange_max', v)} />
            <RangeInputs testId="fs-lol-mythic" labelFrom="Mythic essence from" labelTo="up to" valueFrom={lol.mythic_min} valueTo={lol.mythic_max} onChangeFrom={v => lSet('mythic_min', v)} onChangeTo={v => lSet('mythic_max', v)} />
            <RangeInputs testId="fs-lol-riot" labelFrom="Riot Points from" labelTo="up to" valueFrom={lol.riot_min} valueTo={lol.riot_max} onChangeFrom={v => lSet('riot_min', v)} onChangeTo={v => lSet('riot_max', v)} />
          </div>
        </div>
      </div>
    </div>
  );
}
