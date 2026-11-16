import { initialState } from "./data.js";

const STORAGE_KEY = "cebu-emergency-finder-demo-v1";

function copyInitialState() {
  return JSON.parse(JSON.stringify(initialState));
}

export function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return copyInitialState();
  try {
    const parsed = JSON.parse(saved);
    if (parsed.version !== 1 || !parsed.state || typeof parsed.state !== "object") {
      return copyInitialState();
    }
    return { ...copyInitialState(), ...parsed.state };
  } catch (error) {
    console.warn("Saved demo data could not be read; starting with demo defaults.", error);
    return copyInitialState();
  }
}

let state = loadState();
const listeners = new Set();

export function getState() {
  return state;
}

export function updateState(updater) {
  state = updater(state);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, state }));
  listeners.forEach((listener) => listener(state));
}

export function resetState() {
  state = copyInitialState();
  localStorage.removeItem(STORAGE_KEY);
  listeners.forEach((listener) => listener(state));
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
