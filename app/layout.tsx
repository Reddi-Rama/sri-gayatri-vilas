import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sreegayatrivilas.in"),
  title: {
    default: "Sri Gayatri Vilas | Vizianagaram",
    template: "%s | Sri Gayatri Vilas",
  },
  description:
    "A table full of goodness in Vizianagaram. Explore the menu and order from Sri Gayatri Vilas.",
  applicationName: "Sri Gayatri Vilas",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "SGV",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#180706",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
