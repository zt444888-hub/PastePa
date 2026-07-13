/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import { 
  Star, Compass, FileText, Terminal, Code, MessageSquare, Key, 
  MessageCircle, Clipboard, Trash2, Eye, EyeOff, MoreHorizontal, Copy, Share2, Check
} from 'lucide-react';
import { PasteItem } from '../types';

interface PasteItemRowProps {
  item: PasteItem;
  onCopy: (item: PasteItem) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onSelectDetail: (item: PasteItem) => void;
  sensitiveDetectionEnabled: boolean;
  isEditMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export default function PasteItemRow({
  item,
  onCopy,
  onToggleFavorite,
  onDelete,
  onSelectDetail,
  sensitiveDetectionEnabled,
  isEditMode = false,
  isSelected = false,
  onToggleSelect
}: PasteItemRowProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [relativeTime, setRelativeTime] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Calculate relative time
  useEffect(() => {
    const calculateTime = () => {
      const diff = Math.floor((Date.now() - item.createdAt) / 1000);
      if (diff < 60) return '刚刚';
      if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
      return `${Math.floor(diff / 86400)} 天前`;
    };

    setRelativeTime(calculateTime());
    const interval = setInterval(() => {
      setRelativeTime(calculateTime());
    }, 30000);

    return () => clearInterval(interval);
  }, [item.createdAt]);

  // App icon map
  const renderAppIcon = () => {
    const iconClass = "w-5 h-5";
    
    const colorStr = item.content.trim();
    const isHex = /^#([A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(colorStr);
    const isRgb = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)$/i.test(colorStr);
    const isHsl = /^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(?:,\s*[\d.]+\s*)?\)$/i.test(colorStr);

    if (isHex || isRgb || isHsl) {
      return (
        <div 
          className="w-10 h-10 rounded-xl shrink-0 border border-white/10 shadow-inner relative group"
          style={{ backgroundColor: colorStr }}
          title={`Color Preview: ${colorStr}`}
        />
      );
    }

