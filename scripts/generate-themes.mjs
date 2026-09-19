import fs from "node:fs";
import postcss from "postcss";
const tokens = new Map();
for (const path of [
  "src/styles.css",
  "src/screens.css",
  "src/polish.css",
  "src/playful.css",
]) {
  const root = postcss.parse(fs.readFileSync(path, "utf8"));
  root.walkDecls((d) => {
    for (const m of d.value.matchAll(/--paint-(bg|line|ink)-([a-f0-9]{6,8})/g))
      tokens.set(m[1] + "-" + m[2], { hex: m[2], role: m[1] });
    if (d.value.includes("--paint-")) return;
    let role = /background/.test(d.prop)
      ? "bg"
      : /border|shadow|outline/.test(d.prop)
        ? "line"
        : "ink";
    if (d.prop.startsWith("--"))
      role = /bg|panel|paper/.test(d.prop)
        ? "bg"
        : /line/.test(d.prop)
          ? "line"
          : "ink";
    d.value = d.value.replace(/#[0-9a-fA-F]{3,8}\b/g, (hex) => {
      let h = hex.slice(1).toLowerCase();
      if (h.length === 3 || h.length === 4)
        h = h
          .split("")
          .map((x) => x + x)
          .join("");
      const key = role + "-" + h;
      tokens.set(key, { hex: h, role });
      return "var(--paint-" + key + ", " + hex + ")";
    });
  });
  fs.writeFileSync(path, root.toString());
}
function hsl(hex) {
  let r = parseInt(hex.slice(0, 2), 16) / 255,
    g = parseInt(hex.slice(2, 4), 16) / 255,
    b = parseInt(hex.slice(4, 6), 16) / 255,
    max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    l = (max + min) / 2,
    h = 0,
    s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h =
      max === r
        ? (g - b) / d + (g < b ? 6 : 0)
        : max === g
          ? (b - r) / d + 2
          : (r - g) / d + 4;
    h *= 60;
  }
  return [h, s * 100, l * 100];
}
const semantic = {
  mid: {
    bg: "#464e59",
    surface: "#56606b",
    soft: "#616c72",
    text: "#f0eee1",
    muted: "#c1cbc6",
    border: "#79868a",
    accent: "#a6cbbd",
    green: "#9bceae",
    red: "#e7a194",
  },
  dark: {
    bg: "#13212b",
    surface: "#1e313d",
    soft: "#2a414a",
    text: "#e5ebdf",
    muted: "#acbfb9",
    border: "#3d5861",
    accent: "#8bbdaf",
    green: "#91cfab",
    red: "#e5a193",
  },
};
let out =
  "/* Generated colour tokens; Light retains the original illustrated palette. */\n";
for (const [theme, p] of Object.entries(semantic)) {
  out += ':root[data-theme="' + theme + '"] {\n';
  out +=
    "--bg:" +
    p.bg +
    ";--panel:" +
    p.surface +
    ";--paper:" +
    p.surface +
    ";--surface:" +
    p.surface +
    ";--surface-soft:" +
    p.soft +
    ";--ink:" +
    p.text +
    ";--text:" +
    p.text +
    ";--muted:" +
    p.muted +
    ";--text-soft:" +
    p.muted +
    ";--line:" +
    p.border +
    ";--border:" +
    p.border +
    ";--accent:" +
    p.accent +
    ";--green:" +
    p.green +
    ";--red:" +
    p.red +
    ";\n";
  for (const [key, { hex, role }] of tokens) {
    let [h, s, l] = hsl(hex);
    const a = hex.length === 8 ? parseInt(hex.slice(6), 16) / 255 : 1;
    let nl,
      ns = s;
    if (role === "ink") {
      nl = l > 95 ? 96 : l < 45 ? 88 : 74;
      ns = Math.min(s, 44);
      if (s > 24 && h < 35) nl = 74;
      if (s > 24 && h > 80 && h < 165) nl = 76;
    } else if (role === "line") {
      nl = theme === "mid" ? 53 : 36;
      ns = Math.min(s, 22);
    } else {
      if (l > 65) {
        nl = (theme === "mid" ? 30 : 16) + (100 - l) * 0.13;
        ns = Math.min(s, theme === "mid" ? 17 : 25);
        if (s < 30 || l > 82) h = theme === "mid" ? 214 : 202;
      } else {
        nl =
          theme === "mid"
            ? Math.max(23, Math.min(42, l))
            : Math.max(16, Math.min(37, l));
        ns = Math.min(s, 35);
      }
    }
    out +=
      "--paint-" +
      key +
      ":hsl(" +
      h.toFixed(1) +
      " " +
      ns.toFixed(1) +
      "% " +
      nl.toFixed(1) +
      "% / " +
      a.toFixed(3) +
      ");\n";
  }
  out += "}\n";
}
out +=
  ':root[data-theme="mid"] body,:root[data-theme="dark"] body{background:var(--bg);color:var(--text)}\n:root[data-theme="mid"] .story-thumb,:root[data-theme="dark"] .story-thumb{filter:brightness(.8) saturate(.8)}\n';
fs.writeFileSync("src/themes.css", out);
console.log(tokens.size + " palette tokens generated for Mid and Dark.");
