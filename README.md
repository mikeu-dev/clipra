# Clipra Scraper Engine

**Clipra Scraper Engine** adalah core engine scraper TikTok berperforma tinggi yang dibangun menggunakan Node.js dan TypeScript. Mesin ini dirancang dengan pendekatan **Multi-Layer Extraction** untuk menjamin ketersediaan data meskipun menghadapi proteksi anti-bot yang ketat.

## Fitur Utama

-   **Multi-Layer Strategy**:
    -   **Layer 1 (HTML/Hydration)**: Ekstraksi kilat dari tag script (`SIGI_STATE`, `__UNIVERSAL_DATA__`).
    -   **Layer 3 (Reverse Engineering API)**: Menggunakan endpoint internal feed TikTok (`aweme_id`).
    -   **Layer 4 (Headless Browser Automation)**: Fallback otomatis menggunakan Puppeteer Stealth jika layer HTTP terdeteksi.
-   **Media Proxy Download (Bypass CORS & 403)**:
    -   Mengatasi masalah **403 Forbidden** dari TikTok CDN dengan sinkronisasi User-Agent dinamis.
    -   Proxy bawaan yang memaksa *content-disposition* sebagai attachment untuk memudahkan pengunduhan langsung dari browser.
-   **Dynamic UA Sync**: Mendukung pemindahan identitas (User-Agent) dari proses scraping ke proses download untuk menjaga validitas signature URL.
-   **Advanced Bypass**:
    -   **Proxy Rotation**: Dukungan *Residential Proxy* (Axios & Puppeteer).
    -   **Session Management**: Mengambil cookies/token dari browser dan menyuntikkannya kembali ke request HTTP (Axios) untuk efisiensi.
    -   **Debug Capture**: Screenshot dan HTML dump otomatis jika ekstraksi gagal.
-   **Resiliency**:
    -   **Exponential Backoff Retry**: Pengulangan otomatis jika terjadi timeout atau kegagalan sementara.

## Instalasi

1.  Clone repositori ini.
2.  Instal dependensi:
    ```bash
    npm install
    ```
3.  Salin konfigurasi env:
    ```bash
    cp .env.example .env
    ```
    Isi `PROXY_URL` jika Anda memiliki provider proxy.

## Penggunaan

### Menjalankan API Server
```bash
npm run dev
```

#### Endpoints:
-   **Ekstraksi Data**: `GET /scrape?url=...`
-   **TikWM Compatibility (POST/GET)**: `/scrape/tikwm` (Untuk integrasi frontend TikTok Adgate).
-   **Proxy Download**: `/scrape/download?url=...&ua=...&type=...`
    -   `url`: URL media dari TikTok CDN.
    -   `ua`: User-Agent yang diperoleh dari hasil scrape (Wajib untuk menghindari 403).
    -   `type`: Jenis file (`MP4`, `MP3`, atau `JPG`).

### Menjalankan CLI Test
```bash
npx ts-node src/test-cli.ts "URL_TIKTOK_NYATA"
```

## Arsitektur

-   `src/extractors/`: Logika parsing data spesifik per layer.
-   `src/providers/`: Client eksternal (HTTP, Browser, Session).
-   `src/controllers/`: Handler untuk routing API dan logika Proxy Download.
-   `src/services/engine.service.ts`: Orkestrator utama yang mengatur strategi failover dan retry.

## Catatan Reverse Engineering
Mesin ini diprogram untuk mensimulasikan browser asli. Jika Anda mengalami **429 (Too Many Requests)** pada Layer 3, mesin akan secara otomatis beralih ke Layer 1 atau Layer 4. Penggunaan *Dynamic UA Sync* pada proxy download sangat krusial karena TikTok melakukan validasi silang antara User-Agent, Cookies, dan Signature URL yang dihasilkan.
