# LUXYNE - Convert gambar dari link

Website statis. Tidak perlu npm, tidak perlu build. Isi folder ini langsung jalan.

## Cara pakai
1. Buka `index.html` di browser, atau
2. Upload seluruh isi folder ke Netlify (drag and drop), GitHub Pages, atau hosting statis lain.

## Key API foto dan video
Buka `js/config.js`, isi key Pixabay dan/atau Unsplash. Satu sumber boleh punya banyak key (pool).
Tanpa key, pencarian foto tetap jalan lewat Openverse, Wikimedia Commons, lalu Picsum.
Pencarian video butuh key Pixabay.

## Urutan fallback pencarian foto
Pixabay, Unsplash, Openverse, Wikimedia Commons, Picsum.

## Catatan
- Gambar dari link dimuat langsung; kalau situs asal memblokir, otomatis lewat wsrv.nl.
- Efek (filter dan slider) memakai fitur canvas yang jalan di Chrome, Edge, dan Firefox. Safari belum mendukung.
- AVIF dan GIF memakai wsrv.nl, jadi hanya untuk gambar dari link (efek geser tidak ikut).
- Key ada di file frontend, jadi bisa dilihat pengunjung. Pakai key gratis saja.
- Belum ada: Background Remover, Blur Background, Image to URL.
