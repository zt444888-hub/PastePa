/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  History, Star, Settings, Search, RefreshCw, Sun, Moon, 
  Trash2, Plus, Sparkles, Copy, LayoutGrid, Check, RotateCcw, 
  ShieldAlert, AlertCircle, Info, ExternalLink, HelpCircle, Pin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PasteItem, AppSetting, ContentType, SUPPORTED_APPS } from './types';
import IosFrame from './components/IosFrame';
import Onboarding from './components/Onboarding';
import PasteItemRow from './components/PasteItemRow';
import PasteItemDetail from './components/PasteItemDetail';
import SettingsTab from './components/SettingsTab';

// Initial Mock Seed Data
const INITIAL_ITEMS: PasteItem[] = [
  {
    id: 'seed-1',
    content: 'https://apple.com/iphone-15-pro',
    contentType: 'url',
    createdAt: Date.now() - 15 * 60 * 1000, // 15 mins ago
    updatedAt: Date.now() - 15 * 60 * 1000,
    pinnedAt: Date.now() - 15 * 60 * 1000,
    lastCopiedAt: null,
    copyCount: 2,
    sourceAppBundleId: 'com.apple.mobilesafari',
    sourceAppName: 'Safari',
    isSensitive: false,
    isTrashed: false,
    isFavorite: true,
    previewTitle: 'iPhone 15 Pro - Apple',
    previewDescription: '配备钛金属边框，A17 Pro 芯片，可自定义操作按钮。以及迄今为止最强大的 iPhone 摄像头系统。',
    url: 'https://apple.com/iphone-15-pro',
    tags: ['Apple', 'Web', 'Link']
  },
  {
    id: 'seed-2',
    content: 'Grocery list for the weekend: milk, eggs, bread, coffee beans, avocado, and some Greek yogurt.',
    contentType: 'text',
    createdAt: Date.now() - 3 * 3600 * 1000, // 3 hours ago
    updatedAt: Date.now() - 3 * 3600 * 1000,
    pinnedAt: Date.now() - 3 * 3600 * 1000,
    lastCopiedAt: null,
    copyCount: 0,
    sourceAppBundleId: 'com.apple.mobilenotes',
    sourceAppName: 'Notes',
    isSensitive: false,
    isTrashed: false,
    isFavorite: true,
    tags: ['List', 'Personal']
  },
  {
    id: 'seed-3',
    content: 'struct PasteItem: Identifiable {\n  let id: UUID\n  let content: String\n  let contentType: ContentType\n  let createdAt: Date\n}',
    contentType: 'code',
    createdAt: Date.now() - 5 * 3600 * 1000, // 5 hours ago
    updatedAt: Date.now() - 5 * 3600 * 1000,
    pinnedAt: null,
    lastCopiedAt: null,
    copyCount: 1,
    sourceAppBundleId: 'com.apple.dt.Xcode',
    sourceAppName: 'Xcode',
    isSensitive: false,
    isTrashed: false,
    isFavorite: false,
    detectedLanguage: 'swift',
    tags: ['Swift', 'Code']
  },
  {
    id: 'seed-4',
    content: 'sk-proj-apiKeysAndSecretsJWT12345XYZabc123',
    contentType: 'text',
    createdAt: Date.now() - 8 * 3600 * 1000, // 8 hours ago
    updatedAt: Date.now() - 8 * 3600 * 1000,
    pinnedAt: null,
    lastCopiedAt: null,
    copyCount: 0,
    sourceAppBundleId: 'com.agilebits.onepassword',
    sourceAppName: '1Password',
    isSensitive: true,
    isTrashed: false,
    isFavorite: false,
    tags: ['Secret', 'API Key']
  },
  {
    id: 'seed-5',
    content: 'We need to deploy the production build before Friday. Make sure the database schema is up to date and all migrations run successfully.',
    contentType: 'text',
    createdAt: Date.now() - 24 * 3600 * 1000, // 1 day ago
    updatedAt: Date.now() - 24 * 3600 * 1000,
    pinnedAt: null,
    lastCopiedAt: null,
    copyCount: 3,
    sourceAppBundleId: 'com.tinyspeck.slack',
    sourceAppName: 'Slack',
    isSensitive: false,
    isTrashed: false,
    isFavorite: false,
    tags: ['Work', 'Task']
  }
];

const DEFAULT_SETTINGS: AppSetting = {
  historyLimit: 500,
  autoCleanupInterval: '30d',
  icloudSync: true,
  sensitiveDetection: true,
  ignoredApps: ['com.agilebits.onepassword'],
  selectedIcon: 'classic'
};

