'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 新規リポジトリ作成フォーム
 * 仕様: specs/git-service.md
 */

interface Props {
  userName: string;
}

export function NewRepositoryForm({ userName }: Props) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidName = /^[a-zA-Z0-9_-]{1,100}$/.test(name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/repositories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, isPublic }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'エラーが発生しました');
        return;
      }

      // 作成したリポジトリページへ遷移
      router.push(`/${userName}/${name}`);
    } catch {
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* リポジトリ名 */}
      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          リポジトリ名 <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">{userName} /</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="my-repository"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            required
          />
        </div>
        {name && !isValidName && (
          <p className="mt-2 text-sm text-red-500">
            英数字、ハイフン、アンダースコアのみ使用できます（1〜100文字）
          </p>
        )}
        <p className="mt-2 text-sm text-gray-500">
          リポジトリ名は後から変更できません
        </p>
      </div>

      {/* 説明 */}
      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          説明（任意）
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="このリポジトリの説明を入力..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
          maxLength={500}
        />
      </div>

      {/* 公開設定 */}
      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          公開設定
        </label>
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="radio"
              name="visibility"
              checked={isPublic}
              onChange={() => setIsPublic(true)}
              className="mt-1"
            />
            <div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-gray-900">Public</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                誰でも閲覧・クローンできます
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="radio"
              name="visibility"
              checked={!isPublic}
              onChange={() => setIsPublic(false)}
              className="mt-1"
            />
            <div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-medium text-gray-900">Private</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                あなただけがアクセスできます
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      {/* 送信ボタン */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={!name || !isValidName || isLoading}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '作成中...' : 'リポジトリを作成'}
        </button>
      </div>
    </form>
  );
}
