import { Manrope, Unbounded } from 'next/font/google';
import './globals.css';

const manrope = Manrope({ subsets: ['latin', 'cyrillic'], weight: ['400', '500', '600', '700'], variable: '--font-body' });
const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'], weight: ['500', '700'], variable: '--font-display' });

export const metadata = {
  title: 'Онлайн-заказы для ресторанов — демо',
  description: 'Демо: сайт ресторана с онлайн-заказом и панель ресторана.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={`${manrope.variable} ${unbounded.variable}`}>
      <body>{children}</body>
    </html>
  );
}
