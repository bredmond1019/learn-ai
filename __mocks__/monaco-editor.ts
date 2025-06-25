export const editor = {
  create: jest.fn(() => ({
    getValue: jest.fn(() => ''),
    setValue: jest.fn(),
    dispose: jest.fn(),
    onDidChangeModelContent: jest.fn(),
    updateOptions: jest.fn(),
    focus: jest.fn(),
    layout: jest.fn(),
    addCommand: jest.fn(),
    addAction: jest.fn(),
  })),
  defineTheme: jest.fn(),
  setTheme: jest.fn(),
  createModel: jest.fn(),
  setModelLanguage: jest.fn(),
};

export const languages = {
  register: jest.fn(),
  setMonarchTokensProvider: jest.fn(),
  setLanguageConfiguration: jest.fn(),
  registerCompletionItemProvider: jest.fn(),
  registerHoverProvider: jest.fn(),
  registerSignatureHelpProvider: jest.fn(),
};

export const KeyMod = {
  CtrlCmd: 2048,
  Shift: 1024,
  Alt: 512,
  WinCtrl: 256,
};

export const KeyCode = {
  Enter: 3,
  Escape: 9,
  Space: 10,
  Tab: 2,
  Delete: 20,
  F1: 59,
  F2: 60,
  KeyA: 31,
  KeyC: 33,
  KeyS: 49,
  KeyV: 52,
  KeyX: 54,
  KeyZ: 56,
};