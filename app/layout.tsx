import type { Metadata } from "next";
import { Geist, Geist_Mono, Nanum_Gothic } from "next/font/google";
import "./globals.css";

const nanumGothic = Nanum_Gothic({
  weight: ['400', '700', '800'],
  subsets: ['latin'],
  variable: '--font-nanum-gothic',
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "성경 구절 찾기 - 음성 검색",
  description: "음성 인식을 통해 성경 구절을 검색하는 서비스",
  // 크롬 음성 인식 성능 향상
  other: {
    'speech-synthesis-voices': 'ko-KR'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${nanumGothic.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
