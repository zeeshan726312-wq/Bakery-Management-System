// src/theme.js – Theme palettes and switcher

const themes = {
  default: {  // Bakery Warm
    '--primary-h': '25',  '--primary-s': '85%',  '--primary-l': '55%',
    '--secondary-h': '35', '--secondary-s': '90%', '--secondary-l': '55%',
  },
  blue: {  // Ocean Blue
    '--primary-h': '215', '--primary-s': '80%',  '--primary-l': '55%',
    '--secondary-h': '240', '--secondary-s': '70%', '--secondary-l': '60%',
  },
  purple: {  // Royal Purple
    '--primary-h': '270', '--primary-s': '70%',  '--primary-l': '58%',
    '--secondary-h': '300', '--secondary-s': '60%', '--secondary-l': '55%',
  },
  teal: {  // Fresh Teal
    '--primary-h': '175', '--primary-s': '70%',  '--primary-l': '45%',
    '--secondary-h': '195', '--secondary-s': '65%', '--secondary-l': '50%',
  },
  rose: {  // Elegant Rose
    '--primary-h': '340', '--primary-s': '75%',  '--primary-l': '55%',
    '--secondary-h': '320', '--secondary-s': '65%', '--secondary-l': '50%',
  }
};

export function applyTheme(themeName) {
  const root = document.documentElement;
  const palette = themes[themeName] || themes['default'];
  for (const [prop, value] of Object.entries(palette)) {
    root.style.setProperty(prop, value);
  }
}
