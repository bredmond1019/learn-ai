export const useWasmMemory = jest.fn(() => ({
  createPool: jest.fn((id: string, initialSize: number, maxSize: number) => ({
    id,
    initialSize,
    maxSize,
    currentSize: initialSize,
    usedSize: 0,
    allocations: 0,
  })),
  removePool: jest.fn(() => true),
  getPool: jest.fn((id: string) => ({
    id,
    initialSize: 1024,
    maxSize: 4096,
    currentSize: 1024,
    usedSize: 512,
    allocations: 5,
    allocationsList: [],
  })),
  getAllPools: jest.fn(() => []),
  allocate: jest.fn((poolId: string, size: number) => ({
    id: `alloc-${Date.now()}`,
    poolId,
    size,
    offset: 0,
  })),
  deallocate: jest.fn(() => true),
  defragment: jest.fn().mockResolvedValue({
    movedAllocations: 3,
    freedBytes: 512,
  }),
  getPoolStats: jest.fn((poolId: string) => ({
    totalSize: 1024,
    usedSize: 512,
    freeSize: 512,
    allocations: 5,
    fragmentation: 0.1,
    utilization: 0.5,
  })),
  getGlobalStats: jest.fn(() => ({
    totalPools: 2,
    totalMemory: 2048,
    totalUsed: 1024,
    totalFree: 1024,
    totalAllocations: 10,
  })),
}));

export const cleanupWasmMemory = jest.fn();