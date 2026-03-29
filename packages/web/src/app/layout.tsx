import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kinship',
  description: 'Relationship Intelligence',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100">
        <nav className="border-b border-zinc-800 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold text-pink-500">Kinship</h1>
            <div className="flex gap-4">
              <a href="/" className="text-zinc-400 hover:text-white">Network</a>
              <a href="/add" className="text-zinc-400 hover:text-white">+ Add</a>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
