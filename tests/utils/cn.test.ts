import { describe, it, expect } from 'vitest';
import { cn } from '../../src/utils/cn';

describe('cn utility', () => {
  it('should join multiple string classes', () => {
    expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz');
  });

  it('should filter out falsy values', () => {
    expect(cn('foo', null, undefined, false, '', 0, 'bar')).toBe('foo bar');
  });

  it('should handle nested arrays', () => {
    expect(cn('foo', ['bar', 'baz'])).toBe('foo bar baz');
  });

  it('should handle deeply nested arrays', () => {
    expect(cn('a', ['b', ['c', 'd']])).toBe('a b c d');
  });

  it('should return empty string for empty input', () => {
    expect(cn()).toBe('');
  });

  it('should return empty string for all falsy inputs', () => {
    expect(cn(null, undefined, false, '')).toBe('');
  });

  it('should handle number values', () => {
    expect(cn('foo', 42)).toBe('foo 42');
  });
});
