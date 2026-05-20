export const PAPER_COLOR_TOKENS = {
  surface: {
    gray950: '#030712',
    gray900: '#111827',
    gray90040: '#11182766',
    slate90060: '#0F172A99',
    slate90080: '#0F172ACC',
  },
  primary: {
    blue100: '#DBEAFE',
    blue200: '#BFDBFE',
    blue300: '#93C5FD',
    blue400: '#60A5FA',
    blue600: '#2563EB',
    blue700: '#1D4ED8',
    blue900: '#1E3A8A',
  },
  semantic: {
    success: '#16A34A',
    destructive: '#DC2626',
    warning: '#FBBF24',
    caution: '#FB923C',
    policy: '#C084FC',
    errorBackground: '#7F1D1D4D',
    warningBackground: '#713F124D',
  },
  text: {
    primary: '#E2E8F0',
    secondary: '#94A3B8',
    muted: '#64748B',
  },
  border: {
    focus: '#1E3A8A4D',
    panel: '#1E3A8A33',
    muted: '#94A3B833',
    destructiveBackground: '#EF44440F',
    destructive: '#EF44444D',
  },
  status: {
    default: '#6B7280',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#EAB308',
    info: '#3B82F6',
  },
} as const;

export const PAPER_TYPOGRAPHY_TOKENS = {
  fontFamily: {
    shareTechMono: '"Share Tech Mono", system-ui, sans-serif',
    inter: '"Inter", system-ui, sans-serif',
  },
  typeScale: {
    h1: {
      fontFamily: 'var(--igloo-font-share-tech-mono)',
      fontSize: '36px',
      lineHeight: '44px',
      fontWeight: 400,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontFamily: 'var(--igloo-font-share-tech-mono)',
      fontSize: '24px',
      lineHeight: '30px',
      fontWeight: 400,
    },
    h3: {
      fontFamily: 'var(--igloo-font-share-tech-mono)',
      fontSize: '20px',
      lineHeight: '24px',
      fontWeight: 400,
    },
    body: {
      fontFamily: 'var(--igloo-font-inter)',
      fontSize: '14px',
      lineHeight: '18px',
      fontWeight: 400,
    },
    small: {
      fontFamily: 'var(--igloo-font-inter)',
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 400,
    },
    valueData: {
      fontFamily: 'var(--igloo-font-share-tech-mono)',
      fontSize: '14px',
      lineHeight: '18px',
      fontWeight: 400,
    },
    monoLabels: {
      fontFamily: 'var(--igloo-font-inter)',
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 400,
    },
  },
} as const;

export const paperTokenCssVariables = {
  color: {
    surface: {
      page: 'var(--igloo-color-gray-950)',
      panel: 'var(--igloo-color-slate-900-60)',
      panelStrong: 'var(--igloo-color-slate-900-80)',
    },
    primary: {
      blue100: 'var(--igloo-color-blue-100)',
      blue200: 'var(--igloo-color-blue-200)',
      blue300: 'var(--igloo-color-blue-300)',
      blue400: 'var(--igloo-color-blue-400)',
      blue600: 'var(--igloo-color-blue-600)',
      blue700: 'var(--igloo-color-blue-700)',
      blue900: 'var(--igloo-color-blue-900)',
    },
    text: {
      primary: 'var(--igloo-color-slate-200)',
      secondary: 'var(--igloo-color-slate-400)',
      muted: 'var(--igloo-color-slate-500)',
    },
    status: {
      default: 'var(--igloo-color-status-default)',
      success: 'var(--igloo-color-status-success)',
      error: 'var(--igloo-color-status-error)',
      warning: 'var(--igloo-color-status-warning)',
      info: 'var(--igloo-color-status-info)',
    },
  },
  font: {
    body: 'var(--igloo-font-inter)',
    display: 'var(--igloo-font-share-tech-mono)',
    value: 'var(--igloo-font-share-tech-mono)',
  },
} as const;

export type PaperColorTokens = typeof PAPER_COLOR_TOKENS;
export type PaperTypographyTokens = typeof PAPER_TYPOGRAPHY_TOKENS;