    switch (item.sourceAppName?.toLowerCase()) {
      case 'safari':
        return <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-[#007AFF] shrink-0"><Compass className={iconClass} /></div>;
      case 'notes':
        return <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0"><FileText className={iconClass} /></div>;
      case 'xcode':
        return <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 shrink-0"><Terminal className={iconClass} /></div>;
      case 'x':
      case 'github':
        return <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0"><Code className={iconClass} /></div>;
      case 'slack':
        return <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0"><MessageSquare className={iconClass} /></div>;
      case '1password':
        return <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-[#007AFF] shrink-0"><Key className={iconClass} /></div>;
      case 'messages':
        return <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0"><MessageCircle className={iconClass} /></div>;
      default:
        return <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 shrink-0"><Clipboard className={iconClass} /></div>;
    }
  };

  // Determine if it is a sensitive content warning
  const shouldMask = sensitiveDetectionEnabled && item.isSensitive && !isRevealed;

  // Swipe logic using framer-motion drag
  const controls = useAnimation();
  
  const handleDragEnd = async (event: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -120 || velocity < -500) {
      // Swipe left -> Delete
      await controls.start({ x: -400, opacity: 0, transition: { duration: 0.2 } });
      onDelete(item.id);
    } else if (offset > 120 || velocity > 500) {
      // Swipe right -> Toggle Favorite
      onToggleFavorite(item.id);
      // Reset position
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    } else {
      // Reset
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  const handleCopyClick = (e: React.MouseEvent) => {
    // If clicking context trigger, ignore copy
    if ((e.target as HTMLElement).closest('.ignore-copy')) return;

    if (isEditMode && onToggleSelect) {
      onToggleSelect(item.id);
      return;
    }

    if (shouldMask) {
      // Click a masked password -> reveal first, don't copy yet
      setIsRevealed(true);
      return;
    }

    onCopy(item);
  };

  // Format code preview cleanly
  const renderContentBody = () => {
    if (item.contentType === 'code') {
      return (
        <div className="mt-1.5">
          <pre className="font-mono text-xs bg-black/40 p-3.5 rounded-xl text-emerald-400 border border-white/5 whitespace-pre overflow-x-auto select-all leading-relaxed scrollbar-thin">
            {item.content.length > 150 ? `${item.content.substring(0, 150)}...` : item.content}
          </pre>
        </div>
      );
    }

    if (item.contentType === 'url') {
      return (
        <p className="text-[#007AFF] text-sm font-medium underline decoration-blue-500/30 truncate select-all mt-1">
          {item.content}
        </p>
      );
    }

    return (
      <p className="text-zinc-200 text-[14px] leading-relaxed line-clamp-3 whitespace-pre-wrap mt-1">
        {item.content}
      </p>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#1C1C1E] select-none border border-white/5 shadow-sm">
      
      {/* Swipe Left Action Background (Delete - Red) */}
      <div className="absolute inset-0 bg-[#FF3B30] flex items-center justify-end px-6 text-white pointer-events-none z-0">
        <div className="flex flex-col items-center gap-0.5">
          <Trash2 className="w-5 h-5 animate-pulse" />
          <span className="text-[10px] font-bold font-sans uppercase tracking-wider">Delete</span>
        </div>
      </div>

      {/* Swipe Right Action Background (Favorite - Star Gold) */}
      <div className="absolute inset-0 bg-[#FF9500] flex items-center justify-start px-6 text-white pointer-events-none z-0">
        <div className="flex flex-col items-center gap-0.5">
          <Star className="w-5 h-5 fill-white" />
          <span className="text-[10px] font-bold font-sans uppercase tracking-wider">
            {item.isFavorite ? 'Unpin' : 'Pin'}
          </span>
        </div>
      </div>

      {/* Main Row Content Card */}
      <motion.div
        drag={isEditMode ? false : "x"}
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.6, right: 0.6 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        className={`relative z-10 w-full bg-[#1C1C1E] p-5 border ${
          isSelected 
            ? 'border-[#007AFF]' 
            : 'border-transparent hover:border-[#007AFF]/40'
        } shadow-sm cursor-pointer active:bg-zinc-900 transition-colors duration-150 rounded-2xl`}
        onClick={handleCopyClick}
      >
        <div className="flex items-start gap-4">
          {/* Selection indicator for edit mode */}
          {isEditMode && (
            <div className="flex-shrink-0 self-center mr-0.5">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-[#007AFF] border-[#007AFF] text-white'
                  : 'border-white/20 bg-transparent'
              }`}>
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
              </div>
            </div>
          )}

          {/* App Logo */}
          <div className="flex-shrink-0">
            {renderAppIcon()}
          </div>

          {/* Text and Info Area */}
          <div className="flex-grow min-w-0">
            {/* Row Meta */}
            {item.isFavorite ? (
              <div className="flex justify-between items-start mb-1">
                <p className="text-[#FF9500] text-[10px] uppercase tracking-widest font-extrabold">
                  Pinned · From {item.sourceAppName || 'Safari'}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {relativeTime}
                  </span>
                  <Star className="w-3.5 h-3.5 text-[#FF9500] fill-[#FF9500]" />
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start mb-1">
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-extrabold">
                  {item.sourceAppName || 'System'} · {relativeTime}
                </p>
                <div className="flex items-center gap-2">
                  {item.copyCount > 0 && (
                    <span className="text-[8px] font-bold bg-white/5 text-white/50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      {item.copyCount}x synced
                    </span>
                  )}
                  
                  {/* Manual favorite action */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                    className="ignore-copy text-zinc-600 hover:text-amber-500 p-0.5 transition-colors"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Content Body with Sensitive Blurring */}
            {shouldMask ? (
              <div className="mt-2 py-1 flex justify-between items-center w-full">
                <div>
                  <p className="text-red-500/60 text-[10px] uppercase tracking-widest font-bold mb-1.5">Sensitive Content</p>
                  <div className="flex space-x-1.5 items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                    <span className="mx-1.5 opacity-20 text-white/30">—</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                    <span className="text-white/40 text-[11px]">Hidden for security</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRevealed(true);
                  }}
                  className="ignore-copy text-xs text-[#007AFF] font-semibold hover:opacity-80 py-1 px-2.5 rounded-lg hover:bg-[#007AFF]/10 transition-colors"
                >
                  Reveal
                </button>
              </div>
            ) : (
              <div>
                {renderContentBody()}
                
                {/* Small Pill Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map(t => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/10 text-[9px] font-bold text-[#007AFF] tracking-wide uppercase">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Meta details if available */}
                {(item.previewTitle || item.previewDescription) && (
                  <div className="mt-2.5 p-3 bg-black/40 border border-white/5 rounded-xl flex flex-col gap-1 text-xs">
                    {item.previewTitle && <p className="font-bold text-white line-clamp-1">{item.previewTitle}</p>}
                    {item.previewDescription && <p className="text-zinc-400 line-clamp-2 leading-relaxed">{item.previewDescription}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Swipe action button (context menu trigger) */}
        <div className="flex justify-end gap-1.5 border-t border-white/5 mt-3 pt-2 ignore-copy">
          {item.isSensitive && isRevealed && (
            <button
              onClick={() => setIsRevealed(false)}
              className="p-1 px-2 text-zinc-500 hover:text-zinc-300 text-[11px] flex items-center gap-1 transition-colors font-medium"
              title="重新模糊遮罩"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>遮蔽</span>
            </button>
          )}
          <button
            onClick={() => onSelectDetail(item)}
            className="p-1 px-2 text-zinc-500 hover:text-zinc-300 text-[11px] flex items-center gap-1 transition-colors font-medium"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
            <span>详情</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
