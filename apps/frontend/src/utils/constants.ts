// Local storage keys
export const LOCAL_STORAGE_KEYS = {
  theme: 'polyglot_theme',
  editor_preferences: 'polyglot_editor_prefs',
  unsaved_snippet: (snippetId: string) => `polyglot_unsaved_snippet_${snippetId}`,
};