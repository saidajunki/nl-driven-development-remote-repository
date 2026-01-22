import { describe, it, expect } from 'vitest';
import { isValidRepositoryName } from './repository-service';

describe('リポジトリサービス', () => {
  // 仕様: specs/git-service.md

  describe('isValidRepositoryName', () => {
    it('英数字のみの名前を受け入れる', () => {
      expect(isValidRepositoryName('myrepo')).toBe(true);
      expect(isValidRepositoryName('MyRepo123')).toBe(true);
    });

    it('ハイフンとアンダースコアを含む名前を受け入れる', () => {
      expect(isValidRepositoryName('my-repo')).toBe(true);
      expect(isValidRepositoryName('my_repo')).toBe(true);
      expect(isValidRepositoryName('my-repo_123')).toBe(true);
    });

    it('空の名前を拒否する', () => {
      expect(isValidRepositoryName('')).toBe(false);
    });

    it('101文字以上の名前を拒否する', () => {
      const longName = 'a'.repeat(101);
      expect(isValidRepositoryName(longName)).toBe(false);
    });

    it('100文字の名前を受け入れる', () => {
      const maxName = 'a'.repeat(100);
      expect(isValidRepositoryName(maxName)).toBe(true);
    });

    it('特殊文字を含む名前を拒否する', () => {
      expect(isValidRepositoryName('my.repo')).toBe(false);
      expect(isValidRepositoryName('my/repo')).toBe(false);
      expect(isValidRepositoryName('my repo')).toBe(false);
      expect(isValidRepositoryName('my@repo')).toBe(false);
    });

    it('日本語を含む名前を拒否する', () => {
      expect(isValidRepositoryName('リポジトリ')).toBe(false);
      expect(isValidRepositoryName('repo日本語')).toBe(false);
    });
  });
});
