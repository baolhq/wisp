import { writable } from "svelte/store";

export const sidebarShown = writable(true);
export const autosaving = writable(false);
export const activeContextMenu = writable(null);
