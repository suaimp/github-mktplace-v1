import { describe, it, expect } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { useChatColumnVisibility } from '../useChatColumnVisibility';

describe('useChatColumnVisibility', () => {
  it('should show chat column when payment status is not "pending"', () => {
    const { result } = renderHook(() => useChatColumnVisibility('paid'));
    expect(result.current.shouldShowChatColumn).toBe(true);
  });

  it('should hide chat column when payment status is "pending"', () => {
    const { result } = renderHook(() => useChatColumnVisibility('pending'));
    expect(result.current.shouldShowChatColumn).toBe(false);
  });

  it('should show chat column when payment status is undefined', () => {
    const { result } = renderHook(() => useChatColumnVisibility(undefined));
    expect(result.current.shouldShowChatColumn).toBe(true);
  });

  it('should show chat column when payment status is empty string', () => {
    const { result } = renderHook(() => useChatColumnVisibility(''));
    expect(result.current.shouldShowChatColumn).toBe(true);
  });

  it('should show chat column for other payment statuses', () => {
    const testCases = ['paid', 'cancelled', 'processing', 'error'];
    
    testCases.forEach(status => {
      const { result } = renderHook(() => useChatColumnVisibility(status));
      expect(result.current.shouldShowChatColumn).toBe(true);
    });
  });
});
