import './globals.css';
import { Source_Sans_3 } from 'next/font/google';
import Header from '@/components/Header';

const font = Source_Sans_3({ subsets: ['latin'], weight: ['400', '600', '700'] });
const name = process.env.NEXT_PUBLIC_SITE_NAME || 'BubbaBlox';

export const metadata = { title: name, description: `${name} - build, play and hang out.` };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={font.className}>
        <Header />
        <main className="wrap">{children}</main>
      </body>
    </html>
  );
}
