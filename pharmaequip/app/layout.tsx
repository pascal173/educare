import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";



const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'EduCare Medical Supplies',
  description: 'First aid kits, nursing training kits, and medical supplies in Asaba, Delta State.',
  icons: { icon: '/logo.png' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} text-black bg-gray-50`}>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
