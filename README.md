# Anuvéa Digital Sales Invoice

A mobile-first static web application for generating professional Anuvéa Sales Invoices.

## Files
- `index.html` — main application (logo embedded as base64, no server needed)
- `style.css` — all visual styling
- `script.js` — calculations, validation, PDF generation, sharing

## Deploy to GitHub Pages

1. Create a new GitHub repository (e.g. `anuvea-invoice`)
2. Upload all three files to the repository root
3. Go to **Settings → Pages → Source → main branch / root**
4. Your tool will be live at `https://yourusername.github.io/anuvea-invoice/`

## How it works

1. Open the page on any Android phone browser
2. Fill in member details and product rows
3. Amounts calculate automatically as you type
4. Select payment mode (Cash / UPI / Due)
5. Enter Community Partner name
6. Tap **Generate & Share Invoice**
   - On Android: opens the native share sheet → tap WhatsApp to share
   - On desktop: opens the invoice in a print window (save as PDF)
7. Or tap **Download** to download an HTML invoice file

## Bill Number Format
`ANU-YYYYMMDD-HHMMSS` — generated at the moment you tap the share button.

## No login · No backend · No database
Version 1 is fully static. Everything runs in the browser.
