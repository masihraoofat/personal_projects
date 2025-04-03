
module.exports = {
  scripts: {
    "dev": "vite",
    "build": "tsc && vite build",
    "serve": "vite preview",
    'start:server': 'node src/scripts/start-server.js',
    'start:all': 'concurrently "npm run start:server" "npm run dev"'
  }
};
