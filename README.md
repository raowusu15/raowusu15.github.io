# raowusu15.github.io

Personal academic site for **Robert Afiakwa Owusu** — computational bioengineering, computer-aided
drug discovery and medical imaging. KCCR / KNUST, Kumasi, Ghana.

Plain HTML, CSS and JavaScript. No build step, no Jekyll, no dependencies.

## Updating

Content that changes lives in four JSON files. You never edit HTML to add an item.

| To do this | Edit |
|---|---|
| Add a paper, preprint or poster | `data/publications.json` |
| Add or recaption photos, add an album | `data/gallery.json` |
| Add a post | `data/posts.json` |
| Change the fallback repo list | `data/repos.json` |

The **GitHub** page needs no maintenance — it calls the public GitHub API and lists your
non-forked, non-archived repositories automatically. Write a one-line description on each repo
in GitHub; that description is what appears on the page.

### Adding a publication

```json
{
  "title": "Title",
  "authors": "R. A. Owusu, ...",
  "venue": "Journal, volume(issue), pages",
  "year": 2027,
  "summary": "One or two sentences.",
  "status": "Published",
  "links": [{ "label": "DOI", "url": "https://doi.org/..." }]
}
```

Grouped by `year`, newest first. Omit `year` and it appears at the top under **In preparation**.

### Adding photos

Drop the files into `assets/img/`, then add them to an album in `data/gallery.json`:

```json
{ "file": "myphoto.jpg", "caption": "What it shows" }
```

Compress first (squoosh.app). Aim for under 300 KB each.

## Deploying

Push to `main`. GitHub Pages republishes within a minute.

```bash
git add .
git commit -m "Update site"
git push
```

## Previewing locally

```bash
python3 -m http.server 8000
```

Use a server, not a double-click on `index.html` — opening the file directly blocks the `fetch()`
calls that load the JSON, so publications and the gallery will look empty.

## Structure

```
index.html              Home — bio, research areas, training, education
publications/           Papers and manuscripts
cv/                     Full CV (PDF in files/)
github/                 Repositories, live from the GitHub API
teaching/               KNUST teaching, ASAP tutoring, YouTube
blog/                   Posts
gallery/                Photographs, organised to match the CV
assets/css/style.css    All styling; design tokens in :root
assets/js/site.js       Nav, JSON rendering, lightbox
data/*.json             Everything that changes
```
