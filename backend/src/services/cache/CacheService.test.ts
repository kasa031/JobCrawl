import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CacheService } from './CacheService';

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new CacheService();
    cacheService.clear();
  });

  describe('get and set', () => {
    it('should return null for non-existent key', () => {
      expect(cacheService.get('non-existent')).toBeNull();
    });

    it('should store and retrieve data', () => {
      const testData = { message: 'test', count: 42 };
      cacheService.set('test-key', testData, 60000);
      
      const retrieved = cacheService.get<typeof testData>('test-key');
      expect(retrieved).toEqual(testData);
    });

    it('should return null for expired entries', async () => {
      const testData = { message: 'test' };
      cacheService.set('expired-key', testData, 100); // 100ms TTL
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(cacheService.get('expired-key')).toBeNull();
    });

    it('should use default TTL when not specified', () => {
      const testData = { message: 'test' };
      cacheService.set('default-ttl-key', testData);
      
      const retrieved = cacheService.get('default-ttl-key');
      expect(retrieved).toEqual(testData);
    });
  });

  describe('has', () => {
    it('should return false for non-existent key', () => {
      expect(cacheService.has('non-existent')).toBe(false);
    });

    it('should return true for existing valid key', () => {
      cacheService.set('existing-key', { data: 'test' });
      expect(cacheService.has('existing-key')).toBe(true);
    });

    it('should return false for expired key', async () => {
      cacheService.set('expired-key', { data: 'test' }, 100);
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(cacheService.has('expired-key')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete existing entry', () => {
      cacheService.set('to-delete', { data: 'test' });
      expect(cacheService.has('to-delete')).toBe(true);
      
      cacheService.delete('to-delete');
      expect(cacheService.has('to-delete')).toBe(false);
    });

    it('should handle deleting non-existent key gracefully', () => {
      expect(() => cacheService.delete('non-existent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      cacheService.set('key1', { data: 'test1' });
      cacheService.set('key2', { data: 'test2' });
      
      expect(cacheService.getStats().size).toBe(2);
      
      cacheService.clear();
      
      expect(cacheService.getStats().size).toBe(0);
    });
  });

  describe('clearExpired', () => {
    it('should remove expired entries', async () => {
      cacheService.set('expired1', { data: 'test1' }, 100);
      cacheService.set('expired2', { data: 'test2' }, 100);
      cacheService.set('valid', { data: 'test3' }, 60000);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      cacheService.clearExpired();
      
      const stats = cacheService.getStats();
      expect(stats.size).toBe(1);
      expect(stats.keys).toContain('valid');
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      cacheService.set('key1', { data: 'test1' });
      cacheService.set('key2', { data: 'test2' });
      
      const stats = cacheService.getStats();
      expect(stats.size).toBe(2);
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
    });
  });

  describe('createJobSearchKey', () => {
    it('should create consistent keys for same inputs', () => {
      const key1 = CacheService.createJobSearchKey('developer', 'oslo');
      const key2 = CacheService.createJobSearchKey('developer', 'oslo');
      
      expect(key1).toBe(key2);
    });

    it('should normalize keywords and location', () => {
      const key1 = CacheService.createJobSearchKey('Developer', 'Oslo');
      const key2 = CacheService.createJobSearchKey('developer', 'oslo');
      
      expect(key1).toBe(key2);
    });

    it('should handle empty inputs', () => {
      const key = CacheService.createJobSearchKey('', '');
      expect(key).toBe('job-search:::'); // Empty strings are normalized to empty, resulting in ':::'
    });

    it('should handle undefined inputs', () => {
      const key = CacheService.createJobSearchKey(undefined, undefined);
      expect(key).toBe('job-search:::'); // Undefined becomes empty string, resulting in ':::'
    });
  });
});

