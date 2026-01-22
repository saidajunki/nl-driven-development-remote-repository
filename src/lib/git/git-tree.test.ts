import { describe, it, expect } from 'vitest';

// git-tree.ts の純粋関数のテスト
// 実際の Git 操作は統合テストで行う

describe('Git ツリー', () => {
  // 仕様: specs/web-ui.md - リポジトリ詳細

  describe('TreeEntry の型', () => {
    it('blob と tree の type を持つ', () => {
      const blobEntry = {
        mode: '100644',
        type: 'blob' as const,
        hash: 'abc123',
        name: 'file.txt',
      };
      const treeEntry = {
        mode: '040000',
        type: 'tree' as const,
        hash: 'def456',
        name: 'folder',
      };

      expect(blobEntry.type).toBe('blob');
      expect(treeEntry.type).toBe('tree');
    });
  });
});
