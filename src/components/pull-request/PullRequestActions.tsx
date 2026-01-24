'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  repositoryId: string;
  prNumber: number;
  owner: string;
  repo: string;
}

export function PullRequestActions({ repositoryId, prNumber, owner, repo }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMerge = async (method: 'merge' | 'squash') => {
    if (!confirm(`この PR を${method === 'squash' ? 'squash ' : ''}マージしますか？`)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/repositories/${repositoryId}/pulls/${prNumber}/merge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mergeMethod: method }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'マージに失敗しました');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    if (!confirm('この PR をクローズしますか？')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/repositories/${repositoryId}/pulls/${prNumber}/close`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'クローズに失敗しました');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-4 mb-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleMerge('merge')}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          Merge
        </button>
        <button
          onClick={() => handleMerge('squash')}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          Squash and Merge
        </button>
        <button
          onClick={handleClose}
          disabled={loading}
          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          Close
        </button>
      </div>
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
