import { EditorState } from '@codemirror/state';
import {
  EditorView,
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
  keymap,
  placeholder,
  scrollPastEnd,
} from '@codemirror/view';
import {
  foldGutter,
  indentOnInput,
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
  foldKeymap,
} from '@codemirror/language';
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import {
  closeBrackets,
  autocompletion,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';
import { oneDark } from '@codemirror/theme-one-dark';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';

const FEATURE_FACTORIES = {
  lineNumbers: () => lineNumbers(),
  highlightActiveLineGutter: () => highlightActiveLineGutter(),
  highlightSpecialChars: () => highlightSpecialChars(),
  history: () => history(),
  foldGutter: () => foldGutter(),
  drawSelection: () => drawSelection(),
  dropCursor: () => dropCursor(),
  multipleSelections: () => EditorState.allowMultipleSelections.of(true),
  indentOnInput: () => indentOnInput(),
  defaultHighlight: () => syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  bracketMatching: () => bracketMatching(),
  closeBrackets: () => closeBrackets(),
  autocompletion: () => autocompletion(),
  rectangularSelection: () => rectangularSelection(),
  crosshairCursor: () => crosshairCursor(),
  highlightActiveLine: () => highlightActiveLine(),
  highlightSelectionMatches: () => highlightSelectionMatches(),
};

const KEYMAP_BY_FEATURE = {
  closeBrackets: closeBracketsKeymap,
  autocompletion: completionKeymap,
  highlightSelectionMatches: searchKeymap,
  searchKeymap: searchKeymap,
};

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

const PRESET_MINIMAL = [
  'highlightSpecialChars',
  'history',
  'drawSelection',
  'defaultHighlight',
];

const languages = { python, java, cpp };
const themes = { oneDark };

function resolveFeatureIds(config) {
  if (config.preset === 'basic') return PRESET_BASIC;
  if (config.preset === 'minimal') return PRESET_MINIMAL;
  return Object.entries(config.features || {})
    .filter(([, on]) => on)
    .map(([id]) => id);
}

/**
 * @param {object} config
 */
function buildExtensions(config) {
  const featureIds = resolveFeatureIds(config);
  const extensions = [];

  for (const id of featureIds) {
    const factory = FEATURE_FACTORIES[id];
    if (factory) extensions.push(factory());
  }

  const keymaps = [];
  const addKm = (km) => {
    if (km && !keymaps.includes(km)) keymaps.push(km);
  };

  for (const id of featureIds) {
    addKm(KEYMAP_BY_FEATURE[id]);
  }
  addKm(defaultKeymap);
  if (featureIds.includes('history')) addKm(historyKeymap);
  if (featureIds.includes('foldGutter')) addKm(foldKeymap);
  if (config.preset === 'basic') addKm(lintKeymap);

  if (keymaps.length) {
    extensions.push(keymap.of(keymaps.flatMap((k) => [...k])));
  }

  const opts = config.options || {};
  if (opts.lineWrapping) extensions.push(EditorView.lineWrapping);
  if (opts.scrollPastEnd) extensions.push(scrollPastEnd());
  if (opts.readOnly) extensions.push(EditorState.readOnly.of(true));
  if (opts.tabSize && opts.tabSize !== 4) {
    extensions.push(EditorState.tabSize.of(Number(opts.tabSize)));
  }
  if (opts.placeholder) {
    extensions.push(placeholder(String(opts.placeholder)));
  }

  const theme = config.theme || 'default';
  if (theme === 'oneDark') {
    extensions.push(oneDark);
    extensions.push(
      EditorView.editorAttributes.of({ class: 'cm-theme-one-dark' }),
    );
  }

  return extensions;
}

/**
 * @param {object} options
 */
function createEditor(options) {
  const {
    parent,
    doc = '',
    language = 'python',
    config,
    readOnly,
    tabSize,
  } = options;

  const extensions = [...buildExtensions(config)];
  const langFn = languages[language];
  if (langFn) extensions.push(langFn());
  if (readOnly === true) extensions.push(EditorState.readOnly.of(true));
  if (tabSize != null && tabSize !== 4) {
    extensions.push(EditorState.tabSize.of(Number(tabSize)));
  }

  return new EditorView({ parent, doc, extensions });
}

const api = {
  EditorView,
  EditorState,
  buildExtensions,
  createEditor,
  languages,
  themes,
  python,
  java,
  cpp,
  oneDark,
};

window.cm6preview = api;
