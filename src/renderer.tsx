import { createRoot } from 'react-dom/client';
import '@xyflow/react/dist/style.css';
import './index.css';
import './export-flow.css';
import { App } from './app/App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('#root element not found');
}

createRoot(container).render(<App />);
