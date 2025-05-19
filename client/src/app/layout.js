import './globals.css';

export const metadata = {
  title: 'Investment Strategy Engine',
  description: 'AI-powered investment strategy analysis and generation',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
} 