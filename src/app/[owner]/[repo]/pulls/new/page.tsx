'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/ui/Header';

/**
 * Pull Request 作成ページ
 * 仕様: specs/pull-request.md
 */

interface Branch {
  name: string;
  isDefault: boolean;
}

export default function NewPullRequestPage() {
  const router = useRouter();
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const [branches, setBranches] = useState<Branch[]>([]);
  const [sourceBranch, setSourceBranch] = useState('');
  const [targetBranch, setTargetBranch] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [repoId, setRepoId] = useState('');

  useEffect(() => {
    // リポジトリ情報とブランチ一覧を取得
    async function fetchData() {
      try {
        const repoRes = await fetch(`/api/repositories?owner=${owner}&name=${repo}`);
        const repoData = await repoRes.json();
        const repository = repoData.repositories?.[0];
        if (repository) {
          setRepoId(repository.id);

          const branchRes = await fetch(`/api/repositories/${repository.id}/branches`);
          const branchData = await branchRes.json();
          setBranches(branchData.branches || []);

          const defaultBranch = branchData.branches?.find((b: Branch) => b.isDefault);
          if (defaultBranch) {
            setTargetBranch(defaultBranch.name);
          }
        }
      } catch {
        setError('データの取得に失敗しました');
      }
    }
    fetchData();
  }, [owner, repo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !sourceBranch || !targetBranch) {
      setError('必須項目を入力してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/repositories/${repoId}/pulls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          sourceBranch,
          targetBranch,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'PR の作成に失敗しました');
      }

      const data = await res.json();
      router.push(`/${owner}/${repo}/pull/${data.pullRequest.number}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href={`/${owner}/${repo}`} className="hover:text-blue-600">
              {owner}/{repo}
            </Link>
            <span>/</span>
            <Link href={`/${owner}/${repo}/pulls`} className="hover:text-blue-600">
              pulls
            </Link>
            <span>/</span>
            <span>new</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">New Pull Request</h1>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ブランチ選択 */}
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base
                </label>
                <select
                  value={targetBranch}
                  onChange={(e) => setTargetBranch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  {branches.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-gray-400 pt-6">←</div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compare
                </label>
                <select
                  value={sourceBranch}
                  onChange={(e) => setSourceBranch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  {branches
                    .filter((b) => b.name !== targetBranch)
                    .map((b) => (
                      <option key={b.name} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* タイトル・説明 */}
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                タイトル
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="PR のタイトル"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明（オプション）
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="変更内容の説明"
                rows={6}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Link
              href={`/${owner}/${repo}/pulls`}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '作成中...' : 'Create Pull Request'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
