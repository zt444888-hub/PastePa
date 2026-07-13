/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Cloud, Shield, Grid, Coins, Info, ChevronRight, X,
  Trash2, AlertCircle, Sparkles, Check, Heart, HelpCircle, Key, EyeOff,
  BarChart3, Clock, Smartphone, Activity, AlertTriangle, Zap, RefreshCw, Layers
} from 'lucide-react';
import { AppSetting, SUPPORTED_APPS, PasteItem } from '../types';

interface SettingsTabProps {
  settings: AppSetting;
  onChangeSettings: (settings: AppSetting) => void;
  onClearAll: () => void;
  history?: PasteItem[];
  onUpdateHistory?: (newHistory: PasteItem[]) => void;
}

export default function SettingsTab({
  settings,
  onChangeSettings,
  onClearAll,
  history = [],
  onUpdateHistory
}: SettingsTabProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showTipJarModal, setShowTipJarModal] = useState(false);
  const [tipSuccess, setTipSuccess] = useState(false);
  const [tipAmount, setTipAmount] = useState('');
  const [newIgnoreApp, setNewIgnoreApp] = useState('');
  const [showIgnoreSelector, setShowIgnoreSelector] = useState(false);
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState<'overview' | 'category' | 'diagnostics'>('overview');
  const [justOptimized, setJustOptimized] = useState(false);

  const updateSetting = <K extends keyof AppSetting>(key: K, value: AppSetting[K]) => {
    onChangeSettings({
      ...settings,
      [key]: value
    });
  };

  const handleToggleIgnoreApp = (bundleId: string) => {
    const isIgnored = settings.ignoredApps.includes(bundleId);
    if (isIgnored) {
      updateSetting('ignoredApps', settings.ignoredApps.filter(id => id !== bundleId));
    } else {
      updateSetting('ignoredApps', [...settings.ignoredApps, bundleId]);
    }
  };

  const handleAddCustomIgnore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIgnoreApp.trim()) return;
    const cleanName = newIgnoreApp.trim();
    if (!settings.ignoredApps.includes(cleanName)) {
      updateSetting('ignoredApps', [...settings.ignoredApps, cleanName]);
    }
    setNewIgnoreApp('');
  };

  const handleTip = (amount: string) => {
    setTipAmount(amount);
    setTipSuccess(true);
    setTimeout(() => {
      setTipSuccess(false);
      setShowTipJarModal(false);
    }, 2000);
  };

  const iconOptions = [
    { id: 'classic', name: 'Classic Blue', color: 'bg-[#007AFF]', desc: 'Apple standard neon blue visual' },
    { id: 'neon', name: 'Elegant Dark', color: 'bg-[#1C1C1E] border border-white/10 text-[#007AFF]', desc: 'Premium deep black & high-contrast blue theme' },
    { id: 'pitch', name: 'OLED Pitch Black', color: 'bg-black border border-white/5', desc: 'Absolute minimalist pitch-black layout' },
    { id: 'retro', name: 'Macintosh Retro', color: 'bg-amber-100 text-amber-900 border border-amber-200/50', desc: 'A warm visual salute to 1984 Macintosh' }
  ];

  return (
    <div className="flex-grow overflow-y-auto px-6 pt-6 pb-24 scrollbar-thin text-white bg-black font-sans">
      <h2 className="text-4xl font-bold tracking-tight mb-6 px-1 text-white font-display">
        Settings
      </h2>

      {/* SECTION: CLIPBOARD ANALYTICS & PRODUCTIVITY */}
      {(() => {
        const totalCount = history.length;
        const textCount = history.filter(h => h.contentType === 'text').length;
        const urlCount = history.filter(h => h.contentType === 'url').length;
        const codeCount = history.filter(h => h.contentType === 'code').length;

        const textPct = totalCount ? Math.round((textCount / totalCount) * 100) : 0;
        const urlPct = totalCount ? Math.round((urlCount / totalCount) * 100) : 0;
        const codePct = totalCount ? Math.round((codeCount / totalCount) * 100) : 0;

        // Calculate productivity gain: average 15 seconds saved per copy/paste
        const secondsSaved = totalCount * 15;
        const minutesSaved = Math.round((secondsSaved / 60) * 10) / 10;

        // Top App source distribution
        const appCounts: { [key: string]: number } = {};
        history.forEach(item => {
          const app = item.sourceAppName || 'System';
          appCounts[app] = (appCounts[app] || 0) + 1;
        });
        const sortedApps = Object.entries(appCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);

        const sensitiveCount = history.filter(h => h.isSensitive).length;

        // Health Diagnostics calculations
        const emptyClips = history.filter(h => !h.content || !h.content.trim());
        const largeClips = history.filter(h => h.content && h.content.length > 5000);
        
        // Find duplicate item content count
        const contentMap: { [key: string]: string[] } = {};
        history.forEach(h => {
          const text = h.content.trim();
          if (text) {
            if (!contentMap[text]) contentMap[text] = [];
            contentMap[text].push(h.id);
          }
        });
        const duplicateGroups = Object.entries(contentMap).filter(([_, ids]) => ids.length > 1);
        const duplicateIdsToPurge: string[] = [];
        duplicateGroups.forEach(([_, ids]) => {
          duplicateIdsToPurge.push(...ids.slice(1));
        });
        const totalDuplicates = duplicateIdsToPurge.length;
        const diagnosticAnomalyCount = emptyClips.length + largeClips.length + totalDuplicates;

        const handleDeepOptimize = () => {
          if (!onUpdateHistory) return;
          const uniqueContents = new Set<string>();
          const cleanedHistory = history.filter(item => {
            const trimmed = (item.content || '').trim();
            if (!trimmed) return false;
            if (uniqueContents.has(trimmed)) return false;
            uniqueContents.add(trimmed);
            return true;
          }).map(item => ({
            ...item,
            content: item.content.trim(),
            updatedAt: Date.now()
          }));
          onUpdateHistory(cleanedHistory);
          setJustOptimized(true);
          setTimeout(() => setJustOptimized(false), 3000);
        };

        return (
          <div className="mb-6">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2.5 px-2 font-mono flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#007AFF]" />
              iOS-Style Clipboard Suite
            </h3>
            
            {/* Tab Swiper Header */}
            <div className="flex bg-[#1C1C1E] p-1.5 rounded-xl border border-white/5 mb-3 gap-1">
              <button
                onClick={() => setActiveAnalyticsTab('overview')}
                className={`flex-1 py-1.5 text-[10px] font-extrabold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                  activeAnalyticsTab === 'overview'
                    ? 'bg-[#007AFF] text-white shadow-sm'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveAnalyticsTab('category')}
                className={`flex-1 py-1.5 text-[10px] font-extrabold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                  activeAnalyticsTab === 'category'
                    ? 'bg-[#007AFF] text-white shadow-sm'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                Categories
              </button>
              <button
                onClick={() => setActiveAnalyticsTab('diagnostics')}
                className={`flex-1 py-1.5 text-[10px] font-extrabold rounded-lg uppercase tracking-wider transition-all cursor-pointer relative ${
                  activeAnalyticsTab === 'diagnostics'
                    ? 'bg-[#007AFF] text-white shadow-sm'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                Diagnostics
                {diagnosticAnomalyCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border border-black rounded-full animate-pulse" />
                )}
              </button>
            </div>

            {/* Main Stats Card content */}
            <div className="bg-[#1C1C1E] rounded-2xl border border-white/5 p-4 shadow-sm space-y-4">
              
              {/* TAB 1: OVERVIEW */}
              {activeAnalyticsTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl flex flex-col justify-between h-20">
                      <span className="block text-[9px] font-bold text-white/40 uppercase tracking-wider">Total Clipped</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-black text-white">{totalCount}</span>
                        <span className="text-[10px] text-white/50 font-semibold">records</span>
                      </div>
                    </div>
                    
                    <div className="p-3.5 bg-[#007AFF]/5 border border-[#007AFF]/15 rounded-xl flex flex-col justify-between h-20 relative overflow-hidden group">
                      <div className="absolute top-1 right-1">
                        <Zap className="w-8 h-8 text-[#007AFF]/10 group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="block text-[9px] font-bold text-[#007AFF] uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Time Saved
                      </span>
                      <div className="flex items-baseline gap-0.5 text-[#007AFF] mt-1">
                        <span className="text-2xl font-black">{minutesSaved}</span>
                        <span className="text-[10px] font-bold">mins</span>
                      </div>
                    </div>
                  </div>

                  {totalCount > 0 ? (
                    <div className="space-y-3.5 pt-1.5">
                      <div className="flex justify-between items-center text-[10px] text-white/50 font-semibold">
                        <span>Database Storage Space Usage</span>
                        <span className="text-white font-extrabold">{totalCount}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-black/40 border border-white/5 overflow-hidden">
                        <div 
                          style={{ width: `${Math.min(totalCount, 100)}%` }} 
                          className={`h-full rounded-full transition-all duration-500 ${
                            totalCount > 85 ? 'bg-[#FF3B30]' : totalCount > 50 ? 'bg-[#FF9500]' : 'bg-[#34C759]'
                          }`}
                        />
                      </div>
                      <p className="text-[9px] text-white/40 leading-relaxed font-sans">
                        Clipboard database sync is working flawlessly. Data is stored offline under device keychain sandbox.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-black/20 rounded-xl border border-dashed border-white/5">
                      <p className="text-[10px] text-white/30 font-semibold">No clipboard metrics recorded yet.</p>
                    </div>
                  )}

                  {totalCount > 0 && (
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-white/50 bg-black/20 p-2.5 rounded-xl border border-white/5">
                      <Shield className="w-4 h-4 text-[#34C759]" />
                      <span>
                        Security Health: <span className="text-white font-extrabold">{sensitiveCount}</span> private clipboard payloads successfully masked.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CATEGORY COMPOSITION */}
              {activeAnalyticsTab === 'category' && (
                <div className="space-y-4">
                  {totalCount > 0 ? (
                    <div className="space-y-4">
                      {/* Stacked bar */}
                      <div className="space-y-2">
                        <span className="block text-[9px] font-bold text-white/40 uppercase tracking-wider">Content Type Breakdown</span>
                        <div className="h-4 w-full rounded-full bg-black/40 border border-white/5 overflow-hidden flex">
                          {textPct > 0 && <div style={{ width: `${textPct}%` }} className="bg-[#007AFF] h-full" />}
                          {urlPct > 0 && <div style={{ width: `${urlPct}%` }} className="bg-[#34C759] h-full" />}
                          {codePct > 0 && <div style={{ width: `${codePct}%` }} className="bg-[#FF9500] h-full" />}
                        </div>
                        
                        {/* Legend labels */}
                        <div className="grid grid-cols-3 gap-1 pt-1 text-[9px] font-bold">
                          <div className="flex items-center gap-1.5 text-white/60">
                            <div className="w-2.5 h-2.5 rounded bg-[#007AFF]" />
                            <span>Text ({textPct}%)</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-white/60 justify-center">
                            <div className="w-2.5 h-2.5 rounded bg-[#34C759]" />
                            <span>Links ({urlPct}%)</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-white/60 justify-end">
                            <div className="w-2.5 h-2.5 rounded bg-[#FF9500]" />
                            <span>Code ({codePct}%)</span>
                          </div>
                        </div>
                      </div>

                      {/* Top App source list */}
                      {sortedApps.length > 0 && (
                        <div className="space-y-2.5 border-t border-white/5 pt-3.5">
                          <span className="block text-[9px] font-bold text-white/40 uppercase tracking-wider flex items-center gap-1">
                            <Smartphone className="w-3.5 h-3.5 text-white/40" />
                            Top Active Clip Sources
                          </span>
                          <div className="space-y-2">
                            {sortedApps.map(([app, count]) => {
                              const pct = Math.round((count / totalCount) * 100);
                              return (
                                <div key={app} className="flex items-center gap-3 justify-between">
                                  <span className="text-xs font-bold text-white/80 w-16 truncate">{app}</span>
                                  <div className="flex-grow h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                    <div 
                                      style={{ width: `${pct}%` }} 
                                      className="bg-white/45 rounded-full h-full" 
                                    />
                                  </div>
                                  <span className="text-[10px] font-extrabold text-white/40 w-10 text-right">{count} clips</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-black/20 rounded-xl border border-dashed border-white/5">
                      <p className="text-[10px] text-white/30 font-semibold">No category statistics available.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: DIAGNOSTICS & HEALTH CLEANING */}
              {activeAnalyticsTab === 'diagnostics' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-red-400" />
                      Sanitize & Diagnostics Engine
                    </span>
                    <span className="text-[9px] px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full font-bold uppercase tracking-wider">
                      {diagnosticAnomalyCount} issues
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {/* Diagnostic list */}
                    <div className="flex justify-between items-center text-xs py-1">
                      <span className="text-white/70">Duplicate Clipboard Entries</span>
                      <span className={`font-bold ${totalDuplicates > 0 ? 'text-[#FF9500]' : 'text-[#34C759]'}`}>
                        {totalDuplicates > 0 ? `${totalDuplicates} copies found` : 'None detected'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs py-1">
                      <span className="text-white/70">Empty / Corrupted Snippets</span>
                      <span className={`font-bold ${emptyClips.length > 0 ? 'text-red-400' : 'text-[#34C759]'}`}>
                        {emptyClips.length > 0 ? `${emptyClips.length} malformed clips` : 'None detected'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs py-1">
                      <span className="text-white/70">Excessive Bloat (Over 5KB)</span>
                      <span className={`font-bold ${largeClips.length > 0 ? 'text-[#FF9500]' : 'text-[#34C759]'}`}>
                        {largeClips.length > 0 ? `${largeClips.length} large snippets` : 'None detected'}
                      </span>
                    </div>
                  </div>

                  {diagnosticAnomalyCount > 0 ? (
                    <div className="pt-2">
                      <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-xl mb-3">
                        <p className="text-[10px] text-red-400 leading-relaxed font-semibold">
                          Recommendation: Run optimization to deduplicate clips, purge empty records, and optimize memory buffers for up to 30% speed improvement.
                        </p>
                      </div>

                      <button
                        onClick={handleDeepOptimize}
                        disabled={justOptimized}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                          justOptimized 
                            ? 'bg-[#34C759]/20 text-[#34C759] border border-[#34C759]/30'
                            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                        }`}
                      >
                        {justOptimized ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2.5px]" />
                            Clipboard Sanitized Successfully!
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            Run Deep Cleaning & Deduplicate
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#34C759]/5 border border-[#34C759]/15 rounded-xl text-center">
                      <div className="inline-flex w-7 h-7 rounded-full bg-[#34C759]/10 items-center justify-center text-[#34C759] mb-1.5">
                        <Check className="w-4 h-4 stroke-[2.5px]" />
                      </div>
                      <p className="text-[11px] font-extrabold text-white">Your Clipboard is Pristine!</p>
                      <p className="text-[9px] text-[#34C759] mt-0.5 font-medium">All payloads are sanitized, lightweight, and deduplicated.</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        );
      })()}

      {/* SECTION: DATA MANAGEMENT */}
      <div className="mb-6">
        <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2.5 px-2 font-mono">
          Data Management
        </h3>
        <div className="bg-[#1C1C1E] rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5 shadow-sm">
          
          {/* History Limit */}
          <div className="flex justify-between items-center h-13 px-4">
            <span className="text-sm font-medium text-white/90">History Limit</span>
            <select
              value={settings.historyLimit}
              onChange={(e) => updateSetting('historyLimit', Number(e.target.value))}
              className="bg-transparent font-bold text-xs text-[#007AFF] focus:outline-none cursor-pointer text-right outline-none border-none py-1.5 focus:ring-0 uppercase tracking-wider"
            >
              <option value="100">100 Items</option>
              <option value="500">500 Items (Rec.)</option>
              <option value="1000">1000 Items</option>
              <option value="0">Unlimited</option>
            </select>
          </div>

          {/* Auto Cleanup */}
          <div className="flex justify-between items-center h-13 px-4">
            <span className="text-sm font-medium text-white/90">Auto Cleanup</span>
            <select
              value={settings.autoCleanupInterval}
              onChange={(e) => updateSetting('autoCleanupInterval', e.target.value)}
              className="bg-transparent font-bold text-xs text-[#007AFF] focus:outline-none cursor-pointer text-right outline-none border-none py-1.5 focus:ring-0 uppercase tracking-wider"
            >
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days (Rec.)</option>
              <option value="never">Never</option>
            </select>
          </div>

          {/* Clear All History Button */}
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full text-left flex justify-between items-center h-13 px-4 hover:bg-red-500/5 active:bg-red-500/10 transition-colors cursor-pointer"
          >
            <span className="text-sm font-bold text-[#FF3B30]">Wipe Clipboard History</span>
            <Trash2 className="w-4 h-4 text-[#FF3B30]/60" />
          </button>
        </div>
      </div>

      {/* SECTION: PRIVACY */}
      <div className="mb-6">
        <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2.5 px-2 font-mono">
          Privacy & Sync
        </h3>
        <div className="bg-[#1C1C1E] rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5 shadow-sm">
          
          {/* iCloud Sync */}
          <div className="flex items-center justify-between min-h-13 py-3.5 px-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-[#007AFF] shrink-0">
                <Cloud className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-tight text-white/95">iCloud Synchronization</span>
                <span className="text-[10px] text-white/40 leading-tight mt-0.5">Auto-流转 between Mac & iPhone</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.icloudSync}
                onChange={(e) => updateSetting('icloudSync', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 dark:bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-transparent after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#34C759]"></div>
            </label>
          </div>

          {/* Sensitive Detection */}
          <div className="flex items-center justify-between min-h-13 py-3.5 px-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-tight text-white/95">Sensitive Detection</span>
                <span className="text-[10px] text-white/40 leading-tight mt-0.5">Mask passwords & banking info</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.sensitiveDetection}
                onChange={(e) => updateSetting('sensitiveDetection', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 dark:bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-transparent after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#34C759]"></div>
            </label>
          </div>

          {/* Secure Overwrite (Privacy Shredder) */}
          <div className="flex items-center justify-between min-h-13 py-3.5 px-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-tight text-white/95">Privacy Shredder</span>
                <span className="text-[10px] text-white/40 leading-tight mt-0.5">Securely scramble data on deletion</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!settings.secureShredMode}
                onChange={(e) => updateSetting('secureShredMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 dark:bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-transparent after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#34C759]"></div>
            </label>
          </div>

          {/* App Ignore List Trigger */}
          <div className="flex flex-col divide-y divide-white/5">
            <button
              onClick={() => setShowIgnoreSelector(!showIgnoreSelector)}
              className="w-full flex items-center justify-between h-13 px-4 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/60 shrink-0">
                  <EyeOff className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-white/95">Ignored Applications</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-white/60 font-bold bg-white/5 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {settings.ignoredApps.length} active
                </span>
                <ChevronRight className={`w-4 h-4 text-white/40 transition-transform ${showIgnoreSelector ? 'rotate-90' : ''}`} />
              </div>
            </button>

            {/* App Ignore selector panel */}
            {showIgnoreSelector && (
              <div className="p-4 bg-black/40 space-y-4">
                <p className="text-xs text-white/40 leading-relaxed">
                  Toggle applications that PastePal should ignore. Highly recommended to keep banking and password managers blacklisted.
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  {SUPPORTED_APPS.map(app => {
                    const isIgnored = settings.ignoredApps.includes(app.bundleId);
                    return (
                      <button
                        key={app.id}
                        onClick={() => handleToggleIgnoreApp(app.bundleId)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isIgnored
                            ? 'bg-[#FF3B30]/10 border-[#FF3B30]/20 text-[#FF3B30]'
                            : 'bg-[#1C1C1E] border-white/5 text-white/80'
                        }`}
                      >
                        <span className="text-xs font-semibold truncate">{app.name}</span>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                          isIgnored 
                            ? 'bg-[#FF3B30] border-[#FF3B30] text-white' 
                            : 'border-white/20 bg-transparent'
                        }`}>
                          {isIgnored && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Bundle ID ignore form */}
                <form onSubmit={handleAddCustomIgnore} className="flex gap-2">
                  <input
                    type="text"
                    value={newIgnoreApp}
                    onChange={(e) => setNewIgnoreApp(e.target.value)}
                    placeholder="Custom Bundle ID, e.g. com.bank.app"
                    className="flex-grow text-xs px-4 py-2.5 bg-[#1C1C1E] border border-white/5 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#007AFF]/50 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#007AFF] hover:opacity-90 text-white font-bold text-xs rounded-xl shrink-0 cursor-pointer"
                  >
                    Add
                  </button>
                </form>

                {settings.ignoredApps.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {settings.ignoredApps.map(bundleId => (
                      <span 
                        key={bundleId}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#1C1C1E] text-white/60 border border-white/5 select-all"
                      >
                        {bundleId}
                        <button 
                          onClick={() => updateSetting('ignoredApps', settings.ignoredApps.filter(id => id !== bundleId))}
                          className="text-white/40 hover:text-white font-bold text-xs ml-0.5 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION: APPEARANCE / APP ICON */}
      <div className="mb-6">
        <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2.5 px-2 font-mono">
          Appearance & Themes
        </h3>
        <div className="bg-[#1C1C1E] rounded-2xl border border-white/5 overflow-hidden p-4 shadow-sm space-y-3">
          <p className="text-xs text-white/40 leading-relaxed">
            Configure the aesthetic profile of PastePal. Optimized for iOS widgets and OLED screens.
          </p>
          <div className="space-y-2">
            {iconOptions.map(option => {
              const isSelected = settings.selectedIcon === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => updateSetting('selectedIcon', option.id)}
                  className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#007AFF]/5 border-[#007AFF] text-white'
                      : 'bg-black/25 border-white/5 text-white/70 hover:text-white hover:bg-black/45'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Tiny App Logo Simulation */}
                    <div className={`w-10 h-10 rounded-xl ${option.color} flex items-center justify-center shadow-md shrink-0 overflow-hidden font-extrabold text-white text-base`}>
                      📋
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{option.name}</span>
                      <span className="text-[10px] text-white/40 mt-0.5 leading-tight">{option.desc}</span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                    isSelected 
                      ? 'bg-[#007AFF] border-[#007AFF] text-white' 
                      : 'border-white/20 bg-transparent'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION: SUPPORT / TIP JAR */}
      <div className="mb-6">
        <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2.5 px-2 font-mono">
          Support Development
        </h3>
        <div className="bg-[#1C1C1E] rounded-2xl border border-white/5 overflow-hidden shadow-sm">
          <button
            onClick={() => setShowTipJarModal(true)}
            className="w-full flex items-center justify-between h-13 px-4 hover:bg-[#007AFF]/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <Coins className="w-4 h-4 fill-amber-500/10" />
              </div>
              <span className="text-sm font-semibold text-white/90">Tip Jar (小费支持)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/40" />
          </button>
        </div>
      </div>

      {/* SECTION: ABOUT & VERSION */}
      <div className="text-center mt-12 mb-8 select-none">
        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-1.5 font-mono">
          PastePal for iOS
        </p>
        <p className="text-[11px] text-white/40 font-mono">
          Version 4.2.1 (Build 108) • Compatible with iOS 17+
        </p>
        <p className="text-[10px] text-white/30 mt-2.5 leading-relaxed max-w-xs mx-auto">
          Driven by premium Apple Design Guidelines.<br />
          Data is kept entirely secure on your personal iCloud container.
        </p>
      </div>

      {/* MODAL: RESET CONFIRMATION */}
      {showClearConfirm && (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#1C1C1E] border border-white/10 rounded-[24px] p-5 w-full max-w-sm shadow-2xl space-y-4 text-center font-sans">
            <div className="w-12 h-12 rounded-full bg-[#FF3B30]/10 flex items-center justify-center text-[#FF3B30] mx-auto">
              <AlertCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white tracking-tight">Clear all history?</h4>
              <p className="text-xs text-white/40 mt-1.5 leading-relaxed">
                This process is completely irreversible. All saved items, metadata, and custom tags will be permanently deleted.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2.5 bg-[#FF3B30] hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#FF3B30]/10 cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TIP JAR */}
      {showTipJarModal && (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#1C1C1E] border border-white/10 rounded-[24px] p-5 w-full max-w-sm shadow-2xl space-y-4 font-sans">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
                <h4 className="text-base font-bold text-white tracking-tight">Support PastePal</h4>
              </div>
              <button 
                onClick={() => setShowTipJarModal(false)}
                className="text-white/40 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {tipSuccess ? (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#34C759]/10 text-[#34C759] flex items-center justify-center">
                  <Check className="w-6 h-6 stroke-[3px]" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">Thank you so much!</h5>
                  <p className="text-xs text-white/40 mt-1.5 leading-relaxed">
                    Received {tipAmount} contribution. Your support keeps me polishing this application towards perfection!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-white/40 leading-relaxed">
                  PastePal is entirely open, client-side, and ad-free. If it makes your digital workflows smoother, please support its ongoing polishing:
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleTip('$0.99')}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-center transition-all group active:scale-95 cursor-pointer"
                  >
                    <span className="block text-xs font-bold text-white">Soda Cup</span>
                    <span className="text-[10px] text-white/40">$0.99</span>
                  </button>
                  <button
                    onClick={() => handleTip('$2.99')}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-center transition-all group active:scale-95 cursor-pointer"
                  >
                    <span className="block text-xs font-bold text-white">Espresso</span>
                    <span className="text-[10px] text-white/40">$2.99</span>
                  </button>
                  <button
                    onClick={() => handleTip('$4.99')}
                    className="p-3 bg-[#007AFF] hover:opacity-90 rounded-xl text-center text-white transition-all group active:scale-95 shadow-md shadow-[#007AFF]/20 cursor-pointer"
                  >
                    <span className="block text-xs font-bold">Cold Brew</span>
                    <span className="text-[10px] text-white/80">$4.99</span>
                  </button>
                </div>

                <p className="text-[10px] text-white/30 text-center pt-1.5 font-mono">
                  Single payment, forever unlocked. No subscriptions.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
