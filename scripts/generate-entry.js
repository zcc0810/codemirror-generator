const {
  FEATURE_BUILD,
  LANGUAGE_BUILD,
  THEME_BUILD,
  THEME_META,
  resolveFeatureIds,
  resolveEnabledLanguages,
} = require('../src/catalog');

/**
 * @param {import('../src/catalog').DEFAULT_CONFIG} config
 */
function generateEntrySource(config) {
  const featureIds = resolveFeatureIds(config);
  const languages = resolveEnabledLanguages(config);
  const theme = config.theme || 'default';

  /** @type {Map<string, Set<string>>} */
  const importMap = new Map();
  const extensionLines = [];
  const keymapImports = [];
  const seenKeymaps = new Set();

  function addImport(from, name) {
    if (!importMap.has(from)) importMap.set(from, new Set());
    importMap.get(from).add(name);
  }

  function addKeymap(km) {
    if (!km || seenKeymaps.has(km.import)) return;
    seenKeymaps.add(km.import);
    keymapImports.push(km);
    addImport(km.from, km.import);
  }

  for (const id of featureIds) {
    const spec = FEATURE_BUILD[id];
    if (!spec) continue;
    if (spec.keymapOnly) {
      addKeymap(spec.keymap);
      continue;
    }
    if (spec.code) {
      extensionLines.push(spec.code);
      addImport(spec.from, spec.import);
      if (spec.extraImports) {
        for (const ex of spec.extraImports) addImport(ex.from, ex.import);
      }
    }
    if (spec.keymap) addKeymap(spec.keymap);
  }

  // Always include default + history keymaps when history is enabled
  addImport('@codemirror/commands', 'defaultKeymap');
  if (featureIds.includes('history')) {
    addImport('@codemirror/commands', 'historyKeymap');
  }

  if (featureIds.includes('foldGutter')) {
    addImport('@codemirror/language', 'foldKeymap');
  }

  // lintKeymap ships with basicSetup
  if (config.preset === 'basic') {
    addImport('@codemirror/lint', 'lintKeymap');
  }

  const keymapNames = [
    ...keymapImports.map((k) => k.import),
    featureIds.includes('foldGutter') ? 'foldKeymap' : null,
    'defaultKeymap',
    featureIds.includes('history') ? 'historyKeymap' : null,
    config.preset === 'basic' ? 'lintKeymap' : null,
  ].filter(Boolean);

  const uniqueKeymaps = [...new Set(keymapNames)];
  if (uniqueKeymaps.length) {
    addImport('@codemirror/view', 'keymap');
    extensionLines.push(
      `keymap.of([${uniqueKeymaps.map((k) => `...${k}`).join(', ')}])`,
    );
  }

  // Options
  const opts = config.options || {};
  addImport('@codemirror/view', 'EditorView');
  addImport('@codemirror/state', 'EditorState');

  if (opts.lineWrapping) extensionLines.push('EditorView.lineWrapping');
  if (opts.scrollPastEnd) {
    addImport('@codemirror/view', 'scrollPastEnd');
    extensionLines.push('scrollPastEnd()');
  }
  if (opts.readOnly) extensionLines.push('EditorState.readOnly.of(true)');
  if (opts.tabSize && opts.tabSize !== 4) {
    extensionLines.push(`EditorState.tabSize.of(${Number(opts.tabSize)})`);
  }
  if (opts.placeholder) {
    addImport('@codemirror/view', 'placeholder');
    const ph = JSON.stringify(String(opts.placeholder));
    extensionLines.push(`placeholder(${ph})`);
  }

  // Theme
  if (theme !== 'default' && THEME_BUILD[theme]) {
    const t = THEME_BUILD[theme];
    addImport(t.from, t.import);
    extensionLines.push(t.import);
    const meta = THEME_META[theme];
    if (meta?.className) {
      extensionLines.push(
        `EditorView.editorAttributes.of({ class: ${JSON.stringify(meta.className)} })`,
      );
    }
  }

  // Languages — only factories in bundle; applied in createEditor
  for (const lang of languages) {
    const spec = LANGUAGE_BUILD[lang];
    addImport(spec.from, spec.import);
  }

  const importLines = [...importMap.entries()]
    .map(([from, names]) => {
      const sorted = [...names].sort();
      return `import { ${sorted.join(', ')} } from '${from}';`;
    })
    .sort();

  const langMapEntries = languages
    .map((lang) => `  ${lang}: ${LANGUAGE_BUILD[lang].import}`)
    .join(',\n');

  const langExports = languages.map((lang) => LANGUAGE_BUILD[lang].import).join(', ');

  const setupArray =
    extensionLines.length > 0
      ? `const setupExtensions = [\n  ${extensionLines.join(',\n  ')},\n];`
      : 'const setupExtensions = [];';

  return `${importLines.join('\n')}

${setupArray}

const languages = {
${langMapEntries}
};

/**
 * @param {object} options
 * @param {HTMLElement} options.parent
 * @param {string} [options.doc]
 * @param {string} [options.language]
 * @param {boolean} [options.readOnly]
 * @param {number} [options.tabSize]
 */
function createEditor({
  parent,
  doc = '',
  language = ${JSON.stringify(languages[0] || 'python')},
  readOnly,
  tabSize,
} = {}) {
  const extensions = [...setupExtensions];
  const langFn = languages[language];
  if (langFn) extensions.push(langFn());
  if (readOnly === true) extensions.push(EditorState.readOnly.of(true));
  if (tabSize != null && tabSize !== 4) {
    extensions.push(EditorState.tabSize.of(Number(tabSize)));
  }
  return new EditorView({ parent, doc, extensions });
}

const cm6 = {
  EditorView,
  EditorState,
  createEditor,
  languages,
  setupExtensions,
};

${langExports ? `Object.assign(cm6, { ${langExports} });` : ''}

window.cm6 = cm6;
export default cm6;
`;
}

module.exports = { generateEntrySource };
