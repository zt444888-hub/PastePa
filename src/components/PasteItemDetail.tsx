/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, Copy, Star, Key, Trash2, Calendar, HardDrive, 
  ExternalLink, Code, Terminal, FileText, Check, AlertTriangle, Sparkles, Wand2,
  QrCode, BookOpen, Type, Share2, ChevronRight
} from 'lucide-react';
import { PasteItem } from '../types';

interface PasteItemDetailProps {
  item: PasteItem;
  onClose: () => void;
  onCopy: (item: PasteItem) => void;
  onToggleFavorite: (id: string) => void;
  onToggleSensitive: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateTags: (id: string, tags: string[]) => void;
  onUpdateContent?: (id: string, newContent: string) => void;
}

export default function PasteItemDetail({
  item,
  onClose,
  onCopy,
  onToggleFavorite,
  onToggleSensitive,
  onDelete,
  onUpdateTags,
  onUpdateContent
}: PasteItemDetailProps) {
  const [copiedText, setCopiedText] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [isReaderMode, setIsReaderMode] = useState(false);
  const [readerFontSize, setReaderFontSize] = useState<number>(14); // in px
  const [readerFontFamily, setReaderFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);

  let isJson = false;
  let parsedJson: any = null;
  try {
    const trimmed = item.content.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      parsedJson = JSON.parse(trimmed);
      isJson = true;
    }
  } catch (_) {}

  const [viewMode, setViewMode] = useState<'text' | 'json'>(isJson ? 'json' : 'text');

  const characterCount = item.content.length;
  const wordCount = item.content.trim().split(/\s+/).filter(Boolean).length;
  const lineCount = item.content.split('\n').length;
  const paragraphCount = item.content.split(/\n\s*\n/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));
  const speakingTime = Math.max(1, Math.round(wordCount / 130));
  
  const formattedDate = new Date(item.createdAt).toLocaleString('zh-CN', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const handleCopyBack = () => {
    onCopy(item);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 1500);
  };

  const handleDeleteClick = () => {
    onDelete(item.id);
    onClose();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        text: item.content
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(item.content);
      alert('已复制纯文本至剪贴板，可前往其他应用粘贴分享！');
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end justify-center">
      {/* Tap out background to close */}
      <div className="absolute inset-0 z-10" onClick={onClose}></div>

      {/* Slide Up Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 350 }}
        className="w-full bg-[#121212] rounded-t-[28px] border-t border-white/10 p-6 z-20 shadow-2xl max-h-[85%] flex flex-col font-sans"
      >
        {/* Drag handle */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4 shrink-0"></div>

        {/* Sheet Header */}
        <div className="flex justify-between items-center mb-4 shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">
              {item.contentType.toUpperCase()} DETAILS
            </span>
            <h3 className="text-lg font-bold text-white tracking-tight font-display">
              {item.sourceAppName || 'System Clipboard'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reader Mode & Preview Selection Headers */}
        <div className="flex justify-between items-center mb-2 px-1">
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider font-mono">
            {isJson && viewMode === 'json' ? 'JSON Structure' : 'Content Preview'}
          </span>
          <div className="flex gap-1.5 items-center">
            {isJson && (
              <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/5">
                <button
                  onClick={() => setViewMode('json')}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${viewMode === 'json' ? 'bg-[#34C759] text-white shadow-sm font-semibold' : 'text-white/50 hover:text-white'}`}
                >
                  JSON Tree
                </button>
                <button
                  onClick={() => {
                    setViewMode('text');
                    setIsReaderMode(false);
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${viewMode === 'text' && !isReaderMode ? 'bg-[#007AFF] text-white shadow-sm font-semibold' : 'text-white/50 hover:text-white'}`}
                >
                  Text
                </button>
              </div>
            )}
            
            {(!isJson || viewMode === 'text') && (
              <div className="flex gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
                <button
                  onClick={() => {
                    setViewMode('text');
                    setIsReaderMode(false);
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${!isReaderMode ? 'bg-[#007AFF] text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
                >
                  Raw
                </button>
                <button
                  onClick={() => {
                    setViewMode('text');
                    setIsReaderMode(true);
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${isReaderMode ? 'bg-[#007AFF] text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Reader
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Text Scroll Area */}
        <div className="flex-grow overflow-y-auto mb-6 scrollbar-thin">
          {isJson && viewMode === 'json' ? (
            <div className="p-4 bg-black/40 rounded-2xl border border-white/5 max-h-72 overflow-y-auto scrollbar-thin space-y-1">
              <JsonTreeItem label="root" value={parsedJson} isLast={true} depth={0} />
            </div>
          ) : isReaderMode ? (
            <div className="p-4 bg-[#1C1C1E] rounded-2xl border border-white/5 flex flex-col gap-3">
              {/* Reader Controls Toolbar */}
              <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-1">
                <div className="flex gap-1.5 items-center">
                  <Type className="w-3.5 h-3.5 text-white/40" />
                  <button 
                    onClick={() => setReaderFontFamily('sans')}
                    className={`px-2 py-0.5 text-[9px] font-bold rounded ${readerFontFamily === 'sans' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}
                  >
                    Sans
                  </button>
                  <button 
                    onClick={() => setReaderFontFamily('serif')}
                    className={`px-2 py-0.5 text-[9px] font-bold rounded ${readerFontFamily === 'serif' ? 'bg-white/10 text-white font-serif' : 'text-white/40 hover:text-white/60'}`}
                  >
                    Serif
                  </button>
                  <button 
                    onClick={() => setReaderFontFamily('mono')}
                    className={`px-2 py-0.5 text-[9px] font-bold rounded ${readerFontFamily === 'mono' ? 'bg-white/10 text-white font-mono' : 'text-white/40 hover:text-white/60'}`}
                  >
                    Mono
                  </button>
                </div>
                
                <div className="flex gap-2 items-center">
                  <button 
                    onClick={() => setReaderFontSize(prev => Math.max(11, prev - 1))}
                    className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs text-white/70 font-bold active:scale-95 cursor-pointer"
                    title="Decrease Font Size"
                  >
                    A-
                  </button>
                  <span className="text-[10px] text-white/50 font-mono font-bold">{readerFontSize}px</span>
                  <button 
                    onClick={() => setReaderFontSize(prev => Math.min(24, prev + 1))}
                    className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs text-white/70 font-bold active:scale-95 cursor-pointer"
                    title="Increase Font Size"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* Reader Content Area with Custom Typography */}
              <div 
                style={{ 
                  fontSize: `${readerFontSize}px`, 
                  lineHeight: '1.625',
                }}
                className={`text-white/95 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto scrollbar-thin py-1 select-text ${
                  readerFontFamily === 'serif' ? 'font-serif tracking-normal text-zinc-200' :
                  readerFontFamily === 'mono' ? 'font-mono tracking-tight text-emerald-400/90' :
                  'font-sans tracking-wide text-zinc-100'
                }`}
              >
                {item.content}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-black/40 rounded-2xl border border-white/5 font-mono text-[13px] text-zinc-100 whitespace-pre-wrap select-text leading-relaxed select-all">
              {item.content}
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="p-3 bg-[#1C1C1E] border border-white/5 rounded-xl text-center">
              <span className="block text-[9px] font-bold text-white/40 uppercase tracking-wider">Chars</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{characterCount}</span>
            </div>
            <div className="p-3 bg-[#1C1C1E] border border-white/5 rounded-xl text-center">
              <span className="block text-[9px] font-bold text-white/40 uppercase tracking-wider">Words</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{wordCount}</span>
            </div>
            <div className="p-3 bg-[#1C1C1E] border border-white/5 rounded-xl text-center">
              <span className="block text-[9px] font-bold text-white/40 uppercase tracking-wider">Lines / Paras</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{lineCount} / {paragraphCount}</span>
            </div>
          </div>

          <div className="flex gap-2.5 mt-2 justify-between px-1 text-[10px] text-white/40 font-semibold font-mono">
            <span>📖 Reading Time: <strong className="text-white/70">{readingTime} min{readingTime > 1 ? 's' : ''}</strong></span>
            <span>🎙️ Speaking Time: <strong className="text-white/70">{speakingTime} min{speakingTime > 1 ? 's' : ''}</strong></span>
          </div>

          {/* Smart Actions Section */}
          {(() => {
            const emailMatch = item.content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
            const phoneMatch = item.content.match(/(?:\+?86)?\s?1[3-9]\d{9}\b|\b\d{3}-\d{3}-\d{4}\b/);
            const codeMatch = item.content.match(/\b\d{4,8}\b/);
            const isUrl = item.contentType === 'url' || item.content.startsWith('http://') || item.content.startsWith('https://');
            const showSmartActions = emailMatch || phoneMatch || isUrl || codeMatch;

            if (!showSmartActions) return null;

            return (
              <div className="mt-5 space-y-2">
                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-1.5 font-sans">
                  Smart Actions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {isUrl && (
                    <button
                      onClick={() => window.open(item.content.startsWith('http') ? item.content : `https://${item.content}`, '_blank')}
                      className="px-3 py-1.5 bg-[#007AFF]/10 border border-[#007AFF]/20 text-[#007AFF] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors hover:bg-[#007AFF]/20 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Link
                    </button>
                  )}
                  {emailMatch && (
                    <button
                      onClick={() => window.open(`mailto:${emailMatch[0]}`, '_self')}
                      className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors hover:bg-emerald-500/20 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Draft Email
                    </button>
                  )}
                  {phoneMatch && (
                    <button
                      onClick={() => window.open(`tel:${phoneMatch[0]}`, '_self')}
                      className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors hover:bg-purple-500/20 cursor-pointer"
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                      Call Number
                    </button>
                  )}
                  {codeMatch && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(codeMatch[0]);
                        alert(`Copied authentication code: ${codeMatch[0]}`);
                      }}
                      className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors hover:bg-amber-500/20 cursor-pointer"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      Copy OTP: {codeMatch[0]}
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* QR Code Cross-Device Sync Widget (Slick interactive iOS bridge) */}
          <div className="mt-5 space-y-3">
            <button
              onClick={() => {
                setShowQrCode(!showQrCode);
                if (!showQrCode) setQrLoaded(false);
              }}
              className="w-full p-3.5 bg-[#1C1C1E] hover:bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <QrCode className="w-4 h-4 text-[#007AFF]" />
                <div className="text-left">
                  <span className="block text-white/95">Scan-to-Copy (手机扫码传图文)</span>
                  <span className="block text-[10px] text-white/40 font-normal">Generate QR code to scan text instantly onto mobile devices</span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 text-white/30 transition-transform ${showQrCode ? 'rotate-90' : ''}`} />
            </button>
            
            {showQrCode && (
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex flex-col items-center text-center space-y-3">
                <div className="relative w-40 h-40 bg-white p-2.5 rounded-2xl flex items-center justify-center shadow-lg">
                  {!qrLoaded && (
                    <div className="absolute inset-0 bg-white rounded-2xl flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-zinc-300 border-t-[#007AFF] rounded-full animate-spin"></div>
                    </div>
                  )}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(item.content)}`}
                    alt="Scan to copy clipboard text"
                    referrerPolicy="no-referrer"
                    onLoad={() => setQrLoaded(true)}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1">
                  <span className="block text-xs font-bold text-white/80">Cross-Device Magic Bridge</span>
                  <p className="text-[10px] text-white/45 max-w-[240px] leading-relaxed mx-auto">
                    Point your iPhone, iPad, or Android camera to this code to instantly read, copy, or open this text on your mobile device!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Color Developer Kit */}
          {(() => {
            const colorStr = item.content.trim();
            const isHex = /^#([A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(colorStr);
            const isRgb = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)$/i.test(colorStr);
            const isHsl = /^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(?:,\s*[\d.]+\s*)?\)$/i.test(colorStr);
            const isColor = isHex || isRgb || isHsl;

            if (!isColor) return null;

            // Parse hex or rgb color values
            let r = 0, g = 0, b = 0, a = "1.00";
            if (isHex) {
              let hex = colorStr.substring(1);
              if (hex.length === 3 || hex.length === 4) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + (hex[3] ? hex[3] + hex[3] : '');
              }
              r = parseInt(hex.substring(0, 2), 16) || 0;
              g = parseInt(hex.substring(2, 4), 16) || 0;
              b = parseInt(hex.substring(4, 6), 16) || 0;
              a = hex.length === 8 ? (parseInt(hex.substring(6, 8), 16) / 255).toFixed(2) : "1.00";
            } else if (isRgb) {
              const matches = colorStr.match(/\d+(\.\d+)?/g);
              if (matches) {
                r = parseInt(matches[0]) || 0;
                g = parseInt(matches[1]) || 0;
                b = parseInt(matches[2]) || 0;
                a = matches[3] ? parseFloat(matches[3]).toFixed(2) : "1.00";
              }
            }

            const copyFormat = (formatStr: string, label: string) => {
              navigator.clipboard.writeText(formatStr);
              alert(`已复制 ${label}: ${formatStr}`);
            };

            const swiftColor = `Color(red: ${(r/255).toFixed(2)}, green: ${(g/255).toFixed(2)}, blue: ${(b/255).toFixed(2)}, opacity: ${a})`;
            const composeColor = `Color(0xFF${r.toString(16).padStart(2, '0').toUpperCase()}${g.toString(16).padStart(2, '0').toUpperCase()}${b.toString(16).padStart(2, '0').toUpperCase()})`;
            const cssColor = `color: ${colorStr};`;
            const rgbString = `rgb(${r}, ${g}, ${b})`;

            return (
              <div className="mt-5 space-y-3">
                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-1.5 font-sans flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorStr }} />
                  Designer & Color Toolkit
                </h4>
                <div className="bg-black/30 border border-white/5 p-3 rounded-2xl flex gap-4 items-center">
                  <div 
                    className="w-12 h-12 rounded-xl border border-white/15 shadow-inner shrink-0" 
                    style={{ backgroundColor: colorStr }}
                  />
                  <div className="flex-grow space-y-1 min-w-0">
                    <span className="block text-[11px] font-extrabold text-white/80 uppercase truncate">{colorStr}</span>
                    <span className="block text-[9px] text-white/40 font-mono">RGB: {r}, {g}, {b} · Alpha: {a}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button 
                    onClick={() => copyFormat(swiftColor, 'SwiftUI Color')}
                    className="p-2 bg-[#1C1C1E] border border-white/5 hover:border-[#007AFF]/30 text-left rounded-lg text-[10px] font-bold text-white/90 flex flex-col justify-between h-11 cursor-pointer transition-all"
                  >
                    <span>SwiftUI Code</span>
                    <span className="text-[8px] text-white/30 truncate w-full font-mono">{swiftColor}</span>
                  </button>
                  <button 
                    onClick={() => copyFormat(composeColor, 'Jetpack Compose Color')}
                    className="p-2 bg-[#1C1C1E] border border-white/5 hover:border-[#007AFF]/30 text-left rounded-lg text-[10px] font-bold text-white/90 flex flex-col justify-between h-11 cursor-pointer transition-all"
                  >
                    <span>Compose Code</span>
                    <span className="text-[8px] text-white/30 truncate w-full font-mono">{composeColor}</span>
                  </button>
                  <button 
                    onClick={() => copyFormat(cssColor, 'CSS Property')}
                    className="p-2 bg-[#1C1C1E] border border-white/5 hover:border-[#007AFF]/30 text-left rounded-lg text-[10px] font-bold text-white/90 flex flex-col justify-between h-11 cursor-pointer transition-all"
                  >
                    <span>CSS Property</span>
                    <span className="text-[8px] text-white/30 truncate w-full font-mono">{cssColor}</span>
                  </button>
                  <button 
                    onClick={() => copyFormat(rgbString, 'RGB Values')}
                    className="p-2 bg-[#1C1C1E] border border-white/5 hover:border-[#007AFF]/30 text-left rounded-lg text-[10px] font-bold text-white/90 flex flex-col justify-between h-11 cursor-pointer transition-all"
                  >
                    <span>RGB Values</span>
                    <span className="text-[8px] text-white/30 truncate w-full font-mono">{rgbString}</span>
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Tags & Classifications */}
          <div className="mt-5 space-y-3">
            <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-1.5 font-sans">
              Tags & Classifications
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(item.tags || []).map(t => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1C1C1E] text-white/80 border border-white/5"
                >
                  #{t}
                  <button
                    onClick={() => onUpdateTags(item.id, (item.tags || []).filter(tag => tag !== t))}
                    className="text-white/40 hover:text-white font-bold ml-1 text-xs cursor-pointer"
                    title="Remove Tag"
                  >
                    ×
                  </button>
                </span>
              ))}
              {(!item.tags || item.tags.length === 0) && (
                <span className="text-xs text-white/30 italic">No tags associated</span>
              )}
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!tagInput.trim()) return;
                const cleanTag = tagInput.trim().replace(/^#/, '');
                const currentTags = item.tags || [];
                if (!currentTags.includes(cleanTag)) {
                  onUpdateTags(item.id, [...currentTags, cleanTag]);
                }
                setTagInput('');
              }} 
              className="flex gap-2 mt-2"
            >
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add custom tag... (e.g. Work, Invoice)"
                className="flex-grow text-xs px-3.5 py-2 bg-black/40 border border-white/5 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#007AFF]/50"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                + Add
              </button>
            </form>
          </div>

          {/* Text Transformations Toolkit */}
          <div className="mt-5 space-y-3">
            <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-1.5 font-sans flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-[#007AFF]" />
              Text Transformation Toolkit
            </h4>
            <p className="text-[10px] text-white/40 leading-relaxed">
              Instantly clean, convert, or decode your clipboard content before sharing or pasting.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  if (onUpdateContent) {
                    onUpdateContent(item.id, item.content.trim());
                    onCopy({ ...item, content: item.content.trim() });
                  }
                }}
                className="p-2.5 bg-[#1C1C1E] border border-white/5 hover:border-[#007AFF]/30 rounded-xl text-left text-xs transition-all active:scale-95 flex flex-col justify-between h-13 cursor-pointer"
              >
                <span className="font-bold text-white/90">Trim Whitespace</span>
                <span className="text-[9px] text-white/40 font-medium">Remove outer spaces</span>
              </button>

              <button
                onClick={() => {
                  if (onUpdateContent) {
                    onUpdateContent(item.id, item.content.toUpperCase());
                    onCopy({ ...item, content: item.content.toUpperCase() });
                  }
                }}
                className="p-2.5 bg-[#1C1C1E] border border-white/5 hover:border-[#007AFF]/30 rounded-xl text-left text-xs transition-all active:scale-95 flex flex-col justify-between h-13 cursor-pointer"
              >
                <span className="font-bold text-white/90">UPPERCASE</span>
                <span className="text-[9px] text-white/40 font-medium">ALL CAPITAL LETTERS</span>
              </button>

              <button
                onClick={() => {
                  if (onUpdateContent) {
                    onUpdateContent(item.id, item.content.toLowerCase());
                    onCopy({ ...item, content: item.content.toLowerCase() });
                  }
                }}
                className="p-2.5 bg-[#1C1C1E] border border-white/5 hover:border-[#007AFF]/30 rounded-xl text-left text-xs transition-all active:scale-95 flex flex-col justify-between h-13 cursor-pointer"
              >
                <span className="font-bold text-white/90">lowercase</span>
                <span className="text-[9px] text-white/40 font-medium">all lower characters</span>
              </button>

              <button
                onClick={() => {
                  if (onUpdateContent) {
                    const camel = item.content
                      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase())
                      .replace(/\s+/g, '');
                    onUpdateContent(item.id, camel);
                    onCopy({ ...item, content: camel });
                  }
                }}
                className="p-2.5 bg-[#1C1C1E] border border-white/5 hover:border-[#007AFF]/30 rounded-xl text-left text-xs transition-all active:scale-95 flex flex-col justify-between h-13 cursor-pointer"
              >
                <span className="font-bold text-white/90 font-mono text-[11px]">camelCase</span>
                <span className="text-[9px] text-white/40 font-medium font-mono">camelCaseFormat</span>
              </button>

              <button
                onClick={() => {
                  if (onUpdateContent) {
                    const snake = item.content
                      .toLowerCase()
                      .replace(/\s+/g, '_')
                      .replace(/[^\w]/g, '');
                    onUpdateContent(item.id, snake);
                    onCopy({ ...item, content: snake });
                  }
                }}
                className="p-2.5 bg-[#1C1C1E] border border-white/5 hover:border-[#007AFF]/30 rounded-xl text-left text-xs transition-all active:scale-95 flex flex-col justify-between h-13 cursor-pointer"
              >
                <span className="font-bold text-white/90 font-mono text-[11px]">snake_case</span>
                <span className="text-[9px] text-white/40 font-medium font-mono">snake_case_format</span>
              </button>

              <button
                onClick={() => {
                  if (onUpdateContent) {
                    const title = item.content
                      .toLowerCase()
                      .split(' ')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ');
                    onUpdateContent(item.id, title);
                    onCopy({ ...item, content: title });
                  }
                }}
                className="p-2.5 bg-[#1C1C1E] border border-white/5 hover:border-[#007AFF]/30 rounded-xl text-left text-xs transition-all active:scale-95 flex flex-col justify-between h-13 cursor-pointer"
              >
                <span className="font-bold text-white/90 text-[11px]">Title Case</span>
                <span className="text-[9px] text-white/40 font-medium">Title Case Format</span>
              </button>

              <button
                onClick={() => {
                  if (onUpdateContent) {
                    const stripped = item.content.replace(/<\/?[^>]+(>|$)/g, "");
                    onUpdateContent(item.id, stripped);
                    onCopy({ ...item, content: stripped });
                  }
                }}
                className="p-2.5 bg-[#1C1C1E] border border-white/5 hover:border-[#007AFF]/30 rounded-xl text-left text-xs transition-all active:scale-95 flex flex-col justify-between h-13 cursor-pointer"
              >
                <span className="font-bold text-white/90">Strip HTML Tags</span>
                <span className="text-[9px] text-white/40 font-medium">Convert HTML to plain text</span>
              </button>

              <button
                onClick={() => {
                  if (onUpdateContent) {
                    try {
                      const parsed = JSON.parse(item.content);
                      const formatted = JSON.stringify(parsed, null, 2);
                      onUpdateContent(item.id, formatted);
                      onCopy({ ...item, content: formatted });
                    } catch (_) {}
                  }
                }}
                disabled={(() => {
                  try {
                    JSON.parse(item.content);
                    return false;
                  } catch (_) {
                    return true;
                  }
                })()}
                className="p-2.5 bg-[#1C1C1E] border border-white/5 hover:border-[#007AFF]/30 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-left text-xs transition-all active:scale-95 flex flex-col justify-between h-13 cursor-pointer"
              >
                <span className="font-bold text-white/90 font-sans">Format JSON</span>
                <span className="text-[9px] text-white/40 font-medium">Beautify raw JSON string</span>
              </button>

              <button
                onClick={() => {
                  if (onUpdateContent) {
                    const encoded = encodeURIComponent(item.content);
                    onUpdateContent(item.id, encoded);
                    onCopy({ ...item, content: encoded });
                  }
                }}
                className="p-2.5 bg-[#1C1C1E] border border-white/5 hover:border-[#007AFF]/30 rounded-xl text-left text-xs transition-all active:scale-95 flex flex-col justify-between h-13 cursor-pointer"
              >
                <span className="font-bold text-white/90">URL Encode</span>
                <span className="text-[9px] text-white/40 font-medium">Convert to percent-encoding</span>
              </button>

              <button
                onClick={() => {
                  if (onUpdateContent) {
                    try {
                      const base64 = btoa(unescape(encodeURIComponent(item.content)));
                      onUpdateContent(item.id, base64);
                      onCopy({ ...item, content: base64 });
                    } catch (_) {}
                  }
                }}
                className="p-2.5 bg-[#1C1C1E] border border-white/5 hover:border-[#007AFF]/30 rounded-xl text-left text-xs transition-all active:scale-95 flex flex-col justify-between h-13 cursor-pointer"
              >
                <span className="font-bold text-white/90">Base64 Encode</span>
                <span className="text-[9px] text-white/40 font-medium">Convert text to base64 string</span>
              </button>

              <button
                onClick={() => {
                  if (onUpdateContent) {
                    try {
                      const decoded = decodeURIComponent(escape(atob(item.content.trim())));
                      onUpdateContent(item.id, decoded);
                      onCopy({ ...item, content: decoded });
                    } catch (_) {}
                  }
                }}
                disabled={(() => {
                  const val = item.content.trim();
                  if (!val || val.length < 4 || val.length % 4 !== 0) return true;
                  try {
                    return btoa(atob(val)) !== val;
                  } catch (_) {
                    return true;
                  }
                })()}
                className="p-2.5 bg-[#1C1C1E] border border-white/5 hover:border-[#007AFF]/30 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-left text-xs transition-all active:scale-95 flex flex-col justify-between h-13 cursor-pointer"
              >
                <span className="font-bold text-white/90">Base64 Decode</span>
                <span className="text-[9px] text-white/40 font-medium">Decode base64 back to text</span>
              </button>

              <button
                onClick={() => {
                  if (onUpdateContent) {
                    const slug = item.content
                      .toLowerCase()
                      .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '') // keep letters, numbers, chinese, spaces, hyphens
                      .trim()
                      .replace(/[\s_]+/g, '-') // replace spaces/underscores with hyphens
                      .replace(/-+/g, '-'); // collapse consecutive hyphens
                    onUpdateContent(item.id, slug);
                    onCopy({ ...item, content: slug });
                  }
                }}
                className="p-2.5 bg-[#1C1C1E] border border-white/5 hover:border-[#007AFF]/30 rounded-xl text-left text-xs transition-all active:scale-95 flex flex-col justify-between h-13 cursor-pointer"
              >
                <span className="font-bold text-white/90">Slugify</span>
                <span className="text-[9px] text-white/40 font-medium font-sans">URL slug (e.g. text-to-slug)</span>
              </button>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="mt-5 space-y-3">
            <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-1.5 font-sans">
              Metadata & Archival
            </h4>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/50 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-white/40" />
                Copied Time
              </span>
              <span className="font-semibold text-white/90">{formattedDate}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-white/50 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-white/40" />
                Bundle ID
              </span>
              <span className="font-mono text-white/40 select-all">
                {item.sourceAppBundleId || 'com.apple.clipboard'}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-white/50 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-white/40" />
                Recopy Count
              </span>
              <span className="font-semibold text-white/90">
                Resynced <strong className="text-[#007AFF] font-bold">{item.copyCount}</strong> times
              </span>
            </div>

            {item.url && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/50 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-white/40" />
                  Source Link
                </span>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[#007AFF] font-bold flex items-center gap-0.5 hover:opacity-80 transition-opacity"
                >
                  Visit Website
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions Row */}
        <div className="grid grid-cols-2 gap-3 shrink-0">
          <div className="flex gap-2.5 col-span-2 border-b border-white/5 pb-3 mb-1">
            {/* Toggle Favorite */}
            <button
              onClick={() => onToggleFavorite(item.id)}
              className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                item.isFavorite
                  ? 'bg-[#FF9500]/10 border-[#FF9500]/30 text-[#FF9500]'
                  : 'bg-[#1C1C1E] border-white/5 text-white/80 hover:text-white'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-[#FF9500]' : ''}`} />
              {item.isFavorite ? 'Pinned' : 'Pin Item'}
            </button>

            {/* Toggle Sensitive */}
            <button
              onClick={() => onToggleSensitive(item.id)}
              className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                item.isSensitive
                  ? 'bg-[#FF3B30]/10 border-[#FF3B30]/30 text-[#FF3B30]'
                  : 'bg-[#1C1C1E] border-white/5 text-white/80 hover:text-white'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              {item.isSensitive ? 'Protected' : 'Protect'}
            </button>
          </div>

          <button
            onClick={handleCopyBack}
            className="py-3 bg-[#007AFF] hover:opacity-90 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-lg shadow-[#007AFF]/20 cursor-pointer"
          >
            {copiedText ? (
              <>
                <Check className="w-4 h-4 stroke-[3px]" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Back
              </>
            )}
          </button>

          <button
            onClick={handleDeleteClick}
            className="py-3 bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/20 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// PREMIUM RECURSIVE JSON EXPLORER FOR PASTEPAL DEVELOPER SUITE
interface JsonTreeItemProps {
  key?: string;
  label: string;
  value: any;
  isLast: boolean;
  depth: number;
}

function JsonTreeItem({ label, value, isLast, depth }: JsonTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const indent = depth * 12;

  const type = typeof value;
  const isObject = value !== null && type === 'object';
  
  const handleCopyValue = (e: React.MouseEvent, val: any) => {
    e.stopPropagation();
    const str = typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val);
    navigator.clipboard.writeText(str);
  };

  if (isObject) {
    const keys = Object.keys(value);
    const isArray = Array.isArray(value);
    const bracketOpen = isArray ? '[' : '{';
    const bracketClose = isArray ? ']' : '}';

    return (
      <div className="font-mono text-[11px] leading-relaxed">
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 hover:bg-white/5 py-0.5 rounded px-1 -mx-1 cursor-pointer group"
          style={{ paddingLeft: `${indent + 4}px` }}
        >
          <ChevronRight className={`w-3 h-3 text-white/30 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          <span className="text-purple-400 font-semibold">{label}</span>
          <span className="text-white/50">:</span>
          <span className="text-white/80 font-bold ml-1">{bracketOpen}</span>
          {!isExpanded && (
            <span className="text-white/40 text-[10px] ml-1 bg-white/5 px-1 rounded hover:text-white">
              {keys.length} items
            </span>
          )}
          {!isExpanded && <span className="text-white/80 font-bold">{bracketClose}{!isLast && ','}</span>}
          
          <button
            onClick={(e) => handleCopyValue(e, value)}
            className="opacity-0 group-hover:opacity-100 ml-auto text-[9px] text-[#007AFF] hover:underline font-bold"
          >
            Copy
          </button>
        </div>

        {isExpanded && (
          <div className="border-l border-white/5 ml-2.5">
            {keys.map((key, idx) => (
              <JsonTreeItem 
                key={key} 
                label={isArray ? '' : `"${key}"`} 
                value={value[key]} 
                isLast={idx === keys.length - 1} 
                depth={depth + 1} 
              />
            ))}
          </div>
        )}

        {isExpanded && (
          <div className="text-white/80 font-bold" style={{ paddingLeft: `${indent + 18}px` }}>
            {bracketClose}{!isLast && ','}
          </div>
        )}
      </div>
    );
  }

  // Primitive values rendering
  let valueSpan = null;
  if (value === null) {
    valueSpan = <span className="text-zinc-500 font-bold">null</span>;
  } else if (type === 'string') {
    valueSpan = <span className="text-emerald-400 font-medium">"{value}"</span>;
  } else if (type === 'number') {
    valueSpan = <span className="text-amber-400 font-semibold">{value}</span>;
  } else if (type === 'boolean') {
    valueSpan = <span className="text-blue-400 font-bold">{String(value)}</span>;
  } else {
    valueSpan = <span className="text-white">{String(value)}</span>;
  }

  return (
    <div 
      className="font-mono text-[11px] leading-relaxed flex items-center hover:bg-white/5 py-0.5 rounded px-1 -mx-1 group"
      style={{ paddingLeft: `${indent + 18}px` }}
    >
      {label && (
        <>
          <span className="text-purple-400 font-semibold">{label}</span>
          <span className="text-white/50 mr-1.5">:</span>
        </>
      )}
      {valueSpan}
      {!isLast && <span className="text-white/50">,</span>}

      <button
        onClick={(e) => handleCopyValue(e, value)}
        className="opacity-0 group-hover:opacity-100 ml-auto text-[9px] text-[#007AFF] hover:underline font-bold"
      >
        Copy
      </button>
    </div>
  );
}
