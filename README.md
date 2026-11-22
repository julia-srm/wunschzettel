# 🎄 Wunschzettel – Christmas Wishlist

A small, festive wishlist website with falling snow, a Christmas countdown and category filters.
Plain HTML/CSS/JS, so there's nothing to install or build.

## ✏️ Edit your wishes

Open **`wishlist.js`** and change the title, the message and the list of wishes.
Each wish looks like this:

```js
{
  name: "Cozy wool scarf",          // required
  description: "Dark green please", // optional
  price: "€30",                     // optional
  link: "https://…",                // optional – shows a "View" button
  image: "images/scarf.jpg",        // optional – URL or file in this repo
  priority: "high",                 // "high" | "medium" | "low"
  category: "Clothes",              // optional – used for the filter buttons
},
```

Wishes are sorted by priority automatically.

## 👀 Preview locally

Just double-click `index.html` to open it in your browser.

## 🚀 Publish with GitHub Pages

1. Commit and push the files to GitHub:
   ```sh
   git add .
   git commit -m "Add Christmas wishlist"
   git push
   ```
2. On GitHub, open the repository → **Settings** → **Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*,
   pick the branch **main** and the folder **/ (root)**, then click **Save**.
4. After a minute your wishlist is live at
   `https://<your-username>.github.io/wunschzettel/` 🎁

Every time you push a change to `wishlist.js`, the site updates automatically.
