import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, type Locale } from 'date-fns'

// =============================================================================
// Tailwind Class Merger
// =============================================================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// =============================================================================
// Date Formatting
// =============================================================================

export function formatDate(
  date: Date | string | null | undefined,
  formatStr: string = 'MMM d, yyyy',
  locale?: Locale
): string {
  if (!date) return ''
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) return ''
    return format(dateObj, formatStr)
  } catch {
    return ''
  }
}

export function formatRelativeDate(date: Date | string | null | undefined): string {
  if (!date) return ''
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) return ''
    return formatDistanceToNow(dateObj, { addSuffix: true })
  } catch {
    return ''
  }
}

export function formatDateTime(date: Date | string | null | undefined): string {
  return formatDate(date, 'MMM d, yyyy h:mm a')
}

// =============================================================================
// Currency Formatting
// =============================================================================

export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

// =============================================================================
// Number Formatting
// =============================================================================

export function formatNumber(value: number, locale: string = 'en-US'): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}k`
  }
  return new Intl.NumberFormat(locale).format(value)
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

// =============================================================================
// String Utilities
// =============================================================================

export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
  if (!str) return ''
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - suffix.length) + suffix
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function titleCase(str: string): string {
  if (!str) return ''
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ')
}

export function camelToTitle(str: string): string {
  if (!str) return ''
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}

export function snakeToTitle(str: string): string {
  if (!str) return ''
  return str
    .split('_')
    .map(capitalize)
    .join(' ')
}

// =============================================================================
// ID Generation
// =============================================================================

export function generateId(prefix?: string): string {
  const randomPart = Math.random().toString(36).substring(2, 11)
  const timePart = Date.now().toString(36)
  const id = `${timePart}${randomPart}`
  return prefix ? `${prefix}_${id}` : id
}

export function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let key = 'zenia_'
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return key
}

// =============================================================================
// Name & Avatar Utilities
// =============================================================================

export function getInitials(name: string | null | undefined, fallback: string = '??'): string {
  if (!name) return fallback
  const words = name.trim().split(/\s+/)
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

// =============================================================================
// Platform Utilities
// =============================================================================

export type SocialPlatformKey = 'LINKEDIN' | 'TWITTER' | 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK' | 'YOUTUBE'

const PLATFORM_COLORS: Record<SocialPlatformKey, string> = {
  LINKEDIN: '#0A66C2',
  TWITTER: '#1DA1F2',
  INSTAGRAM: '#E1306C',
  FACEBOOK: '#1877F2',
  TIKTOK: '#010101',
  YOUTUBE: '#FF0000',
}

const PLATFORM_ICONS: Record<SocialPlatformKey, string> = {
  LINKEDIN: 'linkedin',
  TWITTER: 'twitter',
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook',
  TIKTOK: 'tiktok',
  YOUTUBE: 'youtube',
}

export function getPlatformColor(platform: string): string {
  return PLATFORM_COLORS[platform.toUpperCase() as SocialPlatformKey] ?? '#737373'
}

export function getPlatformIcon(platform: string): string {
  return PLATFORM_ICONS[platform.toUpperCase() as SocialPlatformKey] ?? 'globe'
}

export function getPlatformDisplayName(platform: string): string {
  const names: Record<string, string> = {
    LINKEDIN: 'LinkedIn',
    TWITTER: 'X (Twitter)',
    INSTAGRAM: 'Instagram',
    FACEBOOK: 'Facebook',
    TIKTOK: 'TikTok',
    YOUTUBE: 'YouTube',
  }
  return names[platform.toUpperCase()] ?? platform
}

// =============================================================================
// Math Utilities
// =============================================================================

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.min(Math.round((value / total) * 100), 100)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function roundToDecimals(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

// =============================================================================
// URL Utilities
// =============================================================================

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function getDomainFromUrl(url: string): string {
  try {
    const { hostname } = new URL(url)
    return hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  }
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}

// =============================================================================
// Array Utilities
// =============================================================================

export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce(
    (groups, item) => {
      const groupKey = String(item[key])
      return {
        ...groups,
        [groupKey]: [...(groups[groupKey] || []), item],
      }
    },
    {} as Record<string, T[]>
  )
}

export function sortBy<T>(arr: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...arr].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

// =============================================================================
// Object Utilities
// =============================================================================

export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach((key) => delete result[key])
  return result
}

export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach((key) => {
    if (key in obj) result[key] = obj[key]
  })
  return result
}

// =============================================================================
// Color Utilities
// =============================================================================

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'bg-muted text-muted-foreground',
    ACTIVE: 'bg-green-500/20 text-green-400',
    PAUSED: 'bg-yellow-500/20 text-yellow-400',
    COMPLETED: 'bg-blue-500/20 text-blue-400',
    ARCHIVED: 'bg-muted text-muted-foreground',
    FAILED: 'bg-red-500/20 text-red-400',
    SCHEDULED: 'bg-purple-500/20 text-purple-400',
    PUBLISHED: 'bg-green-500/20 text-green-400',
    NEW: 'bg-blue-500/20 text-blue-400',
    CONTACTED: 'bg-purple-500/20 text-purple-400',
    QUALIFIED: 'bg-green-500/20 text-green-400',
    UNQUALIFIED: 'bg-red-500/20 text-red-400',
    CUSTOMER: 'bg-accent/20 text-accent',
    CHURNED: 'bg-muted text-muted-foreground',
  }
  return colors[status.toUpperCase()] ?? 'bg-muted text-muted-foreground'
}

// =============================================================================
// File Utilities
// =============================================================================

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
}

export function isImageFile(filename: string): boolean {
  const ext = getFileExtension(filename).toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext)
}
