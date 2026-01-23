'use client';

import { useState } from 'react';

/**
 * PAT 作成フォーム
 * 仕様: specs/auth-pat.md - PAT は作成時にランダム生成し、平文は作成時に 1 回だけ表示
 */

export function CreateTokenForm() {
  const [name, setName] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreatedToken(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/pats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          expiresInDays: expiresInDays || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'エラーが発生しました');
        return;
      }

      // 作成成功: トークンを表示
      setCreatedToken(data.token);
      setName('');
      setExpiresInDays('');
    } catch {
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (createdToken) {
      await navigator.clipboard.writeText(createdToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        新しいトークンを作成
      </h2>

      {createdToken ? (
        /* トークン表示（1回のみ） */
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-green-800">トークンが作成されました</p>
                <p className="text-sm text-green-700 mt-1">
                  このトークンは今後表示されません。必ずコピーして安全な場所に保存してください。
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <code className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-sm font-mono break-all">
              {createdToken}
            </code>
            <button
              onClick={handleCopy}
              className="px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
            >
              {copied ? 'コピー済み' : 'コピー'}
            </button>
          </div>

          <button
            onClick={() => {
              setCreatedToken(null);
              window.location.reload();
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            完了
          </button>
        </div>
      ) : (
        /* 作成フォーム */
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              トークン名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: MacBook Pro"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              required
              maxLength={100}
            />
            <p className="mt-1 text-sm text-gray-500">
              このトークンを識別するための名前
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              有効期限（任意）
            </label>
            <select
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="">無期限</option>
              <option value="7">7日</option>
              <option value="30">30日</option>
              <option value="90">90日</option>
              <option value="365">1年</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!name || isLoading}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '作成中...' : 'トークンを作成'}
          </button>
        </form>
      )}
    </div>
  );
}
