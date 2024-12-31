// script.js

let htmlEditor, cssEditor, jsEditor;

const VERSIONS_KEY = "miniEditorVersions";

window.addEventListener("DOMContentLoaded", () => {

  initCodeEditors();

  loadCodeFromLocalStorage();

  document.getElementById("previewBtn").addEventListener("click", renderPreview);
  document.getElementById("formatBtn").addEventListener("click", formatCode);
  document.getElementById("saveVersionBtn").addEventListener("click", saveVersion);
  document.getElementById("diffBtn").addEventListener("click", showDiffWithLastVersion);
  document.getElementById("deviceSelect").addEventListener("change", switchDevice);

  renderPreview();
});

function initCodeEditors() {
  htmlEditor = CodeMirror.fromTextArea(document.getElementById("htmlCode"), {
    mode: "xml",
    theme: "eclipse",
    lineNumbers: true,
    tabSize: 2,
    indentUnit: 2,
  });

  cssEditor = CodeMirror.fromTextArea(document.getElementById("cssCode"), {
    mode: "css",
    theme: "eclipse",
    lineNumbers: true,
    tabSize: 2,
    indentUnit: 2,
  });

  jsEditor = CodeMirror.fromTextArea(document.getElementById("jsCode"), {
    mode: "javascript",
    theme: "eclipse",
    lineNumbers: true,
    tabSize: 2,
    indentUnit: 2,
  });

  [htmlEditor, cssEditor, jsEditor].forEach((editor) => {
    editor.on("change", saveCodeToLocalStorage);
  });
}

function saveCodeToLocalStorage() {
  
  const htmlContent = htmlEditor.getValue();
  const cssContent = cssEditor.getValue();
  const jsContent = jsEditor.getValue();

  localStorage.setItem("htmlCode", htmlContent);
  localStorage.setItem("cssCode", cssContent);
  localStorage.setItem("jsCode", jsContent);
}

function loadCodeFromLocalStorage() {
  const savedHTML = localStorage.getItem("htmlCode");
  const savedCSS = localStorage.getItem("cssCode");
  const savedJS = localStorage.getItem("jsCode");

  if (savedHTML !== null) htmlEditor.setValue(savedHTML);
  if (savedCSS !== null) cssEditor.setValue(savedCSS);
  if (savedJS !== null) jsEditor.setValue(savedJS);
}

function renderPreview() {
  const htmlContent = htmlEditor.getValue();
  const cssContent = cssEditor.getValue();
  const jsContent = jsEditor.getValue();

  const previewFrame = document.getElementById("preview");

  const previewHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    ${cssContent}
  </style>
</head>
<body>
  ${htmlContent}
  <script>
    ${jsContent}
  </script>
</body>
</html>
`;

  previewFrame.srcdoc = previewHTML;
}

function formatCode() {
  const htmlRaw = htmlEditor.getValue();
  const cssRaw = cssEditor.getValue();
  const jsRaw = jsEditor.getValue();

  const prettierPlugins = window.prettierPlugins || {
    babel: window.prettierPluginsBabel,
    html: window.prettierPluginsHTML,
    postcss: window.prettierPluginsPostcss,
  };

  const formattedHTML = prettier.format(htmlRaw, {
    parser: "html",
    plugins: prettierPlugins,
    tabWidth: 2,
    useTabs: false,
  });

  const formattedCSS = prettier.format(cssRaw, {
    parser: "css",
    plugins: prettierPlugins,
    tabWidth: 2,
    useTabs: false,
  });

  const formattedJS = prettier.format(jsRaw, {
    parser: "babel",
    plugins: prettierPlugins,
    tabWidth: 2,
    useTabs: false,
  });

  htmlEditor.setValue(formattedHTML);
  cssEditor.setValue(formattedCSS);
  jsEditor.setValue(formattedJS);

  renderPreview();
}

function saveVersion() {
  const versions = loadVersions();
  const newVersion = {
    timestamp: new Date().toLocaleString(),
    html: htmlEditor.getValue(),
    css: cssEditor.getValue(),
    js: jsEditor.getValue(),
  };

  versions.push(newVersion);
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions));
  alert("Version saved! (" + newVersion.timestamp + ")");
}

function loadVersions() {
  const json = localStorage.getItem(VERSIONS_KEY);
  if (json) {
    return JSON.parse(json);
  } else {
    return [];
  }
}

function showDiffWithLastVersion() {
  const diffArea = document.getElementById("diffArea");
  diffArea.innerHTML = "";

  const versions = loadVersions();
  if (versions.length === 0) {
    diffArea.textContent = "No saved versions found.";
    return;
  }

  const lastVersion = versions[versions.length - 1];
  const currentHTML = htmlEditor.getValue();
  const currentCSS = cssEditor.getValue();
  const currentJS = jsEditor.getValue();

  let result = `Comparing with version: ${lastVersion.timestamp}\n\n`;

  result += "=== HTML Diff ===\n";
  result += createDiffText(lastVersion.html, currentHTML) + "\n\n";

  result += "=== CSS Diff ===\n";
  result += createDiffText(lastVersion.css, currentCSS) + "\n\n";

  result += "=== JS Diff ===\n";
  result += createDiffText(lastVersion.js, currentJS) + "\n\n";

  diffArea.innerHTML = result;
}

function createDiffText(oldText, newText) {
  const dmp = new diff_match_patch();
  const diff = dmp.diff_main(oldText, newText);
  dmp.diff_cleanupSemantic(diff);

  let html = "";
  for (let i = 0; i < diff.length; i++) {
    const [op, data] = diff[i];
    if (op === 0) {
      html += data;
    } else if (op === 1) {
      html += `<ins>${data}</ins>`;
    } else if (op === -1) {
      html += `<del>${data}</del>`;
    }
  }
  return html;
}

function switchDevice() {
  const deviceSelect = document.getElementById("deviceSelect");
  const newWidth = deviceSelect.value;
  const previewFrame = document.getElementById("preview");

  previewFrame.style.width = newWidth;
}
