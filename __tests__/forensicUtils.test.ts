import { formatINR, tagId, daysAgo, cn } from '@/lib/utils';

describe('Forensic Utility Functions (lib/utils.ts)', () => {
  describe('formatINR', () => {
    it('formats numbers into Indian Rupee currency format without decimals', () => {
      const formatted = formatINR(18500);
      expect(formatted).toContain('18,500');
      expect(formatted).toContain('₹');
    });

    it('formats 0 as ₹0', () => {
      const formatted = formatINR(0);
      expect(formatted).toContain('0');
      expect(formatted).toContain('₹');
    });

    it('formats large numbers into lakhs/crores standard formatting', () => {
      const formatted = formatINR(3550000);
      expect(formatted).toContain('35,50,000');
    });
  });

  describe('tagId', () => {
    it('generates uppercase IDs with the requested prefix', () => {
      const id = tagId('RM');
      expect(id.startsWith('RM-')).toBe(true);
      expect(id).toMatch(/^RM-[0-9A-F]{5}$/);
    });

    it('defaults to TAG prefix when none provided', () => {
      const id = tagId();
      expect(id.startsWith('TAG-')).toBe(true);
    });

    it('generates unique IDs across calls', () => {
      const id1 = tagId('TEN');
      const id2 = tagId('TEN');
      expect(id1).not.toEqual(id2);
    });
  });

  describe('daysAgo', () => {
    it('returns a valid YYYY-MM-DD date string', () => {
      const dateStr = daysAgo(5);
      expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('returns today for 0 days ago', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(daysAgo(0)).toBe(today);
    });
  });

  describe('cn', () => {
    it('merges class names and handles conditional classes properly', () => {
      expect(cn('base', true && 'active', false && 'hidden')).toBe('base active');
    });
  });
});
