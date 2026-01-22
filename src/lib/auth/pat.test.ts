import { describe, it, expect } from 'vitest';
import { generatePat, hashPat, isValidPatFormat } from './pat';

describe('PAT ユーティリティ', () => {
  // 仕様: specs/auth-pat.md - PAT 発行

  describe('generatePat', () => {
    it('プレフィックス nldr_ で始まる PAT を生成する', () => {
      const pat = generatePat();
      expect(pat.startsWith('nldr_')).toBe(true);
    });

    it('毎回異なる PAT を生成する', () => {
      const pat1 = generatePat();
      const pat2 = generatePat();
      expect(pat1).not.toBe(pat2);
    });

    it('正しい長さの PAT を生成する', () => {
      const pat = generatePat();
      // nldr_ (5文字) + 64文字（32バイトの16進数）= 69文字
      expect(pat.length).toBe(69);
    });
  });

  describe('hashPat', () => {
    it('同じ PAT は同じハッシュになる', () => {
      const pat = 'nldr_test1234567890abcdef1234567890abcdef1234567890abcdef12345678';
      const hash1 = hashPat(pat);
      const hash2 = hashPat(pat);
      expect(hash1).toBe(hash2);
    });

    it('異なる PAT は異なるハッシュになる', () => {
      const pat1 = 'nldr_test1234567890abcdef1234567890abcdef1234567890abcdef12345678';
      const pat2 = 'nldr_test1234567890abcdef1234567890abcdef1234567890abcdef12345679';
      const hash1 = hashPat(pat1);
      const hash2 = hashPat(pat2);
      expect(hash1).not.toBe(hash2);
    });

    it('SHA-256 ハッシュ（64文字の16進数）を返す', () => {
      const pat = generatePat();
      const hash = hashPat(pat);
      expect(hash.length).toBe(64);
      expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
    });
  });

  describe('isValidPatFormat', () => {
    it('正しい形式の PAT を受け入れる', () => {
      const pat = generatePat();
      expect(isValidPatFormat(pat)).toBe(true);
    });

    it('プレフィックスがない PAT を拒否する', () => {
      const invalidPat = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      expect(isValidPatFormat(invalidPat)).toBe(false);
    });

    it('短すぎる PAT を拒否する', () => {
      const shortPat = 'nldr_short';
      expect(isValidPatFormat(shortPat)).toBe(false);
    });

    it('不正な文字を含む PAT を拒否する', () => {
      const invalidPat = 'nldr_ZZZZ567890abcdef1234567890abcdef1234567890abcdef12345678';
      expect(isValidPatFormat(invalidPat)).toBe(false);
    });
  });
});
