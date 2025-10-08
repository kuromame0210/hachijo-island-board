import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約 - 八丈島掲示板",
  description: "八丈島掲示板の利用規約",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-8 text-center">利用規約</h1>
      
      <div className="bg-white rounded-lg shadow-md p-8 prose prose-slate max-w-none">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">八丈町掲示板（仮） 利用規約</h2>
        
        <p className="mb-6 text-slate-700 leading-relaxed">
          この利用規約（以下、「本規約」といいます。）は、八丈町と[共同運営者名]（以下、総称して「当運営者」といいます。）が提供する八丈島の地域情報プラットフォーム「八丈町掲示板（仮）」（以下、「本サービス」といいます。）の利用に関する条件を定めるものです。本サービスの利用者（以下、「利用者」といいます。）の皆様は、本規約に同意の上、本サービスをご利用ください。
        </p>

        <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">第1条（本規約への同意）</h3>
        <ol className="list-decimal list-inside space-y-2 text-slate-700">
          <li>利用者は、本規約に従って本サービスを利用するものとし、本規約に同意しない限り本サービスを利用することはできません。</li>
          <li>利用者が本サービスを実際に利用した時点で、本規約に同意したものとみなします。</li>
        </ol>

        <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">第2条（定義）</h3>
        <p className="mb-4 text-slate-700">本規約において使用する用語の定義は、以下のとおりとします。</p>
        <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
          <li>「本サービス」：当運営者が提供する「八丈町掲示板」という名称のウェブサイトおよび関連サービス</li>
          <li>「利用者」：本サービスを閲覧するすべての個人および法人</li>
          <li>「投稿者」：第3条に定める所定の承認手続きを完了し、本サービスに情報を投稿する資格を持つ個人および法人</li>
          <li>「投稿情報」：投稿者が本サービスに投稿したテキスト、画像、動画その他一切の情報</li>
        </ul>

        <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">第3条（利用者および投稿者の資格）</h3>
        <ol className="list-decimal list-inside space-y-2 text-slate-700">
          <li>本サービスの利用（閲覧）は、どなたでも可能です。</li>
          <li>本サービスへの情報投稿は、八丈町に在住する個人、または八丈町に事業所を有する法人・団体（以下、「投稿者」といいます。）に限られます。</li>
          <li>投稿者となることを希望する者は、当運営者および八丈町が定める方法（例：役場窓口での本人確認、公的書類の提出、その他指定する認証手続き）により、承認を受ける必要があります。</li>
          <li>承認手続きにおいて、虚偽の申請が判明した場合、または当運営者が不適切と判断した場合には、承認を取り消すことがあります。</li>
        </ol>

        <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">第4条（利用料金）</h3>
        <p className="text-slate-700">
          本サービスの利用は無料とします。ただし、本サービスを利用するために必要な通信機器やインターネット接続料金等は、利用者のご負担となります。
        </p>

        <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">第5条（禁止事項）</h3>
        <p className="mb-4 text-slate-700">利用者は、本サービスの利用にあたり、以下の行為を行ってはなりません。</p>
        <ol className="list-decimal list-inside space-y-2 text-slate-700">
          <li>法令または公序良俗に違反する行為</li>
          <li>犯罪行為に関連する行為</li>
          <li>八丈町および第三者の著作権、商標権等の知的財産権、プライバシー権、名誉権、その他の権利または利益を侵害する行為</li>
          <li>特定の個人や団体を誹謗中傷する行為</li>
          <li>虚偽の情報、または誤解を招くおそれのある情報を投稿する行為</li>
          <li>八丈町に所在しない個人・法人になりすまして投稿する行為</li>
          <li>過度に営利を目的とした宣伝、広告、勧誘行為（当運営者が別途許可した場合を除く）</li>
          <li>政治活動、宗教活動、またはそれらに類する行為</li>
          <li>本サービスのサーバーやネットワーク機能に過度な負荷をかける行為</li>
          <li>本サービスの運営を妨害するおそれのある行為</li>
          <li>その他、当運営者が不適切と判断する行為</li>
        </ol>

        <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">第6条（投稿情報の取り扱い）</h3>
        <ol className="list-decimal list-inside space-y-2 text-slate-700">
          <li>投稿情報の著作権は、投稿者本人に帰属します。</li>
          <li>当運営者は、投稿者が投稿した情報について、内容の正確性、完全性、有用性を保証するものではありません。</li>
          <li>当運営者は、本サービスの円滑な運営、広報、宣伝等を目的として、投稿情報を無償で、期間や地域の制限なく、複製、改変、翻案、公衆送信等の形で利用することができるものとします。利用者はこれを予め許諾するものとします。</li>
          <li>当運営者は、投稿情報が第5条の禁止事項に該当する、またはそのおそれがあると判断した場合、投稿者に通知することなく、当該投稿情報を削除または非表示にする等の措置を講じることができます。</li>
        </ol>

        <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">第7条（免責事項）</h3>
        <ol className="list-decimal list-inside space-y-2 text-slate-700">
          <li>当運営者は、本サービスの内容の変更、中断、終了によって利用者に生じたいかなる損害についても、一切責任を負いません。</li>
          <li>本サービスを通じて利用者間で行われる物品の売買、サービスの提供、交渉、その他の交流に関して生じた一切のトラブルについて、当運営者は関与せず、何らの責任も負いません。当事者間で解決するものとします。</li>
          <li>当運営者は、本サービスの利用により利用者に生じた損害（コンピュータウイルスの感染等を含む）について、当運営者の故意または重過失による場合を除き、一切責任を負いません。</li>
        </ol>

        <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">第8条（個人情報の取り扱い）</h3>
        <p className="text-slate-700">
          当運営者は、本サービスの利用によって取得する個人情報については、別途定める「プライバシーポリシー」に従い、適切に取り扱います。
        </p>

        <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">第9条（規約の変更）</h3>
        <ol className="list-decimal list-inside space-y-2 text-slate-700">
          <li>当運営者は、必要と判断した場合には、利用者に通知することなく、いつでも本規約を変更することができます。</li>
          <li>変更後の本規約は、本サービス上に掲載された時点から効力を生じるものとします。変更後も本サービスの利用を継続した利用者は、変更後の規約に同意したものとみなします。</li>
        </ol>

        <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">第10条（準拠法および管轄裁判所）</h3>
        <ol className="list-decimal list-inside space-y-2 text-slate-700">
          <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
          <li>本サービスに関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</li>
        </ol>
      </div>
    </div>
  );
}