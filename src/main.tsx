import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
//import { initializeSecurity } from './lib/security'

// Initialize security measures
//initializeSecurity();

console.log('Starting app...');
const root = document.getElementById("root");
console.log('Root element:', root);

if (root) {
  createRoot(root).render(<App />);
  console.log('App rendered successfully');
} else {
  console.error('Root element not found!');
}
