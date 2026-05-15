# Upload your gallery photos here

Put images for each menu page in the matching folder:

| Menu item | Folder |
|-----------|--------|
| Babyface 美式新生兒寫真 (home) | `newborn/` |
| 家庭/周歲攝影 | `family/` |
| 婚禮攝影 | `wedding/` |

## Supported formats

`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif` (case-insensitive)

## After adding or removing files

From the project root, regenerate the manifest so the site knows which files to show:

```bash
python3 scripts/scan-uploads.py
```

Then commit `data/uploads-manifest.json` together with your new images and push to GitHub.

## How it works

- If a folder has **at least one** image, the site uses **only** those files for that page.
- If a folder is **empty**, the site falls back to the default list in `data/galleries.json` (Squarespace CDN).

## Placeholder previews (optional)

The repo may include `uploads/newborn/placeholder-*.jpg` (from [Lorem Picsum](https://picsum.photos/)) so you can review the gallery layout before adding your own files. Delete those files, add your photos, then run `python3 scripts/scan-uploads.py` again.

## Tips

- Use short filenames without spaces if you can (e.g. `01.jpg`, `newborn-01.jpg`).
- Sort order is alphabetical by filename.
