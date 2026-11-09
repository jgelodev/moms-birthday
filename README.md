# Happy Birthday, Mom.

A single-page birthday letter and family scrapbook. It is plain HTML, CSS and JavaScript with no build step, so it runs straight from GitHub Pages.

## Project structure

```
moms-birthday/
├── index.html              ← all the words and photo slots live here
├── css/style.css           ← colours, type, layout
├── js/script.js            ← scroll reveal, photo viewer
├── assets/
│   └── images/             ← your photos go here
└── README.md
```

Colours are set once at the top of `css/style.css` (the `:root` block). Fonts are Playfair Display, Inter and Caveat, loaded from Google Fonts in `index.html`.

## 1. How to replace the photographs

The current photos are grey placeholders (`placeholder-portrait.svg` and `placeholder-landscape.svg`). Replace them one at a time:

1. **Prepare the photo.** Resize it so its longest side is about 1600 px and save it as a JPEG at around 80% quality. This keeps the page fast on a phone.
2. **Copy it** into `assets/images/`, using a descriptive name such as `mom-01.jpg`, `brother-mom.jpg`, `grandma.jpg` or `family-01.jpg`.
3. **Update the `<img>` tag** in `index.html`. Change `src` to the new file, set `width` and `height` to the photo's pixel dimensions (this stops the page from jumping while it loads), and rewrite `alt` to describe the photo.

Each photo in `index.html` has a comment above it saying which one it is. Look for these sections:

| Where | What it is |
|---|---|
| Hero | The first photo Mom sees (`hero-photo`) |
| Little moments | Six gallery photos, each in its own `<figure class="gallery-item">` |
| From your family | One optional photo per message |
| Closing | The final family photo |

**Adding a gallery photo:** copy one whole `<figure class="gallery-item ...">...</figure>` block and change its image, `alt` and `figcaption`.

**Removing a gallery photo:** delete its whole `<figure>` block.

**Changing the layout:** each gallery item has a size class. `gallery-item--wide` and `gallery-item--medium` are wide, `gallery-item--narrow` and `gallery-item--small` are narrow, and `gallery-item--offset` adds space above on desktop. Mix them for variety.

Use each photo's real proportions. Portrait and landscape photos will keep their own shape, so do not crop them to squares.

## 2. How to edit the birthday letter

Open `index.html` and find the comment that says **EDIT YOUR LETTER HERE**. Everything inside `<div class="letter-body">` is the letter.

- Each paragraph is a `<p>...</p>`. Change the words, or add or delete paragraphs by copying one `<p>` line.
- Change the signature at the bottom of the letter. Replace `[Your name]` inside `<p class="letter-signature">`.
- The heading `A letter for you.` is in `<h2 class="letter-title">`.

Keep the letter short. The page is designed for a few paragraphs.

## 3. How to edit the family messages

Find **From the people who love you.** in `index.html`. There are three `<article class="family-letter">` blocks: one for you, one for your brother, and one for your grandmother.

In each block, replace the bracketed placeholders:

- `<p class="family-relation">` is the relationship line (for example, "Your child").
- `<h3>` is the person's name.
- `<p class="family-message">` is the message. Write it in their own words.
- `<figure class="family-photo">` is an optional photo. Delete the whole block if you do not want one.

Do not publish the page while any `[bracketed text]` is still visible.

## 4. How to change the birthday year

The year appears once, in the footer. Search `index.html` for `birthday-year`, then change the number inside that `<span>`:

```html
<p>Made with love, by your family · <span class="birthday-year">2026</span></p>
```

## 5. Background music

Background music is not included. No audio file was supplied, and the brief asks for music to be left out rather than replaced with unrelated tracks. The page works fully without it.

If you want music later, put your file at `assets/music/background.mp3`, then ask for the player to be added. It will start only when Mom presses play and will never autoplay.

## 6. How to deploy with GitHub Pages

1. **Create a repository** on GitHub, for example `moms-birthday`. Make it public, because GitHub Pages on a free account requires that.
2. **Upload the files.** Upload the whole contents of this folder, with `index.html` in the top level of the repository (not inside another folder). Use "Add file → Upload files" on the GitHub website, or push with Git.
3. **Turn on Pages.** Go to **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, select **main** and **/ (root)**, then press **Save**.
4. **Open the link.** After a minute or two GitHub shows the address, which has this form:

   `https://YOUR-USERNAME.github.io/moms-birthday/`

   Open it on a phone before you share it.

### Before sharing, check

- Every `[bracketed placeholder]` has been replaced.
- No "Replace with your photo" placeholder graphic is visible.
- The letter reads the way you want it to.
- The page works on a phone: scroll through, open a photo, swipe to the next one, and close it.

## Notes

- The page is a single file for content (`index.html`), which makes it easy to edit. Layout and colour changes go in `css/style.css`.
- Animations are subtle and turn off automatically if the phone or computer has "reduce motion" enabled.
- The photo viewer closes with the × button, the Escape key, or a tap outside the photo. On a phone you can swipe left or right to move between photos.
