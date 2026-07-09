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

## Customizing

- **Contact details** (email, phones, addresses) appear in every page's footer and on `contact.html` — the current values are placeholders; search-and-replace to update.
- **Photos** live in `assets/images/`.
- **Colors and fonts** are defined as CSS variables at the top of `css/style.css`.
