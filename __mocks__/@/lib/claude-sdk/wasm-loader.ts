export const useWasmLoader = jest.fn(() => ({
  initialize: jest.fn().mockResolvedValue(undefined),
  isReady: true,
  isLoading: false,
  error: null,
  isSupported: true,
  allocateMemory: jest.fn((size: number) => 1000),
  freeMemory: jest.fn(),
  compile: jest.fn().mockResolvedValue({ success: true, output: 'compiled' }),
  execute: jest.fn().mockResolvedValue({ success: true, result: 42 }),
  getMemoryStats: jest.fn(() => ({
    totalMemory: 16777216,
    usedMemory: 8388608,
    freeMemory: 8388608,
    allocations: 10,
    totalAllocated: 1048576,
  })),
  getPerformanceMetrics: jest.fn(() => ({
    initializationTime: 250,
    compilations: 5,
    averageCompilationTime: 100,
    executions: 10,
    averageExecutionTime: 50,
  })),
}));

export const cleanupWasmLoader = jest.fn();