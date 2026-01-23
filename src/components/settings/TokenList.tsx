'use client';

import { useState } from 'react';
import type { PatInfo } from '@/lib/auth/pat-service';

/**
 * PAT 一覧
 * 仕様: specs/auth-pat.md - PAT 作成/一覧/失効
 */

interface Props {
  initialPats: PatInfo[];
}

export function TokenList({ initialPats }: Props) {
  const [pats, setPats] = useState(initialPats);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleRevoke = async (id: string) => {
    if (!confirm('このトークンを失効させますか？この操作は取り消せません。')) {
      return;
    }

    setDeletingId(id);

    try {
      const res = await fetch(`/api/pats/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setPats(pats.filter((p) => p.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (pats.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-8 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <p className="text-gray-500">トークンがありません</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm divide-y divide-gray-100">
      {pats.map((pat) => {
        const isExpired = pat.expiresAt && new Date(pat.expiresAt) < new Date();

        return (
          <div key={pat.id} className="p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{pat.name}</span>
                {isExpired && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                    期限切れ
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                <span>
                  作成: {new Date(pat.createdAt).toLocaleDateString('ja-JP')}
                </span>
                {pat.expiresAt && (
                  <span>
                    期限: {new Date(pat.expiresAt).toLocaleDateString('ja-JP')}
                  </span>
                )}
                {pat.lastUsedAt && (
                  <span>
                    最終使用: {new Date(pat.lastUsedAt).toLocaleDateString('ja-JP')}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => handleRevoke(pat.id)}
              disabled={deletingId === pat.id}
              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              {deletingId === pat.id ? '削除中...' : '失効'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
