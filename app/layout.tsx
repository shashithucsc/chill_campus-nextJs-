import "@/styles/globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: 'Chill Campus',
  description: 'Your campus social platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
} 