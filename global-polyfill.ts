// Create a global object if it doesn't exist
if (typeof global === 'undefined') {
    (window as any).global = window;
  }
  