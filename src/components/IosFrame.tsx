/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal, Plus, Sparkles, Clipboard, Check, ChevronDown } from 'lucide-react';
import { SUPPORTED_APPS } from '../types';

interface IosFrameProps {
  children: React.ReactNode;
  activeApp: string;
  onSimulateCopy: (content: string, sourceAppName: string, sourceAppBundleId: string) => void;
}

export default function IosFrame({ children, onSimulateCopy }: IosFrameProps) {
  const [time, setTime] = useState('');
  const [simText, setSimText] = useState('');
  const [selectedAppIdx, setSelectedAppIdx] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      setTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simText.trim()) return;

    const app = SUPPORTED_APPS[selectedAppIdx];
    onSimulateCopy(simText, app.name, app.bundleId);
    
    // UI feedback
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    setSimText('');
  };

  const loadPreset = (presetText: string) => {
    setSimText(presetText);
  };

  const presets = [
    { text: 'https://github.com/apple/swiftdata-examples', label: 'GitHub Link', appIdx: 4 },
    { text: 'func syncClip() {\n  let items = UIPasteboard.general.items\n}', label: 'Swift Code', appIdx: 2 },
    { text: 'My Super Secret Password P@ssword9988!', label: 'Sensitive Pwd', appIdx: 6 },
    { text: 'Did you check the new specs for the iOS 18 widgets?', label: 'Slack Chat', appIdx: 5 },
    { text: 'Apple Developer Account Verification Code: 488-291', label: '2FA Code', appIdx: 7 }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row items-center justify-center p-0 md:p-6 text-white overflow-hidden font-sans">
      {/* Decorative desktop backgrounds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-amber-500 rounded-full blur-[150px]"></div>
      </div>

      {/* Simulator Control Panel (Desktop left / top) */}
      <div className="w-full md:w-80 bg-slate-900/90 border border-slate-800/80 backdrop-blur-md rounded-2xl p-4 md:mr-6 z-10 shadow-2xl flex flex-col shrink-0 self-stretch md:self-auto mb-4 md:mb-0">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-sm tracking-tight text-slate-100">iOS Clipboard Copier</h3>
          </div>
          <button 
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className="md:hidden text-xs text-blue-400 font-medium flex items-center gap-1"
          >
            {isPanelOpen ? 'Hide Sim' : 'Show Sim'}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isPanelOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className={`space-y-4 ${isPanelOpen ? 'block' : 'hidden md:block'}`}>
          <p className="text-xs text-slate-400 leading-relaxed">
            Since browsers cannot monitor iOS background copy events directly, use this simulator panel to copy text from other apps to test PastePal!
          </p>

          <form onSubmit={handleSimulate} className="space-y-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Source App
              </label>
              <div className="grid grid-cols-4 gap-1">
                {SUPPORTED_APPS.map((app, idx) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelectedAppIdx(idx)}
                    className={`p-1.5 rounded-lg flex flex-col items-center justify-center gap-1 border transition-all ${
                      selectedAppIdx === idx
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-[10px] font-medium truncate w-full text-center">{app.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Text content to copy
              </label>
              <textarea
                value={simText}
                onChange={(e) => setSimText(e.target.value)}
                placeholder="Type anything or use a preset below..."
                rows={3}
                className="w-full text-xs p-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={!simText.trim()}
              className={`w-full py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                simText.trim()
                  ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-lg shadow-blue-900/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 animate-bounce" />
                  Copied in Background!
                </>
              ) : (
                <>
                  <Clipboard className="w-4 h-4" />
                  Trigger Copy Event
                </>
              )}
            </button>
          </form>

          {/* Presets */}
          <div className="border-t border-slate-800 pt-3">
            <h4 className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
              Presets to Test Features
            </h4>
            <div className="space-y-1">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    loadPreset(preset.text);
                    setSelectedAppIdx(preset.appIdx);
                  }}
                  className="w-full text-left p-1.5 rounded bg-slate-800/40 hover:bg-slate-800 text-slate-300 text-[11px] font-mono truncate border border-transparent hover:border-slate-700/50 block"
                >
                  <span className="text-amber-400 font-sans font-semibold mr-1">[{preset.label}]</span>
                  {preset.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main iPhone Frame */}
      <div className="relative w-full md:w-[412px] h-[100vh] md:h-[860px] bg-black md:rounded-[56px] md:border-[12px] md:border-zinc-800 md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden z-10 flex flex-col">
        {/* Notch/Dynamic Island for iPhone layout (only visible on desktop wrapper) */}
        <div className="hidden md:block absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-50 flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full ml-auto mr-4"></div>
        </div>

        {/* Status Bar */}
        <div className="flex-shrink-0 h-11 px-6 flex items-center justify-between text-xs font-semibold select-none bg-black text-white transition-colors z-40">
          <span className="text-[13px] tracking-tight">{time}</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5 text-white" />
            <span className="text-[10px] font-bold text-white">5G</span>
            <Wifi className="w-3.5 h-3.5 text-white" />
            <Battery className="w-4 h-4 ml-0.5 text-white" />
          </div>
        </div>

        {/* Screen Content Container */}
        <div className="flex-grow overflow-hidden relative flex flex-col bg-black text-white transition-colors">
          {children}
        </div>

        {/* iOS Home Indicator */}
        <div className="flex-shrink-0 h-6 bg-black flex items-center justify-center select-none z-40">
          <div className="w-32 h-1 bg-white/40 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
