// Applies site-config.json (owner name + photos) to the page.
// A local draft saved by admin.html (localStorage) takes priority,
// so the owner can preview changes before publishing.
(async () => {
  let config = null;

  try {
    const draft = localStorage.getItem("go-site-config-draft");
    if (draft) config = JSON.parse(draft);
  } catch (_) { /* ignore corrupt draft */ }

  if (!config) {
    try {
      const res = await fetch("site-config.json", { cache: "no-store" });
      if (res.ok) config = await res.json();
    } catch (_) { /* offline or file:// — keep the HTML defaults */ }
  }

  if (!config) return;

  if (config.ownerName) {
    document.querySelectorAll("[data-owner-name]").forEach((el) => {
      el.textContent = config.ownerName;
    });
  }

  if (config.images) {
    const v = config.version ? `?v=${config.version}` : "";
    document.querySelectorAll("img[data-photo]").forEach((img) => {
      const src = config.images[img.dataset.photo];
      if (src) img.src = src.startsWith("data:") ? src : src + v;
    });
  }
})();
