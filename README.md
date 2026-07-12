# Gregory Olav Architectural & Consulting LLC — Website

Marketing site for **Gregory Olav Architectural & Consulting LLC**, a Norwegian-founded architectural and consulting practice operating across the United States.

## Pages

| Page | File | Purpose |
| --- | --- | --- |
| Home | `index.html` | Hero, services overview, Norway–US story, featured work, founder teaser |
| Services | `services.html` | Design, consulting/advisory, and project delivery — plus the five-step process |
| Projects | `projects.html` | Selected work with illustrated project cards |
| Gregory Olav | `gregory-olav.html` | Dedicated founder page: biography, philosophy, timeline, credentials |
| Contact | `contact.html` | Offices (New York & Oslo) and an inquiry form |
| Admin | `admin.html` | Owner-only panel (unlinked): change name/photos, ChatGPT assistant, publish via GitHub |

## Tech

- Pure static HTML/CSS/JS — no build step, no dependencies to install.
- Typography: [Fraunces](https://fonts.google.com/specimen/Fraunces) + [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts.
- Small vanilla JS (`js/main.js`) for the mobile nav, scroll reveal, and the contact form (opens a pre-filled email — no backend).
- Fully responsive; respects `prefers-reduced-motion`.

## Run locally

Open `index.html` directly, or serve the folder:

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

## Deploy

Works as-is on any static host (GitHub Pages, Netlify, Vercel, S3). For GitHub Pages: Settings → Pages → deploy from the branch root.

## Admin panel

`admin.html` is an owner-only page (not linked from the site, `noindex`) for changing the owner's **display name** and **two photos** everywhere they appear. It works like this:

- Every page loads `js/config.js`, which reads `site-config.json` and applies the name to `[data-owner-name]` elements and photos to `img[data-photo]` elements.
- **Preview** saves a draft to the browser's localStorage so the owner can check the site before going live (only visible on that browser).
- **Publish** commits `site-config.json` (and any uploaded photos) to this GitHub repo via the GitHub Contents API, using a fine-grained personal access token the owner pastes in (scope: this repo only, Contents read/write). The live site then updates for everyone.
- **ChatGPT assistant**: paste an OpenAI API key and give instructions in plain English (e.g. "change my name to …"); the assistant stages the change for review.

**Security notes**

- The passphrase gate is a deterrent only — a static site cannot do real authentication. The GitHub token is what actually protects publishing.
- The OpenAI key and GitHub token are stored in the owner's browser localStorage only. **Never hardcode either into the site's files** — anything committed to a public site is visible to everyone.
- The admin page must be opened over HTTP(S) (the deployed site or a local server), not as a `file://` page.

## Customizing

- **Contact details** (email, phones, addresses) appear in every page's footer and on `contact.html` — the current values are placeholders; search-and-replace to update.
- **Photos** live in `assets/images/`.
- **Colors and fonts** are defined as CSS variables at the top of `css/style.css`.
