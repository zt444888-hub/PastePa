/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ContentType = 'text' | 'url' | 'image' | 'richText' | 'code';

export interface PasteItem {
  id: string;
  content: string;
  contentType: ContentType;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
  pinnedAt: number | null; // Unix timestamp or null
  lastCopiedAt: number | null; // Unix timestamp or null
  copyCount: number;
  sourceAppBundleId: string | null;
  sourceAppName: string | null;
  isSensitive: boolean;
  isTrashed: boolean;
  isFavorite: boolean;
  
  // URL / Rich text info
  previewTitle?: string;
  previewDescription?: string;
  previewImageData?: string; // base64 or URL
  url?: string;

  // Code related
  detectedLanguage?: string;
  tags?: string[];
}

export interface AppSetting {
  historyLimit: number; // 100, 500, 1000, 0 (unlimited)
  autoCleanupInterval: string; // '24h' | '7d' | '30d' | 'never'
  icloudSync: boolean;
  sensitiveDetection: boolean;
  ignoredApps: string[]; // List of app bundle IDs or names
  selectedIcon: string; // 'classic' | 'neon' | 'pitch' | 'retro'
  secureShredMode?: boolean; // Secure overwrite sensitive data on delete
}

export interface AppInfo {
  id: string;
  name: string;
  bundleId: string;
  iconType: string; // SF Symbol or preset
  iconBgColor: string; // Tailwind bg color class
}

export const SUPPORTED_APPS: AppInfo[] = [
  { id: 'safari', name: 'Safari', bundleId: 'com.apple.mobilesafari', iconType: 'compass', iconBgColor: 'bg-blue-500' },
  { id: 'notes', name: 'Notes', bundleId: 'com.apple.mobilenotes', iconType: 'edit_note', iconBgColor: 'bg-amber-500' },
  { id: 'xcode', name: 'Xcode', bundleId: 'com.apple.dt.Xcode', iconType: 'terminal', iconBgColor: 'bg-blue-600' },
  { id: 'x', name: 'X', bundleId: 'com.toyopagroup.x', iconType: 'close', iconBgColor: 'bg-black' },
  { id: 'github', name: 'GitHub', bundleId: 'com.github.mobile', iconType: 'code', iconBgColor: 'bg-zinc-800' },
  { id: 'slack', name: 'Slack', bundleId: 'com.tinyspeck.slack', iconType: 'chat_bubble', iconBgColor: 'bg-indigo-500' },
  { id: 'onepassword', name: '1Password', bundleId: 'com.agilebits.onepassword', iconType: 'key', iconBgColor: 'bg-blue-700' },
  { id: 'messages', name: 'Messages', bundleId: 'com.apple.MobileSMS', iconType: 'sms', iconBgColor: 'bg-emerald-500' }
];
