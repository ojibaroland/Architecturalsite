/* Admin panel: owner name + photos, preview locally, publish via GitHub,
   with an optional ChatGPT assistant driven by the owner's own OpenAI key.
   All secrets live in localStorage on the owner's machine — nothing is
   ever written into the site's code. */

const LS = {
  passHash: "hsg-admin-pass-hash",
  draft: "hsg-site-config-draft",
  openaiKey: "hsg-openai-key",
  ghToken: "hsg-gh-token",
  ghRepo: "hsg-gh-repo",
  ghBranch: "hsg-gh-branch",
};

const $ = (id) => document.getElementById(id);

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ---------- State ---------- */

let config = {
  ownerName: "Andrew Halland",
  images: {
    portrait: "assets/images/owner-portrait.jpeg",
    consulting: "assets/images/owner-consulting.jpeg",
  },
  version: 2,
};

// Newly uploaded photos waiting to be published: { portrait: {file, dataUrl}, … }
const pendingUploads = {};

async function loadConfig() {
  try {
    const res = await fetch("site-config.json", { cache: "no-store" });
    if (res.ok) config = { ...config, ...(await res.json()) };
  } catch (_) { /* keep defaults */ }
  const draft = localStorage.getItem(LS.draft);
  if (draft) {
    try { config = { ...config, ...JSON.parse(draft) }; } catch (_) {}
  }
  $("owner-name").value = config.ownerName || "";
  for (const slot of ["portrait", "consulting"]) {
    const src = config.images?.[slot];
    if (src) $("preview-" + slot).src = src.startsWith("data:") ? src : src + "?v=" + (config.version || 1);
  }
}

function collectConfig() {
  config.ownerName = $("owner-name").value.trim() || config.ownerName;
  return config;
}

/* ---------- Passphrase gate (deterrent only — see note on page) ---------- */

const gate = $("gate");
const panel = $("panel");

async function initGate() {
  const stored = localStorage.getItem(LS.passHash);
  if (!stored) {
    $("gate-hint").textContent = "First visit on this browser: choose a passphrase to set up owner access.";
  }
  $("gate-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const pass = $("gate-pass").value;
    if (!pass) return;
    const hash = await sha256(pass);
    const existing = localStorage.getItem(LS.passHash);
    if (!existing) {
      localStorage.setItem(LS.passHash, hash);
      unlock();
    } else if (existing === hash) {
      unlock();
    } else {
      $("gate-status").textContent = "Wrong passphrase.";
    }
  });
}

function unlock() {
  gate.style.display = "none";
  panel.style.display = "block";
  loadConfig();
}

/* ---------- Photo uploads ---------- */

function wirePhotoSlot(slot) {
  $("file-" + slot).addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setStatus("publish-status", "That image is over 4 MB — please use a smaller file.", true);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      pendingUploads[slot] = { file, dataUrl: reader.result };
      $("preview-" + slot).src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
["portrait", "consulting"].forEach(wirePhotoSlot);

/* ---------- Preview / discard ---------- */

function setStatus(id, msg, isErr) {
  const el = $(id);
  el.textContent = msg;
  el.className = "status " + (isErr ? "err" : "ok");
}

$("btn-preview").addEventListener("click", () => {
  const draft = structuredClone(collectConfig());
  // Local preview can use data URLs directly; they are never published as-is.
  for (const slot of Object.keys(pendingUploads)) {
    draft.images[slot] = pendingUploads[slot].dataUrl;
  }
  localStorage.setItem(LS.draft, JSON.stringify(draft));
  setStatus("publish-status", "Draft saved for this browser. Open any page of the site to preview it, then come back to publish.");
});

$("btn-discard").addEventListener("click", () => {
  localStorage.removeItem(LS.draft);
  for (const k of Object.keys(pendingUploads)) delete pendingUploads[k];
  loadConfig();
  setStatus("publish-status", "Draft discarded — the site shows the published version again.");
});

/* ---------- Publish via GitHub Contents API ---------- */

function ghHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };
}

