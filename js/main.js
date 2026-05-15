function initMobileNav() {
  const toggle = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".nav-mobile");
  if (!toggle || !mobileNav) return;

  const backdrop = document.createElement("button");
  backdrop.type = "button";
  backdrop.className = "mobile-nav-backdrop";
  backdrop.setAttribute("aria-label", "關閉選單");
  document.body.appendChild(backdrop);

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "關閉選單" : "開啟選單");
    mobileNav.classList.toggle("is-open", open);
    backdrop.classList.toggle("is-visible", open);
    document.body.classList.toggle("mobile-nav-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    setOpen(!open);
  });

  backdrop.addEventListener("click", () => {
    setOpen(false);
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setOpen(false);
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) setOpen(false);
  });
}

/** @type {{ urls: string[], index: number } | null} */
let lightboxState = null;

function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox) return;

  const img = lightbox.querySelector("img");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const prevBtn = lightbox.querySelector(".lightbox-prev");
  const nextBtn = lightbox.querySelector(".lightbox-next");

  function showLightbox(i) {
    if (!lightboxState || !img) return;
    const n = lightboxState.urls.length;
    if (n === 0) return;
    lightboxState.index = ((i % n) + n) % n;
    img.src = lightboxState.urls[lightboxState.index];
    img.alt = `第 ${lightboxState.index + 1} 張，共 ${n} 張`;
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function hideLightbox() {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    if (img) img.src = "";
    lightboxState = null;
  }

  function openLightbox(urls, startIndex) {
    if (!urls.length) return;
    lightboxState = { urls, index: startIndex };
    showLightbox(startIndex);
  }

  document.addEventListener("click", (e) => {
    const item = e.target.closest(".gallery-item");
    if (!item) return;
    const items = [...document.querySelectorAll(".gallery-item")].sort(
      (a, b) => Number(a.dataset.index) - Number(b.dataset.index)
    );
    const idx = items.indexOf(item);
    const fullUrls = items.map((fig) => {
      const el = fig.querySelector("img");
      return el ? el.getAttribute("data-full-src") || el.src : "";
    });
    openLightbox(fullUrls, idx >= 0 ? idx : 0);
  });

  closeBtn?.addEventListener("click", hideLightbox);
  prevBtn?.addEventListener("click", () => showLightbox(lightboxState ? lightboxState.index - 1 : 0));
  nextBtn?.addEventListener("click", () => showLightbox(lightboxState ? lightboxState.index + 1 : 0));

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) hideLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") hideLightbox();
    if (e.key === "ArrowLeft") showLightbox(lightboxState ? lightboxState.index - 1 : 0);
    if (e.key === "ArrowRight") showLightbox(lightboxState ? lightboxState.index + 1 : 0);
  });

}

/**
 * @param {string} src
 * @param {'thumb' | 'hero' | 'full'} role
 */
function galleryImageSrc(src, role) {
  if (!src.startsWith("http://") && !src.startsWith("https://")) {
    return src;
  }
  const base = src.split("?")[0];
  const format = role === "thumb" ? "400w" : role === "hero" ? "1200w" : "2500w";
  return `${base}?format=${format}`;
}

function unwrapDenseMasonry(grid) {
  grid.querySelectorAll(".masonry-col").forEach((col) => {
    while (col.firstChild) grid.appendChild(col.firstChild);
    col.remove();
  });
  grid.classList.remove("masonry-ready", "masonry-two");
}

/**
 * Pack images into two columns by shortest-column height (masonry-style), preserving natural aspect ratio.
 */
