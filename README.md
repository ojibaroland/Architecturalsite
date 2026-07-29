# George B Magnus Structural Group — Website

Marketing site for **George B Magnus Structural Group**, the architecture and construction engineering practice of **George B Magnus**, based in Lawton, Oklahoma.

> **Demo status:** biography copy, project cards, photos, and the contact email are
> placeholders, marked with `<!-- PLACEHOLDER ... -->` comments in the HTML. Replace them
> with client-provided, approved content before launch. Only publish business details
> (never a home address or other personal records), and only credentials the client has
> verified.

## Pages

| Page | File | Purpose |
| --- | --- | --- |
| Home | `index.html` | Hero, services overview, one-firm story, featured work, principal teaser |
| Services | `services.html` | Design, structural/construction engineering, and construction delivery — plus the five-step process |
| Projects | `projects.html` | Representative concept studies with illustrated project cards |
| George B Magnus | `george-magnus.html` | Principal page: about, philosophy, areas of practice, capabilities |
| Contact | `contact.html` | Locations (Lawton, OK & Milton, MA) and an inquiry form |
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

- **Contact details**: the email address is a placeholder; the phone number appears in every page's footer and on `contact.html`. Search-and-replace to update.
- **Photos** live in `assets/images/` (`owner-portrait.jpeg`, `owner-consulting.jpeg`) — both are stock placeholders to be replaced with real photos of the client.
- **Colors and fonts** are defined as CSS variables at the top of `css/style.css`.
