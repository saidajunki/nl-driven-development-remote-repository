import { describe, it, expect } from 'vitest';
import { parseBasicAuth } from './git-auth';

describe('Git 認証', () => {
  // 仕様: specs/auth-pat.md - Git push の認証方式

  describe('parseBasicAuth', () => {
    it('正しい Basic 認証ヘッダーをパースする', () => {
      // "user:password" を Base64 エンコード
      const encoded = Buffer.from('testuser:testpassword').toString('base64');
      const result = parseBasicAuth(`Basic ${encoded}`);

      expect(result).toEqual({
        username: 'testuser',
        password: 'testpassword',
      });
    });

    it('null ヘッダーを拒否する', () => {
      expect(parseBasicAuth(null)).toBeNull();
    });

    it('Basic 以外のスキームを拒否する', () => {
      expect(parseBasicAuth('Bearer token123')).toBeNull();
    });

    it('不正な形式を拒否する', () => {
      // コロンがない
      const encoded = Buffer.from('invalidformat').toString('base64');
      expect(parseBasicAuth(`Basic ${encoded}`)).toBeNull();
    });

    it('空のユーザー名を拒否する', () => {
      const encoded = Buffer.from(':password').toString('base64');
      expect(parseBasicAuth(`Basic ${encoded}`)).toBeNull();
    });

    it('空のパスワードを拒否する', () => {
      const encoded = Buffer.from('user:').toString('base64');
      expect(parseBasicAuth(`Basic ${encoded}`)).toBeNull();
    });
  });
});
