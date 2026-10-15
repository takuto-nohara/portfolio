import { AdminIcon } from "./AdminIcon";
import { adminPrimaryButton } from "./adminStyles";

interface OAuthConsentCardProps {
  readonly clientName?: string;
  readonly redirectHost?: string;
  readonly accountEmail?: string;
  readonly scopes?: readonly { readonly name: string; readonly description: string }[];
  /** 認可の要求（同意のフォームでそのまま送り返す） */
  readonly fields?: Readonly<Record<string, string | undefined>>;
  readonly error?: string;
}

/** OAuth の同意カード。許可するとサーバーが認可コードを作り、AI ツールの戻り先へ移動する */
export function OAuthConsentCard({ clientName, redirectHost, accountEmail, scopes = [], fields = {}, error }: OAuthConsentCardProps) {
  return (
    <section className="relative w-full max-w-[460px] animate-[rise_0.5s_var(--ease-out)_both] rounded border border-line bg-white px-6 pt-9 pb-7 shadow-[0_30px_80px_rgba(12,31,46,0.08)] sm:px-9">
      <p className="m-0 font-mono text-xs tracking-[0.08em] text-ink-muted">$ mcp connect</p>
      {error ? (
        <>
          <h1 className="mt-2 mb-0 text-xl font-bold">接続できません</h1>
          <p className="mt-3 mb-0 flex items-start gap-2 rounded border border-red-200 bg-red-50 p-3 text-[13px] text-red-800">
            <AdminIcon name="circle-alert" className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
          <p className="mt-3 mb-0 text-xs text-ink-muted">AI ツールの側から接続をやり直してください。</p>
        </>
      ) : (
        <>
          <h1 className="mt-2 mb-0 text-xl leading-normal font-bold">
            「{clientName}」がポートフォリオの管理を求めています
          </h1>
          <p className="mt-2 mb-0 text-[13px] leading-[1.8] text-ink-body">
            許可すると、この AI ツールが <span className="font-mono">{accountEmail}</span> として次の操作を行えるようになります。
          </p>
          <ul className="mt-4 mb-0 grid list-none gap-2 p-0">
            {scopes.map((scope) => (
              <li key={scope.name} className="flex items-start gap-2.5 rounded border border-line bg-panel px-3 py-2.5">
                <AdminIcon name="shield-check" className="mt-0.5 h-4 w-4 shrink-0 text-link" />
                <span>
                  <span className="block font-mono text-xs text-ink-muted">{scope.name}</span>
                  <span className="text-[13px]">{scope.description}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 mb-0 text-xs leading-[1.7] text-ink-muted">
            戻り先: <span className="font-mono">{redirectHost}</span>。接続はサイト設定の「MCP 連携」からいつでも解除できます。
          </p>
          <form action="/api/oauth/authorize" method="post" className="mt-6 flex justify-end gap-2">
            {Object.entries(fields).map(([name, value]) => (value === undefined ? null : <input key={name} type="hidden" name={name} value={value} />))}
            <button type="submit" name="decision" value="deny" className="h-11 cursor-pointer rounded border-0 bg-transparent px-4 text-sm font-medium text-ink-body hover:bg-panel">
              拒否
            </button>
            <button type="submit" name="decision" value="allow" className={adminPrimaryButton}>
              許可する
            </button>
          </form>
        </>
      )}
    </section>
  );
}
