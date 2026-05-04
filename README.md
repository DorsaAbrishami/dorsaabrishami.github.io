# alikashani.github.io

Personal portfolio site for Dorsa Abrishami — Data Analyst.

## Structure

```
dorsaabrishami.github.io/
├── index.html      # Portfolio (root entry point)
├── style.css       # All styles
├── script.js       # All JS
└── assets/         # Images, icons, etc.
```

## Local development

It's a fully static site — open `index.html` directly in a browser, or
serve the folder with any static file server, e.g.:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000.

## Customization

Search the codebase for `TODO: Replace` to find every spot to drop in
your own content (bio, projects, links, Tableau URLs, etc.). The full
color palette is defined in CSS variables at the top of `style.css` —
edit the `:root` block to retheme.