async function layoutDenseMasonry(grid) {
  if (!grid.classList.contains("gallery-grid--dense")) return;

  unwrapDenseMasonry(grid);

  const figures = [...grid.querySelectorAll(".gallery-item")];
  if (!figures.length) return;

  await Promise.all(
    figures.map((fig) => {
      const im = fig.querySelector("img");
      if (!im) return Promise.resolve();
      if (im.complete && im.naturalWidth > 0) return Promise.resolve();
      return new Promise((resolve) => {
        im.onload = im.onerror = () => resolve();
      });
    })
  );

  const section = grid.closest(".gallery-section--fullbleed");
  const gutterRaw = section ? getComputedStyle(section).getPropertyValue("--gallery-gutter").trim() : "8px";
  const gapPx = Number.parseFloat(gutterRaw) || 8;

  const twoCol = window.matchMedia("(min-width: 481px)").matches;

  if (!twoCol) {
    grid.classList.add("masonry-ready");
    return;
  }

  const innerW = grid.clientWidth;
  const colW = Math.max(1, (innerW - gapPx) / 2);

  const col0 = document.createElement("div");
  const col1 = document.createElement("div");
  col0.className = "masonry-col";
  col1.className = "masonry-col";

  let acc0 = 0;
  let acc1 = 0;
  for (const fig of figures) {
    const img = fig.querySelector("img");
    let h = colW * 0.8;
    if (img && img.naturalWidth > 0) h = (img.naturalHeight / img.naturalWidth) * colW;
    if (acc0 <= acc1) {
      col0.appendChild(fig);
      acc0 += h + gapPx;
    } else {
      col1.appendChild(fig);
      acc1 += h + gapPx;
    }
  }

  grid.appendChild(col0);
  grid.appendChild(col1);
  grid.classList.add("masonry-ready", "masonry-two");
}

let masonryResizeTimer;
window.addEventListener("resize", () => {
  const grid = document.getElementById("gallery");
  if (!grid?.classList.contains("gallery-grid--dense")) return;
  if (!grid.classList.contains("masonry-ready")) return;
  clearTimeout(masonryResizeTimer);
  masonryResizeTimer = window.setTimeout(() => {
    void layoutDenseMasonry(grid);
  }, 200);
});

/** Used when data/uploads-manifest.json cannot be fetched (e.g. opening index.html as file://). */
function readPageGalleryFallback() {
  const el = document.getElementById("page-gallery-fallback");
  if (!el) return null;
  try {
    return JSON.parse(el.textContent.trim());
  } catch {
    return null;
  }
}

async function loadGallery(galleryKey) {
  const grid = document.getElementById("gallery");
  if (!grid) return;

  try {
    let manifest = {};
    let manifestOk = false;
    try {
      const manifestRes = await fetch("data/uploads-manifest.json");
      if (manifestRes.ok) {
        manifest = await manifestRes.json();
        manifestOk = true;
      }
    } catch {
      manifest = {};
    }

    if (!manifestOk) {
      const fb = readPageGalleryFallback();
      if (fb && typeof fb === "object") manifest = fb;
    }

    let remote = {};
    try {
      const remoteRes = await fetch("data/galleries.json");
      if (remoteRes.ok) remote = await remoteRes.json();
    } catch {
      remote = {};
    }

    const local = Array.isArray(manifest[galleryKey]) ? manifest[galleryKey] : [];
    const images = local.length > 0 ? local : remote[galleryKey] || [];

    if (!images.length) {
      const hint =
        galleryKey === "newborn"
          ? "找不到圖片。請把照片放到 <code>uploads/newborn/</code> 後執行 <code>python3 scripts/scan-uploads.py</code>；若先不上傳照片，也會改用預設的線上相簿。"
          : "找不到圖片。請把照片放到 uploads 資料夾後執行 python3 scripts/scan-uploads.py";
      grid.innerHTML = `<p class="loading">${hint}</p>`;
      return;
    }

    grid.innerHTML = images
      .map((src, i) => {
        const tile = galleryImageSrc(src, "hero");
        const full = galleryImageSrc(src, "full");
        return `
      <figure class="gallery-item" data-index="${i}">
        <img src="${tile}" data-full-src="${full}" alt="Babyface 攝影作品第 ${i + 1} 張" loading="lazy" width="1200">
      </figure>`;
      })
      .join("");

    await layoutDenseMasonry(grid);
  } catch {
    grid.innerHTML = '<p class="loading">無法載入相簿。</p>';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initLightbox();

  const galleryKey = document.body.dataset.gallery;
  if (galleryKey) loadGallery(galleryKey);
});
