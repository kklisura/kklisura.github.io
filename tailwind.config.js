/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./_site/**/*.html"],
  theme: {
    screens: {
      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '768px',
      // => @media (min-width: 768px) { ... }

      'lg': '1024px',
      // => @media (min-width: 1024px) { ... }

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }
    },
    colors: {
      'navbar': {
        border: 'lightgray'
      },
      'navbar-link': {
        bg: '',
        text: '#000',
        border: 'lightgray',
      },
      'hovered-navbar-link': {
        bg: '#18314F',
        text: '#fff',
        border: '#18314F',
      },
      'active-navbar-link': {
        bg: '',
        text: '#18314F',
        border: '#18314F',
      },
      'active-hovered-navbar-link': {
        bg: '',
        text: '',
        border: '',
      },
      'link': {
        bg: '',
        text: '#0d6efd',
      },
      'hovered-link': {
        bg: '#2b588e',
        text: '#fff',
      },
      'text': {
        light: 'rgb(108,117,125)',
        body: '#212529'
      }
    },
    extend: {},
  },
  plugins: [],
}