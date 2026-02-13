import React from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';

export const ThemeProvider = ({ children }) => {
  return (
    <NextThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </NextThemeProvider>
  );
};
