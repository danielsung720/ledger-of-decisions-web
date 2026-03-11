import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './components/**/*.{vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.ts',
    './plugins/**/*.ts',
    './app.vue',
  ],

  theme: {
    extend: {
      // =====================
      // Color System
      // =====================
      colors: {
        // Theme-aware colors using CSS variables
        theme: {
          bg: 'var(--color-bg)',
          surface: 'var(--color-surface)',
          'surface-secondary': 'var(--color-surface-secondary)',
          border: 'var(--color-border)',
          'border-hover': 'var(--color-border-hover)',
          text: 'var(--color-text)',
          'text-secondary': 'var(--color-text-secondary)',
          'text-muted': 'var(--color-text-muted)',
          'text-placeholder': 'var(--color-text-placeholder)',
          primary: 'var(--color-primary)',
          'primary-light': 'var(--color-primary-light)',
          'primary-hover': 'var(--color-primary-hover)',
          'primary-active': 'var(--color-primary-active)',
          secondary: 'var(--color-secondary)',
          'secondary-light': 'var(--color-secondary-light)',
          success: 'var(--color-success)',
          'success-light': 'var(--color-success-light)',
          warning: 'var(--color-warning)',
          'warning-light': 'var(--color-warning-light)',
          error: 'var(--color-error)',
          'error-light': 'var(--color-error-light)',
          info: 'var(--color-info)',
          'info-light': 'var(--color-info-light)',
          'intent-necessity': 'var(--color-intent-necessity)',
          'intent-necessity-light': 'var(--color-intent-necessity-light)',
          'intent-efficiency': 'var(--color-intent-efficiency)',
          'intent-efficiency-light': 'var(--color-intent-efficiency-light)',
          'intent-enjoyment': 'var(--color-intent-enjoyment)',
          'intent-enjoyment-light': 'var(--color-intent-enjoyment-light)',
          'intent-recovery': 'var(--color-intent-recovery)',
          'intent-recovery-light': 'var(--color-intent-recovery-light)',
          'intent-impulse': 'var(--color-intent-impulse)',
          'intent-impulse-light': 'var(--color-intent-impulse-light)',
        },

        // Primary - Warm Coral
        primary: {
          50: '#FDF5F2',
          100: '#FAEAE4',
          200: '#F5D5C9',
          300: '#EDBAA8',
          400: '#E09D84',
          500: '#D98971',
          600: '#C67A62',
          700: '#A86550',
        },

        // Secondary - Sage Green
        sage: {
          50: '#F0F6F0',
          100: '#E1EDE1',
          200: '#C8DCC8',
          300: '#B8D4BA',
          400: '#AECBB0',
          500: '#9DBF9F',
          600: '#7EB88C',
        },

        // Neutral - Warm Neutrals
        cream: {
          50: '#FFFBF7',
          100: '#FFF8F2',
          200: '#F5E6D3',
        },
        'warm-gray': {
          300: '#D9CFC2',
          400: '#B8AC9E',
          500: '#8C8279',
          600: '#6B6259',
          700: '#5C554D',
          800: '#4A443D',
          900: '#3D3833',
        },

        // Semantic
        success: {
          50: '#F0F6F0',
          500: '#7EB88C',
        },
        warning: {
          50: '#FDF6E9',
          500: '#E8B86D',
        },
        alert: {
          50: '#FDF2ED',
          500: '#D9936A',
        },
        info: {
          50: '#E8F1F8',
          500: '#7BA3C9',
        },

        // Intent Colors
        intent: {
          necessity: '#7BA3C9',
          'necessity-light': '#E8F1F8',
          efficiency: '#E8B86D',
          'efficiency-light': '#FDF6E9',
          enjoyment: '#D98971',
          'enjoyment-light': '#FDF5F2',
          recovery: '#9DBF9F',
          'recovery-light': '#F0F6F0',
          impulse: '#C9A3B8',
          'impulse-light': '#F8F0F5',
        },
      },

      // =====================
      // Font System
      // =====================
      fontFamily: {
        sans: ['Inter', 'Noto Sans TC', 'system-ui', 'sans-serif'],
        mono: ['DM Sans', 'Inter', 'monospace'],
      },

      fontSize: {
        'caption-sm': ['0.6875rem', { lineHeight: '0.875rem' }],
        caption: ['0.75rem', { lineHeight: '1rem' }],
        'body-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'body-md': ['1rem', { lineHeight: '1.5rem' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'heading-sm': ['1.25rem', { lineHeight: '1.75rem' }],
        'heading-md': ['1.5rem', { lineHeight: '2rem' }],
        'heading-lg': ['1.75rem', { lineHeight: '2.25rem' }],
        'display-md': ['2.25rem', { lineHeight: '2.75rem' }],
        'display-lg': ['3rem', { lineHeight: '3.5rem' }],
      },

      // =====================
      // Spacing (extending Tailwind defaults)
      // =====================
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
      },

      // =====================
      // Border Radius
      // =====================
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        full: '9999px',
        // Theme-aware border radius
        'theme-sm': 'var(--radius-sm)',
        'theme-md': 'var(--radius-md)',
        'theme-lg': 'var(--radius-lg)',
        'theme-xl': 'var(--radius-xl)',
        'theme-2xl': 'var(--radius-2xl)',
      },

      // =====================
      // Shadows (warm tone)
      // =====================
      boxShadow: {
        sm: '0 1px 2px rgba(61, 56, 51, 0.05)',
        md: '0 4px 6px -1px rgba(61, 56, 51, 0.07), 0 2px 4px -1px rgba(61, 56, 51, 0.04)',
        lg: '0 10px 15px -3px rgba(61, 56, 51, 0.08), 0 4px 6px -2px rgba(61, 56, 51, 0.04)',
        xl: '0 20px 25px -5px rgba(61, 56, 51, 0.08), 0 10px 10px -5px rgba(61, 56, 51, 0.03)',
        inner: 'inset 0 2px 4px 0 rgba(61, 56, 51, 0.05)',
        focus: '0 0 0 3px rgba(217, 137, 113, 0.15)',
        'error-focus': '0 0 0 3px rgba(217, 147, 106, 0.15)',
        // Theme-aware shadows
        'theme-sm': 'var(--shadow-sm)',
        'theme-md': 'var(--shadow-md)',
        'theme-lg': 'var(--shadow-lg)',
        'theme-xl': 'var(--shadow-xl)',
        'theme-focus': 'var(--shadow-focus)',
      },

      // =====================
      // Transitions
      // =====================
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
        slower: '400ms',
      },

      transitionTimingFunction: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      // =====================
      // Gradients
      // =====================
      backgroundImage: {
        'warm-sunrise': 'linear-gradient(135deg, #FFF8F2 0%, #FDF5F2 50%, #F0F6F0 100%)',
        'soft-glow': 'linear-gradient(180deg, #FFFFFF 0%, #FFF8F2 100%)',
        cta: 'linear-gradient(135deg, #D98971 0%, #E09D84 100%)',
      },

      // =====================
      // Layout
      // =====================
      maxWidth: {
        content: '1312px',
      },

      // =====================
      // Z-index
      // =====================
      zIndex: {
        header: '100',
        'modal-overlay': '200',
        modal: '210',
        toast: '300',
      },

      // =====================
      // Keyframes
      // =====================
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'scale-out': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'fade-out': 'fade-out 150ms ease-in',
        'slide-up': 'slide-up 300ms ease-out',
        'scale-in': 'scale-in 200ms ease-out',
        'scale-out': 'scale-out 150ms ease-in',
        spin: 'spin 1s linear infinite',
      },
    },
  },

  plugins: [],
}

export default config
