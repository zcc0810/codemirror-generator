/**
 * CodeMirror 6 extension catalog — shared IDs for UI, build, and preview.
 */

const PRESET_MINIMAL = [
  'highlightSpecialChars',
  'history',
  'drawSelection',
  'defaultHighlight',
];

const PRESET_BASIC = [
  'lineNumbers',
  'highlightActiveLineGutter',
  'highlightSpecialChars',
  'history',
  'foldGutter',
  'drawSelection',
  'dropCursor',
  'multipleSelections',
  'indentOnInput',
  'defaultHighlight',
  'bracketMatching',
  'closeBrackets',
  'autocompletion',
  'rectangularSelection',
  'crosshairCursor',
  'highlightActiveLine',
  'highlightSelectionMatches',
  'searchKeymap',
];

/** @type {Record<string, { label: string, group: string, desc?: string }>} */
const FEATURE_META = {
  lineNumbers: { label: '行号', group: 'gutter', desc: 'lineNumbers' },
  highlightActiveLineGutter: { label: '当前行 Gutter 高亮', group: 'gutter' },
  foldGutter: { label: '代码折叠槽', group: 'gutter' },
  highlightSpecialChars: { label: '特殊字符占位', group: 'edit' },
  history: { label: '撤销 / 重做', group: 'edit' },
  drawSelection: { label: '自定义选区绘制', group: 'edit' },
  dropCursor: { label: '拖放光标', group: 'edit' },
  multipleSelections: { label: '多光标', group: 'edit' },
  indentOnInput: { label: '输入时自动缩进', group: 'edit' },
  defaultHighlight: { label: '默认语法高亮', group: 'edit' },
  bracketMatching: { label: '括号匹配', group: 'edit' },
  closeBrackets: { label: '自动补全括号', group: 'edit' },
  autocompletion: { label: '自动补全', group: 'edit' },
  rectangularSelection: { label: '矩形选择 (Alt+拖)', group: 'edit' },
  crosshairCursor: { label: '十字光标 (Alt)', group: 'edit' },
  highlightActiveLine: { label: '当前行高亮', group: 'presentation' },
  highlightSelectionMatches: { label: '高亮相同选中文本', group: 'presentation' },
  searchKeymap: { label: '搜索快捷键', group: 'presentation' },
};

/** Build-time: how each feature maps to generated entry code */
const FEATURE_BUILD = {
  lineNumbers: { code: 'lineNumbers()', from: '@codemirror/view', import: 'lineNumbers' },
  highlightActiveLineGutter: {
    code: 'highlightActiveLineGutter()',
    from: '@codemirror/view',
    import: 'highlightActiveLineGutter',
  },
  highlightSpecialChars: {
    code: 'highlightSpecialChars()',
    from: '@codemirror/view',
    import: 'highlightSpecialChars',
  },
  history: { code: 'history()', from: '@codemirror/commands', import: 'history' },
  foldGutter: { code: 'foldGutter()', from: '@codemirror/language', import: 'foldGutter' },
  drawSelection: { code: 'drawSelection()', from: '@codemirror/view', import: 'drawSelection' },
  dropCursor: { code: 'dropCursor()', from: '@codemirror/view', import: 'dropCursor' },
  multipleSelections: {
    code: 'EditorState.allowMultipleSelections.of(true)',
    from: '@codemirror/state',
    import: 'EditorState',
  },
  indentOnInput: { code: 'indentOnInput()', from: '@codemirror/language', import: 'indentOnInput' },
  defaultHighlight: {
    code: 'syntaxHighlighting(defaultHighlightStyle, { fallback: true })',
    from: '@codemirror/language',
    import: 'syntaxHighlighting',
    extraImports: [{ from: '@codemirror/language', import: 'defaultHighlightStyle' }],
  },
  bracketMatching: {
    code: 'bracketMatching()',
    from: '@codemirror/language',
    import: 'bracketMatching',
  },
  closeBrackets: {
    code: 'closeBrackets()',
    from: '@codemirror/autocomplete',
    import: 'closeBrackets',
    keymap: { from: '@codemirror/autocomplete', import: 'closeBracketsKeymap' },
  },
  autocompletion: {
    code: 'autocompletion()',
    from: '@codemirror/autocomplete',
    import: 'autocompletion',
    keymap: { from: '@codemirror/autocomplete', import: 'completionKeymap' },
  },
  rectangularSelection: {
    code: 'rectangularSelection()',
    from: '@codemirror/view',
    import: 'rectangularSelection',
  },
  crosshairCursor: { code: 'crosshairCursor()', from: '@codemirror/view', import: 'crosshairCursor' },
  highlightActiveLine: {
    code: 'highlightActiveLine()',
    from: '@codemirror/view',
    import: 'highlightActiveLine',
  },
  highlightSelectionMatches: {
    code: 'highlightSelectionMatches()',
    from: '@codemirror/search',
    import: 'highlightSelectionMatches',
    keymap: { from: '@codemirror/search', import: 'searchKeymap' },
  },
  searchKeymap: {
    code: null,
    keymapOnly: true,
    keymap: { from: '@codemirror/search', import: 'searchKeymap' },
  },
};