export default function App() {
  const [history, setHistory] = useState<PasteItem[]>([]);
  const [settings, setSettings] = useState<AppSetting>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<'history' | 'favorites' | 'settings'>('history');
  
  // Navigation & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'text' | 'url' | 'code'>('all');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const [manualInput, setManualInput] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Edit & Multi-Select State
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Overlay & Modal state
  const [activeDetailItem, setActiveDetailItem] = useState<PasteItem | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'undo'; visible: boolean; action?: () => void }>({
    message: '',
    type: 'success',
    visible: false
  });
  
  // Undo deletion buffer
  const [lastDeletedItem, setLastDeletedItem] = useState<PasteItem | null>(null);

  // Load and setup
  useEffect(() => {
    // 1. Theme check
    const savedTheme = localStorage.getItem('pastepal_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setThemeMode(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeMode(prefersDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', prefersDark);
    }

    // 2. Load settings
    const savedSettings = localStorage.getItem('pastepal_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }

    // 3. Load history
    const savedHistory = localStorage.getItem('pastepal_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    } else {
      setHistory(INITIAL_ITEMS);
      localStorage.setItem('pastepal_history', JSON.stringify(INITIAL_ITEMS));
    }

    // 4. Onboarding check
    const seenOnboarding = localStorage.getItem('pastepal_seen_onboarding');
    if (!seenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  // Save changes
  const saveHistoryToStorage = (updatedHistory: PasteItem[]) => {
    setHistory(updatedHistory);
    localStorage.setItem('pastepal_history', JSON.stringify(updatedHistory));
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    const text = manualInput.trim();
    
    // Auto-detect type
    let type: ContentType = 'text';
    const isUrl = /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(text) || /^www\.[^\s$.?#].[^\s]*$/i.test(text);
    const isCode = text.includes('import ') || text.includes('const ') || text.includes('function ') || text.includes('class ') || text.includes('<html>') || text.includes(' {') || text.includes('public static void');
    
    if (isUrl) {
      type = 'url';
    } else if (isCode) {
      type = 'code';
    }

    // Auto-generate tags
    const generatedTags: string[] = ['Manual'];
    if (isUrl) generatedTags.push('Web', 'Link');
    if (isCode) generatedTags.push('Developer', 'Snippet');
    if (text.length > 100 && !isUrl && !isCode) generatedTags.push('Note');

    const newItem: PasteItem = {
      id: `manual-${Date.now()}`,
      content: text,
      contentType: type,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinnedAt: null,
      lastCopiedAt: null,
      copyCount: 0,
      sourceAppBundleId: 'com.apple.shortcuts',
      sourceAppName: 'Manual Clip',
      isSensitive: false,
      isTrashed: false,
      isFavorite: false,
      tags: generatedTags,
      url: isUrl ? text : undefined
    };

    const updatedHistory = [newItem, ...history];
    saveHistoryToStorage(updatedHistory);
    
    setManualInput('');
    setShowQuickAdd(false);
    
    // Trigger success toast
    showToast('Created manual clip successfully', 'success');
  };

  const handleSettingsChange = (newSettings: AppSetting) => {
    setSettings(newSettings);
    localStorage.setItem('pastepal_settings', JSON.stringify(newSettings));
  };

  // Toggle Theme Mode
  const toggleTheme = () => {
    const nextTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(nextTheme);
    localStorage.setItem('pastepal_theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    showToast(nextTheme === 'dark' ? '已切至深色模式 🌙' : '已切至浅色模式 ☀️', 'info');
  };

  // Toast utilities
  const showToast = (message: string, type: 'success' | 'info' | 'undo' = 'success', action?: () => void) => {
    setToast({ message, type, visible: true, action });
    if (type !== 'undo') {
      setTimeout(() => {
        setToast(prev => prev.message === message ? { ...prev, visible: false } : prev);
      }, 1500);
    }
  };

  // Trigger gentle tactile vibration (simulated or real if on mobile)
  const triggerHaptic = (style: 'light' | 'medium' | 'success') => {
    if (navigator.vibrate) {
      if (style === 'light') navigator.vibrate(15);
      else if (style === 'medium') navigator.vibrate(35);
      else if (style === 'success') navigator.vibrate([30, 40]);
    }
  };

  // Core Function: Handle item copy back to clipboard
  const handleCopyBack = useCallback((item: PasteItem) => {
    triggerHaptic('medium');
    navigator.clipboard.writeText(item.content).then(() => {
      // Update Copy count & active date
      const updated = history.map(h => {
        if (h.id === item.id) {
          return {
            ...h,
            copyCount: h.copyCount + 1,
            lastCopiedAt: Date.now()
          };
        }
        return h;
      });
      saveHistoryToStorage(updated);
      showToast('Copied! 已放回 iOS 剪贴板', 'success');
    }).catch(err => {
      console.error('Failed to copy text', err);
      // Fallback UI feedback
      showToast('Copied! (模拟写入)', 'success');
    });
  }, [history]);

  // Core Function: Detect if content is sensitive
  const detectSensitivity = (text: string): boolean => {
    // Regex for basic API keys, credits, 2fa, passwords
    const isCreditCard = /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/.test(text);
    const isApiKey = /(?:key|api|secret|token|password|auth|jwt|sk-proj)[-_\w]{10,}/i.test(text);
    const isOtp = /\b\d{4,8}\b/.test(text) && text.toLowerCase().includes('code');
    return isCreditCard || isApiKey || isOtp;
  };

  // Core Function: Ingest New Clipboard Entry
  const ingestClipboard = useCallback((
    text: string, 
    sourceApp: string = '系统剪贴板', 
    bundleId: string = 'com.apple.clipboard'
  ) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    // Check Ignore list
    if (settings.ignoredApps.includes(bundleId) || settings.ignoredApps.includes(sourceApp)) {
      console.log(`Skipped copying from ignored app: ${sourceApp}`);
      return;
    }

    // Check duplicate content within 3 seconds window to prevent loops
    const lastItem = history[0];
    if (lastItem && lastItem.content === cleanText && (Date.now() - lastItem.createdAt < 3000)) {
      return;
    }

    // Determine type
    let type: ContentType = 'text';
    let urlInfo: any = {};
    let language: string | undefined;

    if (cleanText.startsWith('http://') || cleanText.startsWith('https://')) {
      type = 'url';
      urlInfo = {
        url: cleanText,
        previewTitle: cleanText.split('/')[2] || '网页链接',
        previewDescription: '来自网页浏览器的极速复制条目。'
      };
    } else if (
      cleanText.includes('struct ') || cleanText.includes('func ') || 
      cleanText.includes('import ') || cleanText.includes('const ') || 
      cleanText.includes('class ') || cleanText.includes('{') && cleanText.includes('}')
    ) {
      type = 'code';
      // simple guesser
      language = 'swift';
      if (cleanText.includes('const ') || cleanText.includes('let ') && cleanText.includes('=')) {
        language = 'javascript';
      } else if (cleanText.includes('def ') || cleanText.includes('import os')) {
        language = 'python';
      }
    }

    const isSensitive = detectSensitivity(cleanText);

    // Compute automatic smart tags
    const autoTags: string[] = [];
    if (type === 'url') {
      if (cleanText.includes('github.com')) {
        autoTags.push('GitHub');
      } else if (cleanText.includes('apple.com')) {
        autoTags.push('Apple');
      } else if (cleanText.includes('google.com')) {
        autoTags.push('Google');
      } else {
        try {
          const domain = new URL(cleanText).hostname.replace('www.', '');
          autoTags.push(domain);
        } catch (_) {
          autoTags.push('Web');
        }
      }
    } else {
      // check for Email
      if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.test(cleanText)) {
        autoTags.push('Email');
      }
      // check for Phone
      if (/(?:\+?86)?\s?1[3-9]\d{9}\b|\b\d{3}-\d{3}-\d{4}\b/.test(cleanText)) {
        autoTags.push('Phone');
      }
      // check for OTP
      const hasNumber = /\b\d{4,8}\b/.test(cleanText);
      const hasKeywords = /(?:code|otp|verification|password|captcha|验证码|验证|验证机)/i.test(cleanText);
      if (hasNumber && hasKeywords) {
        autoTags.push('2FA OTP');
      }
    }

    if (language) {
      autoTags.push(language.toUpperCase());
    }

    if (isSensitive) {
      autoTags.push('Sensitive');
    }

    if (cleanText.length > 200) {
      autoTags.push('Long Text');
    }

    const newItem: PasteItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      content: cleanText,
      contentType: type,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinnedAt: null,
      lastCopiedAt: null,
      copyCount: 0,
      sourceAppBundleId: bundleId,
      sourceAppName: sourceApp,
      isSensitive,
      isTrashed: false,
      isFavorite: false,
      tags: autoTags,
      ...urlInfo,
      detectedLanguage: language
    };

    // Capacity checking
    let updated = [newItem, ...history];
    if (settings.historyLimit > 0 && updated.length > settings.historyLimit) {
      updated = updated.slice(0, settings.historyLimit);
    }

    saveHistoryToStorage(updated);
    triggerHaptic('medium');
    showToast(`自动捕获: 来自 ${sourceApp}`, 'info');
  }, [history, settings]);

  // Read actual clipboard if window is focused & permitted
  const checkSystemClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          // If different from our topmost item
          const lastItem = history[0];
          if (!lastItem || lastItem.content !== text.trim()) {
            ingestClipboard(text, '真实系统剪贴板', 'com.apple.uipasteboard');
          }
        }
      }
    } catch (e) {
      // Chrome/Safari security block is expected for quiet reading, user can use simulator
      console.log('Clipboard auto-read declined or blocked in browser frame. Use the simulator panel!');
    }
  };

  // Listen to window focus for real clipboard reading
  useEffect(() => {
    window.addEventListener('focus', checkSystemClipboard);
    return () => window.removeEventListener('focus', checkSystemClipboard);
  }, [checkSystemClipboard]);

  const shredContent = (content: string): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let shredded = '';
    for (let i = 0; i < Math.min(content.length, 64); i++) {
      shredded += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `[REDACTED_SECURE_WIPE_${shredded}]`;
  };

  // Delete Action (With Secure Shred Mode or Undo Option)
  const handleDeleteItem = (id: string) => {
    triggerHaptic('light');
    const target = history.find(h => h.id === id);
    if (!target) return;

    if (settings.secureShredMode) {
      // Overwrite the content immediately in storage to destroy original trace, then filter
      const shreddedContent = shredContent(target.content);
      const shreddedTarget = {
        ...target,
        content: shreddedContent,
        previewTitle: '[PRIVACY_SHREDDED]',
        previewDescription: '[PRIVACY_SHREDDED]',
        url: undefined
      };
      const shreddedHistory = history.map(h => h.id === id ? shreddedTarget : h);
      saveHistoryToStorage(shreddedHistory.filter(h => h.id !== id));
      triggerHaptic('success');
      showToast('🔒 隐私粉碎：已彻底擦除该剪贴记录', 'success');
    } else {
      setLastDeletedItem(target);
      const updated = history.filter(h => h.id !== id);
      saveHistoryToStorage(updated);

      showToast('已删除 1 条记录', 'undo', () => {
        // Undo callback
        if (target) {
          const restored = [target, ...updated];
          saveHistoryToStorage(restored);
          setLastDeletedItem(null);
          showToast('已撤销删除', 'success');
        }
      });
    }
  };

  // Favorite / Pin Action
  const handleToggleFavorite = (id: string) => {
    triggerHaptic('light');
    const updated = history.map(h => {
      if (h.id === id) {
        return {
          ...h,
          isFavorite: !h.isFavorite,
          pinnedAt: !h.isFavorite ? Date.now() : null
        };
      }
      return h;
    });
    saveHistoryToStorage(updated);
    const item = updated.find(h => h.id === id);
    if (item) {
      showToast(item.isFavorite ? '已加入置顶收藏' : '已取消收藏', 'success');
    }
  };

  // Toggle Sensitive Flag manually
  const handleToggleSensitive = (id: string) => {
    const updated = history.map(h => {
      if (h.id === id) {
        return {
          ...h,
          isSensitive: !h.isSensitive
        };
      }
      return h;
    });
    saveHistoryToStorage(updated);
    showToast('隐私属性已更新', 'success');
  };

  // Wipe all history
  const handleWipeHistory = () => {
    triggerHaptic('success');
    saveHistoryToStorage([]);
    showToast('已清空所有历史数据', 'success');
  };

  // Onboarding completion
  const handleOnboardingComplete = () => {
    localStorage.setItem('pastepal_seen_onboarding', 'true');
    setShowOnboarding(false);
  };

  // Update Tags of an item
  const handleUpdateTags = (id: string, newTags: string[]) => {
    const updated = history.map(h => {
      if (h.id === id) {
        return {
          ...h,
          tags: newTags
        };
      }
      return h;
    });
    saveHistoryToStorage(updated);
    
    // If the active detail sheet is open, update its state reactively
    if (activeDetailItem && activeDetailItem.id === id) {
      setActiveDetailItem(prev => prev ? { ...prev, tags: newTags } : null);
    }
  };

  // Update Content of an item (e.g. after text transformations)
  const handleUpdateContent = (id: string, newContent: string) => {
    const updated = history.map(h => {
      if (h.id === id) {
        return {
          ...h,
          content: newContent
        };
      }
      return h;
    });
    saveHistoryToStorage(updated);
    
    // If active detail item is open, update its state reactively
    if (activeDetailItem && activeDetailItem.id === id) {
      setActiveDetailItem(prev => prev ? { ...prev, content: newContent } : null);
    }
  };

  // Toggle Selection state of a single clipboard item in Edit Mode
  const handleToggleSelectItem = (id: string) => {
    setSelectedItemIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Select All visible items in current view
  const handleSelectAll = (visibleItemIds: string[]) => {
    setSelectedItemIds(visibleItemIds);
  };

  // Deselect All items
  const handleDeselectAll = () => {
    setSelectedItemIds([]);
  };

  // Batch action: Pin / Unpin all selected items
  const handleBatchPin = (pin: boolean) => {
    if (selectedItemIds.length === 0) return;
    const updated = history.map(h => {
      if (selectedItemIds.includes(h.id)) {
        return {
          ...h,
          isFavorite: pin,
          pinnedAt: pin ? Date.now() : null
        };
      }
      return h;
    });
    saveHistoryToStorage(updated);
    setSelectedItemIds([]);
    setIsEditMode(false);
    showToast(`已批量${pin ? '收藏' : '取消收藏'} ${selectedItemIds.length} 条记录`, 'success');
  };

  // Batch action: Delete all selected items (with Secure Shred support)
  const handleBatchDelete = () => {
    if (selectedItemIds.length === 0) return;
    
    if (settings.secureShredMode) {
      const shreddedHistory = history.map(h => {
        if (selectedItemIds.includes(h.id)) {
          return {
            ...h,
            content: shredContent(h.content),
            previewTitle: '[PRIVACY_SHREDDED]',
            previewDescription: '[PRIVACY_SHREDDED]',
            url: undefined
          };
        }
        return h;
      });
      saveHistoryToStorage(shreddedHistory.filter(h => !selectedItemIds.includes(h.id)));
      setSelectedItemIds([]);
      setIsEditMode(false);
      triggerHaptic('success');
      showToast(`🔒 隐私粉碎：彻底擦除 ${selectedItemIds.length} 条记录`, 'success');
    } else {
      const itemsToDelete = history.filter(h => selectedItemIds.includes(h.id));
      const updated = history.filter(h => !selectedItemIds.includes(h.id));
      saveHistoryToStorage(updated);
      setSelectedItemIds([]);
      setIsEditMode(false);

      showToast(`已批量删除 ${itemsToDelete.length} 条记录`, 'undo', () => {
        const restored = [...itemsToDelete, ...updated];
        saveHistoryToStorage(restored);
        showToast('已撤销批量删除', 'success');
      });
    }
  };

  // Batch action: Merge & Copy all selected items (joined by double newlines) and save in history
  const handleBatchCopy = () => {
    if (selectedItemIds.length === 0) return;
    
    // Sort selected items chronologically (oldest first) so they join in the sequence they were originally captured
    const selectedItems = history
      .filter(h => selectedItemIds.includes(h.id))
      .reverse();
    
    const texts = selectedItems.map(h => h.content).join('\n\n');
    const isSensitiveMerged = selectedItems.some(h => h.isSensitive);
    
    navigator.clipboard.writeText(texts).then(() => {
      // Ingest the merged content back into history!
      const mergedItem: PasteItem = {
        id: `merged-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        content: texts,
        contentType: 'text',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pinnedAt: null,
        lastCopiedAt: Date.now(),
        copyCount: 1,
        sourceAppName: 'PastePal Merge',
        sourceAppBundleId: 'com.apple.shortcuts',
        isSensitive: isSensitiveMerged,
        isTrashed: false,
        isFavorite: false,
        tags: ['Merged']
      };

      const updated = [mergedItem, ...history];
      saveHistoryToStorage(updated);
      setSelectedItemIds([]);
      setIsEditMode(false);
      triggerHaptic('success');
      showToast('已批量合并、拷贝并归档！', 'success');
    }).catch(err => {
      console.error(err);
      showToast('拷贝失败', 'info');
    });
  };

  // Filter and search computation
  const filteredHistory = history.filter(item => {
    // 1. Tab check
    if (activeTab === 'favorites' && !item.isFavorite) {
      return false;
    }

    // 2. Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      
      if (q.startsWith('#')) {
        const tagToMatch = q.substring(1);
        if (!item.tags || !item.tags.some(t => t.toLowerCase() === tagToMatch)) return false;
      } else if (q.startsWith('tag:')) {
        const tagToMatch = q.substring(4);
        if (!item.tags || !item.tags.some(t => t.toLowerCase() === tagToMatch)) return false;
      } else if (q.startsWith('type:')) {
        const typeToMatch = q.substring(5);
        const typeMapping: { [key: string]: string } = { link: 'url', text: 'text', code: 'code', url: 'url' };
        const mappedType = typeMapping[typeToMatch] || typeToMatch;
        if (item.contentType !== mappedType) return false;
      } else {
        const matchContent = item.content.toLowerCase().includes(q);
        const matchApp = item.sourceAppName?.toLowerCase().includes(q) || false;
        const matchTags = item.tags?.some(t => t.toLowerCase().includes(q)) || false;
        if (!matchContent && !matchApp && !matchTags) return false;
      }
    }

    // 3. Category Filter
    if (activeTab === 'history') {
      if (selectedFilter === 'text' && item.contentType !== 'text') return false;
      if (selectedFilter === 'url' && item.contentType !== 'url') return false;
      if (selectedFilter === 'code' && item.contentType !== 'code') return false;
    }

    // 4. Tag Filter
    if (selectedTagFilter && (!item.tags || !item.tags.includes(selectedTagFilter))) {
      return false;
    }

    return true;
  });

  return (
    <IosFrame 
      activeApp="PastePal" 
      onSimulateCopy={(content, appName, bundleId) => ingestClipboard(content, appName, bundleId)}
    >
      <div className="flex-grow flex flex-col h-full bg-black text-white font-sans overflow-hidden">
        
        {/* Header Navigation Bar */}
        <header className="sticky top-0 z-30 flex justify-between items-center px-6 h-12 bg-[#121212]/80 backdrop-blur-md border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <button
                onClick={() => {
                  const visibleItemIds = filteredHistory.map(item => item.id);
                  if (selectedItemIds.length === visibleItemIds.length) {
                    handleDeselectAll();
                  } else {
                    handleSelectAll(visibleItemIds);
                  }
                }}
                className="text-xs font-bold text-[#007AFF] hover:opacity-80 active:scale-95 transition-all"
              >
                {selectedItemIds.length === filteredHistory.length && filteredHistory.length > 0 ? 'Deselect All' : 'Select All'}
              </button>
            ) : (
              <button
                onClick={checkSystemClipboard}
                className="p-1 text-[#007AFF] hover:opacity-80 active:scale-95 transition-all flex items-center gap-1"
                title="读取系统剪切板"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-xs font-bold select-none hidden md:inline">Sync</span>
              </button>
            )}
          </div>
          
          <h1 className="text-[14px] font-bold tracking-tight text-white select-none uppercase font-display">
            {activeTab === 'history' && (isEditMode ? 'Select Items' : 'History')}
            {activeTab === 'favorites' && (isEditMode ? 'Select Items' : 'Favorites')}
            {activeTab === 'settings' && 'Settings'}
          </h1>

          <div className="flex items-center gap-2">
            {activeTab !== 'settings' && (
              <button
                onClick={() => {
                  setIsEditMode(!isEditMode);
                  setSelectedItemIds([]);
                }}
                className="text-xs font-bold text-[#007AFF] bg-[#007AFF]/10 py-1 px-3 rounded-full hover:bg-[#007AFF]/20 transition-all"
              >
                {isEditMode ? 'Done' : 'Edit'}
              </button>
            )}
            <div className="flex items-center gap-1 text-[10px] font-bold tracking-widest text-[#007AFF] uppercase bg-[#007AFF]/10 py-1 px-2.5 rounded-full border border-[#007AFF]/20">
              <Sparkles className="w-3 h-3 text-[#007AFF]" />
              PRO
            </div>
          </div>
        </header>

        {/* Dynamic Screen Tabs */}
        {activeTab === 'settings' ? (
          <SettingsTab
            settings={settings}
            onChangeSettings={handleSettingsChange}
            onClearAll={handleWipeHistory}
            history={history}
            onUpdateHistory={(newHistory) => {
              saveHistoryToStorage(newHistory);
              showToast('✨ 诊断清理：已彻底净化重复与空白项！', 'success');
            }}
          />
        ) : (
          <div className="flex-grow overflow-hidden flex flex-col">
            
            {/* Header Area with Large Title & Search Swipe */}
            <div className="px-6 pt-6 pb-4 bg-black border-b border-white/5 shrink-0">
              <div className="flex justify-between items-end mb-4">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-4xl font-bold tracking-tight text-white select-none font-display">
                    {activeTab === 'history' ? 'History' : 'Favorites'}
                  </h2>
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      setShowQuickAdd(!showQuickAdd);
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${showQuickAdd ? 'bg-[#007AFF] text-white rotate-45' : 'bg-[#1C1C1E] text-[#007AFF] hover:bg-white/5'} border border-white/5 active:scale-90 cursor-pointer`}
                    title="Quickly add manual text snippet"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                {activeTab === 'history' && (
                  <span className="text-xs text-white/60 font-medium bg-[#1C1C1E] px-3 py-1 rounded-full border border-white/5">
                    {filteredHistory.length} items
                  </span>
                )}
              </div>

              {/* iOS Native Search Field */}
              <div className="relative flex items-center h-11 bg-[#1C1C1E] rounded-xl px-4 group transition-all duration-150 border border-white/5 focus-within:border-[#007AFF]/50">
                <Search className="w-4 h-4 text-white/40 group-focus-within:text-[#007AFF] transition-colors shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={activeTab === 'history' ? "Search clipboard history..." : "Search favorites..."}
                  className="ml-3 w-full bg-transparent border-none focus:ring-0 text-sm text-white placeholder-white/30 font-sans outline-none py-1"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-semibold text-white/60 hover:text-white ml-2 transition-colors shrink-0"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {/* Quick Add Snippet Form */}
              <AnimatePresence>
                {showQuickAdd && (
                  <motion.form
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    onSubmit={handleManualSubmit}
                    className="overflow-hidden"
                  >
                    <div className="bg-[#1C1C1E]/80 border border-[#007AFF]/25 p-3.5 rounded-2xl flex gap-2 items-center focus-within:border-[#007AFF] transition-colors shadow-lg">
                      <input
                        type="text"
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        placeholder="Type or paste to quickly save text or URL..."
                        className="flex-grow bg-transparent text-xs text-zinc-100 placeholder-white/20 focus:outline-none py-1.5 px-2 font-sans"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={!manualInput.trim()}
                        className="px-4 py-2 bg-[#007AFF] hover:bg-[#007AFF]/85 disabled:opacity-30 disabled:pointer-events-none active:scale-95 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md shadow-[#007AFF]/15"
                      >
                        Save
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* iOS Search Fast Filters Shortcut Row */}
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none pt-2.5 px-0.5 text-[10px] items-center">
                <span className="text-white/35 font-bold uppercase tracking-wider text-[9px] shrink-0 font-mono">Fast Query:</span>
                <button
                  onClick={() => setSearchQuery('type:link')}
                  className={`px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/60 border border-white/5 active:scale-95 transition-all cursor-pointer whitespace-nowrap ${searchQuery === 'type:link' ? 'bg-[#007AFF]/10 border-[#007AFF]/30 text-[#007AFF]' : ''}`}
                >
                  🔗 Links
                </button>
                <button
                  onClick={() => setSearchQuery('type:code')}
                  className={`px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/60 border border-white/5 active:scale-95 transition-all cursor-pointer whitespace-nowrap ${searchQuery === 'type:code' ? 'bg-[#007AFF]/10 border-[#007AFF]/30 text-[#007AFF]' : ''}`}
                >
                  💻 Code
                </button>
                <button
                  onClick={() => setSearchQuery('#Sensitive')}
                  className={`px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/60 border border-white/5 active:scale-95 transition-all cursor-pointer whitespace-nowrap ${searchQuery === '#Sensitive' ? 'bg-red-500/10 border-red-500/30 text-red-400' : ''}`}
                >
                  🔒 Sensitive
                </button>
                <button
                  onClick={() => setSearchQuery('#Apple')}
                  className={`px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/60 border border-white/5 active:scale-95 transition-all cursor-pointer whitespace-nowrap ${searchQuery === '#Apple' ? 'bg-[#007AFF]/10 border-[#007AFF]/30 text-[#007AFF]' : ''}`}
                >
                   Apple
                </button>
              </div>

              {/* Category Filter Chips (Only for History view) */}
              {activeTab === 'history' && (
                <div>
                  <div className="flex gap-2.5 pt-4 overflow-x-auto scrollbar-none">
                    {(['all', 'text', 'url', 'code'] as const).map(type => {
                      const labelMap = { all: 'All Items', text: 'Text', url: 'Links', code: 'Code' };
                      const isSelected = selectedFilter === type;
                      return (
                        <button
                          key={type}
                          onClick={() => setSelectedFilter(type)}
                          className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 active:scale-95 cursor-pointer ${
                            isSelected
                              ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/20'
                              : 'bg-[#1C1C1E] text-white opacity-80 hover:opacity-100 border border-white/5'
                          }`}
                        >
                          {labelMap[type]}
                        </button>
                      );
                    })}
                  </div>

                  {/* Smart Tag Filters Row */}
                  {(() => {
                    const allTags = Array.from(new Set(history.flatMap(item => item.tags || [])));
                    if (allTags.length === 0) return null;
                    return (
                      <div className="flex gap-1.5 pt-3 overflow-x-auto scrollbar-none items-center">
                        <span className="text-[9px] font-extrabold text-white/30 uppercase tracking-widest shrink-0 mr-1 font-mono">
                          TAGS:
                        </span>
                        {selectedTagFilter && (
                          <button
                            onClick={() => setSelectedTagFilter(null)}
                            className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20 shrink-0 cursor-pointer"
                          >
                            × Clear Filter
                          </button>
                        )}
                        {allTags.map(tag => {
                          const isSelected = selectedTagFilter === tag;
                          return (
                            <button
                              key={tag}
                              onClick={() => setSelectedTagFilter(isSelected ? null : tag)}
                              className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition-all shrink-0 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#007AFF]/25 border border-[#007AFF]/50 text-[#007AFF]'
                                  : 'bg-[#1C1C1E] text-white/50 hover:text-white/80 border border-white/5'
                              }`}
                            >
                              #{tag}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Simulated Today Widget (Highlighting iOS widget integration!) */}
            {activeTab === 'history' && !searchQuery && (
              <div className="px-6 py-4 bg-black border-b border-white/5 shrink-0">
                <div className="bg-[#1C1C1E] p-4 rounded-2xl border border-white/5 shadow-md">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5 font-sans">
                      <LayoutGrid className="w-3.5 h-3.5 text-[#007AFF] fill-[#007AFF]/20" />
                      iOS Today Widget (小组件预览)
                    </span>
                    <span className="text-[9px] px-2 py-0.5 bg-[#007AFF]/10 text-[#007AFF] rounded-full font-bold uppercase tracking-wider">Widget</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {history.slice(0, 3).map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => handleCopyBack(item)}
                        className="p-2.5 bg-black/40 border border-white/5 rounded-xl text-left hover:border-[#007AFF]/50 transition-colors duration-100 group flex flex-col justify-between h-16 cursor-pointer"
                      >
                        <p className="text-[10px] text-white/80 line-clamp-2 leading-tight font-mono break-all select-none">
                          {item.content}
                        </p>
                        <div className="flex justify-between items-center mt-1 text-[8px] text-white/40">
                          <span className="font-semibold uppercase tracking-wide truncate max-w-[40px]">{item.sourceAppName || 'Clip'}</span>
                          <span className="opacity-0 group-hover:opacity-100 text-[#007AFF] font-bold transition-opacity">拷贝</span>
                        </div>
                      </button>
                    ))}
                    {history.length === 0 && (
                      <p className="col-span-3 text-center text-[11px] text-white/40 py-3">暂无历史复制内容</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Scrollable Clipboard List Container */}
            <div className="flex-grow overflow-y-auto px-6 py-4 scrollbar-thin">
              <AnimatePresence initial={false}>
                {filteredHistory.map(item => (
                  <div key={item.id} className="mb-4">
                    <PasteItemRow
                      item={item}
                      onCopy={handleCopyBack}
                      onToggleFavorite={handleToggleFavorite}
                      onDelete={handleDeleteItem}
                      onSelectDetail={setActiveDetailItem}
                      sensitiveDetectionEnabled={settings.sensitiveDetection}
                      isEditMode={isEditMode}
                      isSelected={selectedItemIds.includes(item.id)}
                      onToggleSelect={handleToggleSelectItem}
                    />
                  </div>
                ))}
              </AnimatePresence>

              {/* Empty State Banner */}
              {filteredHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center text-white/45 select-none">
                  <div className="w-16 h-16 rounded-2xl bg-[#1C1C1E] flex items-center justify-center text-white/60 mb-4 border border-white/5">
                    📋
                  </div>
                  <h3 className="text-base font-bold text-white mb-1 font-display">
                    {searchQuery ? 'No results match' : 'Your Clipboard is Empty'}
                  </h3>
                  <p className="text-xs text-white/40 max-w-xs leading-relaxed">
                    {searchQuery 
                      ? 'Try looking for another keyword. Search covers all copied item content and application sources.'
                      : 'We automatically secure your background copies here. Copy something inside the left simulator panel to try it out!'
                    }
                  </p>
                  
                  {!searchQuery && (
                    <button
                      onClick={() => ingestClipboard('模拟复制一条精美的 iOS 备忘录文本: 完美剪贴板管理工具。', 'Notes', 'com.apple.mobilenotes')}
                      className="mt-6 px-5 py-2.5 bg-[#007AFF] hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all active:scale-95 shadow-md shadow-[#007AFF]/10 cursor-pointer"
                    >
                      Copy Sample Data
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Tab Bar Container */}
        <nav className="sticky bottom-0 z-30 flex justify-around items-center h-20 bg-[#121212]/85 backdrop-blur-md border-t border-white/5 shrink-0 px-8 pb-4">
          
          {/* TAB 1: HISTORY */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('history');
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full select-none transition-all cursor-pointer ${
              activeTab === 'history' 
                ? 'text-[#007AFF] scale-105' 
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <History className={`w-[22px] h-[22px] mb-1 ${activeTab === 'history' ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">History</span>
          </button>

          {/* TAB 2: FAVORITES */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('favorites');
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full select-none transition-all cursor-pointer ${
              activeTab === 'favorites' 
                ? 'text-[#FF9500] scale-105' 
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <Star className={`w-[22px] h-[22px] mb-1 ${activeTab === 'favorites' ? 'fill-[#FF9500]/10 stroke-[2.5px]' : 'stroke-[2px]'}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Favorites</span>
          </button>

          {/* TAB 3: SETTINGS */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('settings');
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full select-none transition-all cursor-pointer ${
              activeTab === 'settings' 
                ? 'text-white scale-105' 
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <Settings className={`w-[22px] h-[22px] mb-1 ${activeTab === 'settings' ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Settings</span>
          </button>
        </nav>

        {/* EDIT MODE BATCH ACTIONS BAR (Sleek Apple style, slides up) */}
        <AnimatePresence>
          {isEditMode && (
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 80 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="absolute bottom-20 left-0 right-0 z-40 bg-[#1C1C1E]/95 backdrop-blur-md border-t border-white/10 px-6 py-3.5 flex justify-between items-center shadow-2xl"
            >
              <span className="text-[11px] font-bold text-white/50">
                Selected: <span className="text-[#007AFF] font-extrabold">{selectedItemIds.length}</span>
              </span>

              <div className="flex gap-1.5">
                <button
                  disabled={selectedItemIds.length === 0}
                  onClick={handleBatchCopy}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none rounded-lg text-[10px] font-bold text-white flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Copy className="w-3 h-3 text-[#007AFF]" />
                  <span>Merge</span>
                </button>

                <button
                  disabled={selectedItemIds.length === 0}
                  onClick={() => handleBatchPin(true)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none rounded-lg text-[10px] font-bold text-white flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Pin className="w-3 h-3 text-[#FF9500]" />
                  <span>Pin</span>
                </button>

                <button
                  disabled={selectedItemIds.length === 0}
                  onClick={handleBatchDelete}
                  className="px-3 py-1.5 bg-[#FF3B30]/15 hover:bg-[#FF3B30]/25 disabled:opacity-30 disabled:pointer-events-none rounded-lg text-[10px] font-bold text-[#FF3B30] flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTTOM SHEET: ITEM DETAILS */}
        <AnimatePresence>
          {activeDetailItem && (
            <PasteItemDetail
              item={activeDetailItem}
              onClose={() => setActiveDetailItem(null)}
              onCopy={handleCopyBack}
              onToggleFavorite={handleToggleFavorite}
              onToggleSensitive={handleToggleSensitive}
              onDelete={handleDeleteItem}
              onUpdateTags={handleUpdateTags}
              onUpdateContent={handleUpdateContent}
            />
          )}
        </AnimatePresence>

        {/* FLOATING HUD TOAST OVERLAY */}
        <AnimatePresence>
          {toast.visible && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 20, x: "-50%" }}
              className="absolute bottom-24 left-1/2 z-50 bg-[#2C2C2E]/90 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl min-w-[280px]"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#007AFF] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-white stroke-[3px]" />
                </div>
                <span className="text-xs font-semibold tracking-wide text-white">{toast.message}</span>
              </div>
              
              {toast.type === 'undo' && toast.action && (
                <button
                  onClick={() => {
                    if (toast.action) toast.action();
                    setToast(prev => ({ ...prev, visible: false }));
                  }}
                  className="px-3 py-1 bg-[#007AFF] hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all shrink-0 active:scale-95 ml-auto cursor-pointer"
                >
                  撤销
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* FULL SCREEN OVERLAY: ONBOARDING */}
        <AnimatePresence>
          {showOnboarding && (
            <Onboarding onComplete={handleOnboardingComplete} />
          )}
        </AnimatePresence>
      </div>
    </IosFrame>
  );
}
