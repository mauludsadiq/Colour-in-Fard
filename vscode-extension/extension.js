const vscode = require('vscode');
const { fromHex } = require('./cfid');

// Matches #fff, #ffffff, #fff8, #ffffffff (3/4/6/8 hex digit forms)
// Only 3 and 6 digit forms (no alpha) get a CF-ID, since CF-ID is defined
// over 24-bit sRGB.
const HEX_COLOUR_RE = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;

function aaLabel(ratio) {
  return ratio >= 4.5 ? 'AA pass' : (ratio >= 3.0 ? 'AA large only' : 'fail');
}

function provideHover(document, position) {
  const line = document.lineAt(position.line).text;

  let match;
  HEX_COLOUR_RE.lastIndex = 0;
  while ((match = HEX_COLOUR_RE.exec(line)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    if (position.character < start || position.character > end) continue;

    const hex = match[0];
    let info;
    try {
      info = fromHex(hex);
    } catch (e) {
      return null;
    }

    const range = new vscode.Range(
      position.line, start,
      position.line, end
    );

    const md = new vscode.MarkdownString();
    md.isTrusted = true;
    md.appendMarkdown(`### CF Colour ID\n\n`);
    md.appendMarkdown(`**${info.cfId}**\n\n`);
    md.appendMarkdown(`| | |\n|---|---|\n`);
    md.appendMarkdown(`| hex | \`${hex.toLowerCase()}\` |\n`);
    md.appendMarkdown(`| rgb | ${info.rgb.join(', ')} |\n`);
    md.appendMarkdown(`| LAB | L=${info.lab.L} a=${info.lab.a} b=${info.lab.b} |\n`);
    md.appendMarkdown(`| LCH | L=${info.lch.L} C=${info.lch.C} H=${info.lch.H} |\n`);
    md.appendMarkdown(`| contrast on white | ${info.contrastWhite.toFixed(2)}:1 (${aaLabel(info.contrastWhite)}) |\n`);
    md.appendMarkdown(`| contrast on black | ${info.contrastBlack.toFixed(2)}:1 (${aaLabel(info.contrastBlack)}) |\n`);
    md.appendMarkdown(`\n[CF Colour Protocol v1.0.0](https://github.com/mauludsadiq/Colour-in-Fard/blob/main/SPEC.md)`);

    return new vscode.Hover(md, range);
  }

  return null;
}

function activate(context) {
  const selector = { pattern: '**/*' };
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(selector, { provideHover })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
