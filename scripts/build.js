const fs = require('fs');
const path = require('path');
const { rollup } = require('rollup');
const resolve = require('@rollup/plugin-node-resolve');
const terser = require('@rollup/plugin-terser');
const archiver = require('archiver');
const { generateEntrySource } = require('./generate-entry');
const { generateThemeCss } = require('./generate-theme-css');
const { DEFAULT_CONFIG, THEME_META } = require('../src/catalog');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

/**
 * @param {object} config
 * @param {{ outDir?: string }} [opts]
 * @returns {Promise<{ jsPath: string, cssPath: string|null, zipPath: string }>}
 */
async function buildBundle(config, opts = {}) {
  const outDir = opts.outDir || DIST;
  const merged = {
    ...DEFAULT_CONFIG,
    ...config,
    options: { ...DEFAULT_CONFIG.options, ...(config.options || {}) },
  };

  if (!merged.languages?.length) {
    throw new Error('请至少选择一种语言');
  }

  fs.mkdirSync(outDir, { recursive: true });

  const tmpEntry = path.join(outDir, '.entry.generated.js');
  fs.writeFileSync(tmpEntry, generateEntrySource(merged), 'utf8');

  const jsPath = path.join(outDir, 'codemirror.min.js');
  const bundle = await rollup({
    input: tmpEntry,
    plugins: [resolve(), terser()],
  });

  await bundle.write({
    file: jsPath,
    format: 'iife',
    name: 'cm6',
    exports: 'default',
    sourcemap: false,
  });

  await bundle.close();
  fs.unlinkSync(tmpEntry);

  let cssPath = null;
  const themeMeta = THEME_META[merged.theme];
  if (themeMeta?.cssFile) {
    const css = generateThemeCss(merged.theme);
    if (css) {
      cssPath = path.join(outDir, 'codemirror.theme.css');
      fs.writeFileSync(cssPath, css, 'utf8');
    }
  }

  const examplePath = path.join(outDir, 'example.html');
  fs.writeFileSync(examplePath, generateExampleHtml(merged, cssPath != null), 'utf8');

  const zipPath = path.join(outDir, 'codemirror-bundle.zip');
  await createZip(zipPath, [
    { path: jsPath, name: 'codemirror.min.js' },
    cssPath ? { path: cssPath, name: 'codemirror.theme.css' } : null,
    { path: examplePath, name: 'example.html' },
  ].filter(Boolean));

  return { jsPath, cssPath, zipPath, examplePath };
}

/**
 * @param {object} config
 * @param {boolean} hasCss
 */
function generateExampleHtml(config, hasCss) {
  const lang = config.languages[0] || 'python';
  const resizable = !!config.options?.resizable;
  const cssLink = hasCss
    ? '  <link rel="stylesheet" href="./codemirror.theme.css">\n'
    : '';
  const editorStyle = resizable
    ? `    #editor {
      margin: 16px;
      border: 1px solid #444;
      border-radius: 8px;
      background: #1e1e1e;
      min-height: 220px;
      height: 320px;
      max-height: calc(100vh - 32px);
      resize: vertical;
      overflow: auto;
    }
    #editor .cm-editor {
      height: 100%;
      min-height: 100%;
    }`
    : `    #editor { margin: 16px; border: 1px solid #444; border-radius: 8px; overflow: hidden; }
    #editor .cm-editor { min-height: 280px; }`;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodeMirror 6</title>
${cssLink}  <style>
    body { margin: 0; font-family: system-ui, sans-serif; background: #1e1e1e; color: #ccc; }
${editorStyle}
  </style>
  <script src="./codemirror.min.js"></script>
</head>
<body>
  <div id="editor"></div>
  <script>
    const { createEditor } = window.cm6;
    const view = createEditor({
      parent: document.getElementById('editor'),
      language: ${JSON.stringify(lang)},
      doc: ${JSON.stringify('// Your code here\\n')},
    });
  </script>
</body>
</html>
`;
}

/**
 * @param {string} zipPath
 * @param {{ path: string, name: string }[]} files
 */
function createZip(zipPath, files) {
  return new Promise((resolvePromise, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', resolvePromise);
    archive.on('error', reject);

    archive.pipe(output);
    for (const f of files) {
      archive.file(f.path, { name: f.name });
    }
    archive.finalize();
  });
}

async function buildPreviewBundle() {
  const previewEntry = path.join(ROOT, 'src', 'preview-entry.js');
  const outPath = path.join(DIST, 'preview.bundle.js');

  fs.mkdirSync(DIST, { recursive: true });

  const bundle = await rollup({
    input: previewEntry,
    plugins: [resolve()],
  });

  await bundle.write({
    file: outPath,
    format: 'iife',
    name: 'cm6preview',
    sourcemap: false,
  });
  await bundle.close();
  return outPath;
}

async function main() {
  const configPath = process.argv[2] || path.join(ROOT, 'build.config.json');
  let config = DEFAULT_CONFIG;
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  const result = await buildBundle(config);
  console.log('Built:', result.jsPath);
  if (result.cssPath) console.log('Theme CSS:', result.cssPath);
  console.log('Zip:', result.zipPath);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { buildBundle, buildPreviewBundle, generateExampleHtml };
