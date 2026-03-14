import { type RenderOptions, render } from '@testing-library/react';

import type { ReactElement } from 'react';

// Add providers as needed in the future
// For now, just a basic wrapper
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Override render method
export { customRender as render };
