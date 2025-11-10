import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import LocationStatusBar from "@/components/LocationStatus";
import ClientComponents from "@/components/ClientComponents";
import MobileContextSwitcher from "@/components/MobileContextSwitcher";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "八丈島あすなろボランティア窓口",
  description: "八丈島あすなろボランティア窓口",
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
            <Link href="/" className="text-xl font-bold text-white flex items-center gap-2 md:gap-3">
              <div className="bg-white p-1.5 md:p-2 rounded-full">
                <span className="text-xl md:text-2xl text-slate-800">八</span>
              </div>
              <div className="flex flex-col">
                {/* 大画面: フルタイトル */}
                <span className="hidden lg:block text-base lg:text-lg font-bold">八丈島あすなろボランティア窓口</span>
                {/* 中画面: 短縮版 */}
                <span className="hidden md:block lg:hidden text-sm md:text-base font-bold">八丈島ボランティア窓口</span>
                {/* 小画面: 改行して表示 */}
                <span className="block md:hidden text-xs font-bold leading-tight">
                  八丈島あすなろ<br />ボランティア窓口
                </span>
              </div>
            </Link>

            {/* デスクトップナビゲーション */}
            <nav className="hidden md:flex items-center gap-2">
              <Link
                href="/"
                className="px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
              >
🆘 支援リクエスト
              </Link>
              <Link
                href="/offer"
                className="px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
              >
🎁 物資提供情報
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
                className="px-3 lg:px-4 py-2.5 text-xs lg:text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors shadow-md whitespace-nowrap"
              >
                {/* 大画面: フルテキスト */}
                <span className="hidden lg:inline">🆘 リクエスト機能</span>
                {/* 中画面: 短縮版 */}
                <span className="inline lg:hidden">🆘 要請</span>
              </Link>

              <Link
                href="/offer/new"
                className="px-3 lg:px-4 py-2.5 text-xs lg:text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-md whitespace-nowrap"
              >
                <span className="hidden lg:inline">📦 物資掲載</span>
                <span className="inline lg:hidden">📦 物資</span>
              </Link>
            </nav>

            {/* モバイル用右側 */}
            <div className="flex items-center gap-2">
              <ClientComponents />
            </div>
          </div>
        </header>
        {/* モバイル専用の小型切替ナビ */}
        <MobileContextSwitcher />
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
                    八丈島あすなろボランティア窓口
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    八丈島<br/>
                    ボランティア情報窓口
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
                  © 2025 八丈島あすなろボランティア窓口
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  本サービスは地域コミュニティのボランティア活動を支援します
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
