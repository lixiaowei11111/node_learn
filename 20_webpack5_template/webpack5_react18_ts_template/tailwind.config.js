const boxSize = {
  0: '0',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
  100: '400px',
}

module.exports = {
  plugins: [],
  content: ['./src/**/*.vue'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      boxShadow: {
        page: '0 2px 12px 0 rgba(0, 0, 0, 0.1)',
      },
      fontSize: {
        xxs: ['12px', '18px'],
        xs: ['13px', '20px'],
        sm: ['14px', '22px'],
        base: ['16px', '24px'],
        lg: ['18px', '26px'],
        xl: ['20px', '30px'],
      },
      spacing: boxSize,
      minWidth: boxSize,
      maxWidth: boxSize,
      minHeight: boxSize,
      maxHeight: boxSize,
      colors: {
        gray: {
          base: '#333333',
          50: '#fafafa',
          100: '#f5f5f7',
          200: '#f0f0f2',
          300: '#E6E7EB',
          400: '#D9D9DB',
          500: '#BFBFBF',
          600: '#999999',
          700: '#666666',
          800: '#222222',
          900: '#000000',
        },
        blue: {
          50: '#f0f8ff',
          100: '#d6ebff',
          200: '#add3ff',
          300: '#85baff',
          400: '#5c9dff',
          500: '#337eff',
          600: '#215ed9',
          700: '#1242b3',
          800: '#072b8c',
          900: '#041b66',
        },
        red: {
          50: '#fff1f0',
          100: '#ffe0e0',
          200: '#ffc8c7',
          300: '#ff9ea0',
          400: '#ff757c',
          500: '#f24957',
          600: '#cc3345',
          700: '#a62135',
          800: '#801327',
          900: '#590c1d',
        },
        yellow: {
          50: '#fffbe6',
          100: '#ffeda3',
          200: '#ffe07a',
          300: '#ffd152',
          400: '#ffbf29',
          500: '#ffaa00',
          600: '#d98900',
          700: '#b36b00',
          800: '#8c4f00',
          900: '#663600',
        },
        green: {
          50: '#e6fff2',
          100: '#9bf2ca',
          200: '#6ee6b2',
          300: '#45d99e',
          400: '#21cc8d',
          500: '#00bf80',
          600: '#00996b',
          700: '#007354',
          800: '#004d3b',
          900: '#00261f',
        },
      },
    },
  },
}
