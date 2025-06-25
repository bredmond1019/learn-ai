// Web Worker for WASM compilation and execution
// This prevents blocking the main UI thread during heavy computations

let wasmModule = null;
let wasmInstance = null;
let memory = null;

// Message handler
self.addEventListener('message', async (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'INIT':
      await handleInit(payload);
      break;
    
    case 'COMPILE':
      await handleCompile(payload);
      break;
    
    case 'EXECUTE':
      await handleExecute(payload);
      break;
    
    case 'CLEAR':
      handleClear();
      break;
    
    default:
      self.postMessage({
        type: 'ERROR',
        error: `Unknown message type: ${type}`
      });
  }
});

// Initialize the worker
async function handleInit(payload) {
  try {
    // Initialize WebAssembly support check
    if (typeof WebAssembly === 'undefined') {
      throw new Error('WebAssembly is not supported');
    }

    // Create initial memory
    memory = new WebAssembly.Memory({
      initial: 256, // 16MB
      maximum: 4096, // 256MB
    });

    self.postMessage({
      type: 'INIT_SUCCESS',
      result: {
        supported: true,
        memory: {
          initial: memory.buffer.byteLength,
          maximum: 4096 * 65536,
        }
      }
    });

  } catch (error) {
    self.postMessage({
      type: 'INIT_ERROR',
      error: error.message
    });
  }
}

// Compile WASM module
async function handleCompile(payload) {
  const { wasmBytes, moduleId } = payload;
  
  try {
    const startTime = performance.now();

    // Compile the WebAssembly module
    wasmModule = await WebAssembly.compile(wasmBytes);
    
    // Prepare imports
    const imports = {
      env: {
        memory,
        // Console functions for Rust's println!
        print: (ptr, len) => {
          const bytes = new Uint8Array(memory.buffer, ptr, len);
          const text = new TextDecoder().decode(bytes);
          self.postMessage({
            type: 'CONSOLE_LOG',
            message: text
          });
        },
        eprint: (ptr, len) => {
          const bytes = new Uint8Array(memory.buffer, ptr, len);
          const text = new TextDecoder().decode(bytes);
          self.postMessage({
            type: 'CONSOLE_ERROR',
            message: text
          });
        },
        // Abort handler
        abort: (msg, file, line, column) => {
          self.postMessage({
            type: 'ABORT',
            error: `Abort at ${file}:${line}:${column}`,
          });
        },
        // Memory allocation functions
        __wbindgen_malloc: (size) => {
          // Simple bump allocator
          const ptr = memory.buffer.byteLength;
          memory.grow(Math.ceil(size / 65536));
          return ptr;
        },
        __wbindgen_free: (ptr, size) => {
          // No-op for simple allocator
        },
      },
      wasi_snapshot_preview1: {
        // WASI functions for Rust std
        fd_write: (fd, iovs_ptr, iovs_len, nwritten_ptr) => {
          // Simplified stdout handling
          return 0;
        },
        fd_close: (fd) => 0,
        fd_seek: (fd, offset, whence, newoffset_ptr) => 0,
        environ_get: (environ, environ_buf) => 0,
        environ_sizes_get: (environCount_ptr, environBufSize_ptr) => {
          // No environment variables
          const view = new DataView(memory.buffer);
          view.setUint32(environCount_ptr, 0, true);
          view.setUint32(environBufSize_ptr, 0, true);
          return 0;
        },
        proc_exit: (code) => {
          self.postMessage({
            type: 'EXIT',
            code
          });
        },
      },
    };

    // Instantiate the module
    wasmInstance = await WebAssembly.instantiate(wasmModule, imports);

    const compilationTime = performance.now() - startTime;

    self.postMessage({
      type: 'COMPILE_SUCCESS',
      result: {
        moduleId,
        compilationTime,
        exports: Object.keys(wasmInstance.exports),
      }
    });

  } catch (error) {
    self.postMessage({
      type: 'COMPILE_ERROR',
      error: error.message
    });
  }
}

// Execute WASM function
async function handleExecute(payload) {
  const { functionName = 'main', args = [] } = payload;

  if (!wasmInstance) {
    self.postMessage({
      type: 'EXECUTE_ERROR',
      error: 'No compiled module available'
    });
    return;
  }

  try {
    const startTime = performance.now();
    const startMemory = memory.buffer.byteLength;

    // Check if function exists
    if (!(functionName in wasmInstance.exports)) {
      throw new Error(`Function '${functionName}' not found in module exports`);
    }

    // Execute the function
    const fn = wasmInstance.exports[functionName];
    let result;

    // Handle different function signatures
    if (typeof fn === 'function') {
      result = await fn(...args);
    } else {
      throw new Error(`Export '${functionName}' is not a function`);
    }

    const executionTime = performance.now() - startTime;
    const memoryUsed = memory.buffer.byteLength - startMemory;

    self.postMessage({
      type: 'EXECUTE_SUCCESS',
      result: {
        output: result,
        executionTime,
        memoryUsed,
      }
    });

  } catch (error) {
    self.postMessage({
      type: 'EXECUTE_ERROR',
      error: error.message
    });
  }
}

// Clear resources
function handleClear() {
  wasmModule = null;
  wasmInstance = null;
  
  // Reset memory
  if (memory) {
    memory = new WebAssembly.Memory({
      initial: 256,
      maximum: 4096,
    });
  }

  self.postMessage({
    type: 'CLEAR_SUCCESS'
  });
}

// Error boundary
self.addEventListener('error', (event) => {
  self.postMessage({
    type: 'WORKER_ERROR',
    error: event.message
  });
});

self.addEventListener('unhandledrejection', (event) => {
  self.postMessage({
    type: 'WORKER_ERROR',
    error: event.reason
  });
});