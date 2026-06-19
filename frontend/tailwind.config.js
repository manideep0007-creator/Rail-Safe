export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        rail: {
          navy: '#061427',
          blue: '#0a2544',
          cyan: '#7dd3fc',
          orange: '#f97316',
          amber: '#f59e0b'
        }
      },
      boxShadow: {
        glow: '0 0 40px rgba(249, 115, 22, 0.24)',
        panel: '0 24px 80px rgba(2, 8, 23, 0.38)'
      },
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: []
};
