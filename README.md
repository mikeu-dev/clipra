# Clipra Scraper Engine

**Clipra Scraper Engine** adalah core engine scraper TikTok berperforma tinggi yang dibangun menggunakan Node.js dan TypeScript. Mesin ini dirancang dengan pendekatan **Multi-Layer Extraction** untuk menjamin ketersediaan data meskipun menghadapi proteksi anti-bot yang ketat.

## Fitur Utama

-   **Multi-Layer Strategy**:
    -   **Layer 1 (HTML/Hydration)**: Ekstraksi kilat dari tag script (`SIGI_STATE`, `__UNIVERSAL_DATA__`).
    -   **Layer 2 (Header Simulation)**: Spoofing header tingkat lanjut untuk meniru browser asli.
    -   **Layer 3 (Reverse Engineering API)**: Menggunakan endpoint internal feed TikTok (`aweme_id`).
    -   **Layer 4 (Headless Browser Automation)**: Fallback otomatis menggunakan Puppeteer Stealth jika layer HTTP terdeteksi.
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
Endpoint: `GET http://localhost:3000/scrape?url=...`

### Menjalankan CLI Test
```bash
npx ts-node src/test-cli.ts "URL_TIKTOK_NYATA"
```

## Arsitektur

-   `src/extractors/`: Logika parsing data spesifik per layer.
-   `src/providers/`: Client eksternal (HTTP, Browser, Session).
-   `src/services/engine.service.ts`: Orkestrator utama yang mengatur strategi failover dan retry.

## Catatan Reverse Engineering
Mesin ini menggunakan endpoint normal (`tiktokv.com`). Untuk skalabilitas tinggi, disarankan menggunakan *Rotating Residential Proxy* guna menghindari status `10204 (Item doesn't exist)` yang dipicu oleh deteksi IP datacenter.