async function ghPutFile(repo, branch, token, path, base64Content, message) {
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;
  // Existing files need their current SHA to be overwritten.
  let sha;
  const head = await fetch(`${url}?ref=${branch}`, { headers: ghHeaders(token) });
  if (head.ok) sha = (await head.json()).sha;
  const res = await fetch(url, {
    method: "PUT",
    headers: ghHeaders(token),
    body: JSON.stringify({ message, content: base64Content, branch, ...(sha ? { sha } : {}) }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`${path}: ${res.status} ${err.message || res.statusText}`);
  }
}

$("btn-publish").addEventListener("click", async () => {
  const token = $("gh-token").value.trim();
  const repo = $("gh-repo").value.trim();
  const branch = $("gh-branch").value.trim() || "main";
  if (!token) return setStatus("publish-status", "A GitHub token is required to publish.", true);
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) return setStatus("publish-status", "Repository must look like owner/name.", true);

  localStorage.setItem(LS.ghToken, token);
  localStorage.setItem(LS.ghRepo, repo);
  localStorage.setItem(LS.ghBranch, branch);

  const btn = $("btn-publish");
  btn.disabled = true;
  try {
    const cfg = structuredClone(collectConfig());
    cfg.version = (cfg.version || 1) + 1;

    // 1. Upload any new photos under stable names.
    for (const [slot, upload] of Object.entries(pendingUploads)) {
      setStatus("publish-status", `Uploading ${slot} photo…`);
      const ext = (upload.file.name.match(/\.(jpe?g|png|webp)$/i) || [".jpg"])[0].toLowerCase();
      const path = `assets/images/owner-${slot}${ext.startsWith(".") ? ext : "." + ext}`;
      const base64 = upload.dataUrl.split(",")[1];
      await ghPutFile(repo, branch, token, path, base64, `Update owner ${slot} photo via admin panel`);
      cfg.images[slot] = path;
    }

    // 2. Commit the config.
    setStatus("publish-status", "Publishing site configuration…");
    const cfgB64 = btoa(unescape(encodeURIComponent(JSON.stringify(cfg, null, 2) + "\n")));
    await ghPutFile(repo, branch, token, "site-config.json", cfgB64, "Update site config via admin panel");

    config = cfg;
    for (const k of Object.keys(pendingUploads)) delete pendingUploads[k];
    localStorage.removeItem(LS.draft);
    setStatus("publish-status", "Published! The live site will update within a minute or two (allow for hosting cache).");
  } catch (err) {
    setStatus("publish-status", "Publish failed — " + err.message, true);
  } finally {
    btn.disabled = false;
  }
});

/* ---------- ChatGPT assistant (owner's own OpenAI API key) ---------- */

const SYSTEM_PROMPT = `You are the admin assistant for the website of an architecture and construction engineering firm.
The admin panel can change two things: the owner's display name, and the owner's two photos ("portrait" and "consulting" — photos must be uploaded by hand with the file pickers; you cannot change them yourself).
Always respond with a JSON object: {"reply": "<short friendly message to the owner>", "actions": [ ... ]}.
Supported actions: {"type": "set_owner_name", "value": "<new name>"}.
If the user asks to change the name, include the action. If they ask about photos, explain they should use the upload buttons and then Preview/Publish. For anything else, answer helpfully in "reply" with an empty actions array. Keep replies to 1-3 sentences.`;

const chatHistory = [];

function addMsg(who, text) {
  const log = $("chat-log");
  const div = document.createElement("div");
  div.className = "msg";
  const label = document.createElement("span");
  label.className = "who";
  label.textContent = who;
  div.appendChild(label);
  div.appendChild(document.createTextNode(text));
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

async function sendChat() {
  const key = $("openai-key").value.trim();
  const model = $("openai-model").value.trim() || "gpt-4o-mini";
  const input = $("chat-input");
  const text = input.value.trim();
  if (!text) return;
  if (!key) {
    addMsg("Assistant", "Please paste your OpenAI API key above first.");
    return;
  }
  localStorage.setItem(LS.openaiKey, key);
  input.value = "";
  addMsg("You", text);
  chatHistory.push({ role: "user", content: text });
  addMsg("Assistant", "…thinking…");
  const log = $("chat-log");
  const thinking = log.lastChild;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...chatHistory.slice(-10)],
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `OpenAI returned ${res.status}`);
    }
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || "{}";
    chatHistory.push({ role: "assistant", content: raw });
    let parsed = {};
    try { parsed = JSON.parse(raw); } catch (_) { parsed = { reply: raw, actions: [] }; }

    let applied = "";
    for (const action of parsed.actions || []) {
      if (action.type === "set_owner_name" && action.value) {
        $("owner-name").value = action.value;
        applied = ` (Name field updated to "${action.value}" — press Preview or Publish to apply.)`;
      }
    }
    thinking.remove();
    addMsg("Assistant", (parsed.reply || "Done.") + applied);
  } catch (err) {
    thinking.remove();
    addMsg("Assistant", "Error: " + err.message);
  }
}

$("chat-send").addEventListener("click", sendChat);
$("chat-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendChat();
});

/* ---------- Restore saved fields ---------- */

(function restore() {
  if (localStorage.getItem(LS.openaiKey)) $("openai-key").value = localStorage.getItem(LS.openaiKey);
  if (localStorage.getItem(LS.ghToken)) $("gh-token").value = localStorage.getItem(LS.ghToken);
  if (localStorage.getItem(LS.ghRepo)) $("gh-repo").value = localStorage.getItem(LS.ghRepo);
  if (localStorage.getItem(LS.ghBranch)) $("gh-branch").value = localStorage.getItem(LS.ghBranch);
})();

initGate();
