/**
 * TransitOps – State Manager
 * Lightweight reactive state for page-level data management.
 */

const StateManager = (() => {

  /**
   * Create a new state store.
   * @param {object} initialState
   * @returns {object} Store with get, set, subscribe, reset methods
   */
  function createStore(initialState = {}) {
    let state = { ...initialState };
    const listeners = new Set();

    function get(key) {
      return key ? state[key] : { ...state };
    }

    function set(updates) {
      const prev = { ...state };
      state = { ...state, ...updates };
      listeners.forEach((fn) => fn(state, prev));
    }

    function subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    }

    function reset() {
      const prev = { ...state };
      state = { ...initialState };
      listeners.forEach((fn) => fn(state, prev));
    }

    return { get, set, subscribe, reset };
  }

  return { createStore };
})();
