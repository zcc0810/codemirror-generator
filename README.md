# CodeMirror 6 打包生成器

在网页上勾选 [CodeMirror 6](https://codemirror.net/) 扩展、语言与主题，一键生成 **压缩 IIFE** 与 **One Dark 主题 CSS**，用于静态页、离线或无构建链项目。

## 功能

- 配置器页面：预设（basicSetup / minimalSetup / 自定义细项）、语言多选、One Dark 主题
- 实时预览：根据勾选即时重建编辑器
- 打包产物（ZIP）：
  - `codemirror.min.js` — IIFE，`window.cm6`，仅含勾选项
  - `codemirror.theme.css` — One Dark 配套样式（勾选 One Dark 时）
  - `example.html` — 最小接入示例

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开 **http://localhost:3456**，在左侧勾选配置，右侧预览，点击「生成并下载 ZIP」。

仅命令行打包（使用 `build.config.json`）：

```bash
npm run build
# 或指定配置
node scripts/build.js path/to/config.json
```

产物在 `dist/` 目录。

## 在页面中使用

```html
<link rel="stylesheet" href="./codemirror.theme.css">
<script src="./codemirror.min.js"></script>
<div id="editor"></div>

<script>
  const { createEditor } = window.cm6;
  const view = createEditor({
    parent: document.getElementById('editor'),
    language: 'python',
    doc: 'print("hello")',
  });
</script>
```

如果你希望编辑区可拖拽增高，请给容器加 CSS（这不是 CodeMirror 6 的 API 参数）：

```css
#editor {
  min-height: 220px;
  height: 320px;
  resize: vertical;
  overflow: auto;
}
#editor .cm-editor {
  min-height: 100%;
  height: 100%;
}
```

> CodeMirror 6 主题主要通过 JS 扩展注入；`codemirror.theme.css` 为配套静态样式，便于覆盖或与 `cm-theme-one-dark` 类名配合。

## 配置项说明

| 区块 | 说明 |
|------|------|
| 预设 | `basic` = 官方 basicSetup；`minimal` = minimalSetup；`custom` = 下方细项 |
| Gutter / 编辑 / 展示 | 对应 basicSetup 拆分的扩展（行号、折叠、补全、搜索快捷键等） |
| 语言 | 至少选一种，当前支持 Python / Java / C++ |
| 主题 | `oneDark` 或 `default` |
| 选项 | 换行、只读、Tab 宽度、占位符等 |

配置结构见 `build.config.json`，与配置器 POST `/api/build` 的 JSON 一致。

## 项目结构

```
├── index.html              # 配置器 + 预览
├── build.config.json       # CLI 默认配置
├── src/
│   ├── catalog.js          # 扩展目录（UI / 构建共用）
│   └── preview-entry.js    # 预览用全量 bundle 入口
├── scripts/
│   ├── build.js            # Rollup 打包 + ZIP
│   ├── generate-entry.js   # 按配置生成入口
│   ├── generate-theme-css.js
│   └── dev-server.js       # 静态服务 + /api/build
└── dist/                   # 构建产物
```

## License

ISC