const OPTION_META = {
  lineWrapping: { label: '自动换行', group: 'options' },
  scrollPastEnd: { label: '可滚过文档末尾', group: 'options' },
  readOnly: { label: '只读', group: 'options' },
  resizable: { label: '允许拖拽高度', group: 'options' },
};

const LANGUAGE_META = {
  python: { label: 'Python', sample: 'python' },
  java: { label: 'Java', sample: 'java' },
  cpp: { label: 'C++', sample: 'cpp' },
};

const LANGUAGE_BUILD = {
  python: { from: '@codemirror/lang-python', import: 'python' },
  java: { from: '@codemirror/lang-java', import: 'java' },
  cpp: { from: '@codemirror/lang-cpp', import: 'cpp' },
};

const THEME_META = {
  default: { label: '默认（系统）' },
  oneDark: { label: 'One Dark', className: 'cm-theme-one-dark', cssFile: true },
};

const THEME_BUILD = {
  oneDark: { from: '@codemirror/theme-one-dark', import: 'oneDark' },
};

const SAMPLES = {
  python: `def greet(name):
    return f"Hello, {name}!"

print(greet("CodeMirror 6"))`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, CodeMirror 6!");
    }
}`,
  cpp: `#include <iostream>

int main() {
    std::cout << "Hello, CodeMirror 6!" << std::endl;
    return 0;
}`,
};

const DEFAULT_CONFIG = {
  preset: 'basic',
  features: {},
  languages: ['python', 'java', 'cpp'],
  theme: 'oneDark',
  options: {
    lineWrapping: false,
    scrollPastEnd: false,
    readOnly: false,
    resizable: false,
    tabSize: 4,
    placeholder: '',
  },
};

/**
 * @param {typeof DEFAULT_CONFIG} config
 * @returns {string[]}
 */
function resolveFeatureIds(config) {
  if (config.preset === 'basic') return [...PRESET_BASIC];
  if (config.preset === 'minimal') return [...PRESET_MINIMAL];
  return Object.entries(config.features || {})
    .filter(([, on]) => on)
    .map(([id]) => id);
}

/**
 * @param {typeof DEFAULT_CONFIG} config
 */
function resolveEnabledLanguages(config) {
  const langs = config.languages || [];
  return langs.filter((id) => LANGUAGE_BUILD[id]);
}

/**
 * UI metadata served to the configurator page.
 */
function getCatalogMeta() {
  return {
    presets: [
      { id: 'basic', label: 'basicSetup（推荐）' },
      { id: 'minimal', label: 'minimalSetup（最小）' },
      { id: 'custom', label: '自定义' },
    ],
    features: Object.entries(FEATURE_META).map(([id, meta]) => ({ id, ...meta })),
    featureGroups: [
      { id: 'gutter', label: 'Gutter' },
      { id: 'edit', label: '编辑' },
      { id: 'presentation', label: '展示' },
    ],
    options: Object.entries(OPTION_META).map(([id, meta]) => ({ id, ...meta })),
    languages: Object.entries(LANGUAGE_META).map(([id, meta]) => ({ id, ...meta })),
    themes: Object.entries(THEME_META).map(([id, meta]) => ({ id, ...meta })),
    samples: SAMPLES,
    defaultConfig: DEFAULT_CONFIG,
    presetBasic: PRESET_BASIC,
    presetMinimal: PRESET_MINIMAL,
  };
}

module.exports = {
  PRESET_MINIMAL,
  PRESET_BASIC,
  FEATURE_META,
  FEATURE_BUILD,
  LANGUAGE_META,
  LANGUAGE_BUILD,
  THEME_META,
  THEME_BUILD,
  SAMPLES,
  DEFAULT_CONFIG,
  resolveFeatureIds,
  resolveEnabledLanguages,
  getCatalogMeta,
};
