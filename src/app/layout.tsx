import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import LocationStatusBar from "@/components/LocationStatus";
import ClientComponents from "@/components/ClientComponents";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "八丈掲示板",
  description: "八丈島の地域掲示板",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-slate-50`}>
        <header className="bg-gradient-to-r from-slate-800 to-slate-700 border-b-4 border-blue-600 shadow-lg">
          <div className="container mx-auto px-4 h-18 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-white flex items-center gap-3">
              <div className="bg-white p-2 rounded-full">
                <span className="text-2xl text-slate-800">八</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold">八丈掲示板</span>
              </div>
            </Link>

            {/* デスクトップナビゲーション */}
            <nav className="hidden md:flex items-center gap-2">
              <Link
                href="/"
                className="px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
              >
ホーム
              </Link>
              <Link
                href="/location"
                className="px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
              >
位置情報
              </Link>
              {/* 通常投稿ボタンを一時非表示 */}
              {/* 
              <Link
                href="/new"
                className="px-4 py-2.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-md"
              >
投稿する
              </Link>
              */}
              <Link
                href="/disaster/new"
                className="px-4 py-2.5 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors shadow-md"
              >
🆘 リクエスト機能
              </Link>
            </nav>

            {/* モバイル用右側 */}
            <div className="flex items-center gap-2">
              <ClientComponents />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        {/* フローティング位置情報ステータス */}
        <LocationStatusBar />
        {/* フッター一時非表示
        <footer className="bg-slate-800 text-slate-300 py-8 border-t-4 border-blue-600">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div>
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    八丈掲示板
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    八丈島<br/>
                    情報交換プラットフォーム
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-3">サイト情報</h4>
                  <ul className="text-sm text-slate-400 space-y-2">
                    <li><a href="/about" className="hover:text-white transition-colors">• このサイトについて</a></li>
                    <li><a href="/terms" className="hover:text-white transition-colors">• 利用規約</a></li>
                    <li><a href="/privacy" className="hover:text-white transition-colors">• プライバシーポリシー</a></li>
                    <li><a href="/contact" className="hover:text-white transition-colors">• お問い合わせ</a></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-slate-600 pt-6 text-center">
                <p className="text-sm text-slate-400">
                  © 2025 八丈島地域コミュニティ掲示板
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  本サービスは地域コミュニティの発展を目的としています
                </p>
              </div>
            </div>
          </div>
        </footer>
        */}
      </body>
    </html>
  );
}
