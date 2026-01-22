import { describe, it, expect } from 'vitest';
import { getRepoPath, getGitUrl } from './git-service';

describe('Git サービス', () => {
  // 仕様: specs/git-service.md

  describe('getRepoPath', () => {
    it('正しいパスを生成する', () => {
      const path = getRepoPath('testuser', 'myrepo');
      expect(path).toMatch(/testuser\/myrepo\.git$/);
    });
  });

  describe('getGitUrl', () => {
    it('正しい Git URL を生成する', () => {
      const url = getGitUrl('example.com', 'testuser', 'myrepo');
      expect(url).toBe('https://example.com/testuser/myrepo.git');
    });
  });
});
