import React from 'react';
import { createRoot } from 'react-dom/client';
import { TestComponent } from './test-component';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(<TestComponent />);