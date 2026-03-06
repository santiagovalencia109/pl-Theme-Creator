# 🎨 Pico Launcher Theme Creator & Decoder

A powerful, entirely browser-based tool to create, edit, and extract custom themes for **Pico Launcher**. Generate perfectly formatted `.zip` themes with a live preview, or decode proprietary `.bin` textures and palettes back into `.png` images.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![No Backend](https://img.shields.io/badge/No_Backend-100%25_Client--Side-brightgreen?style=for-the-badge)

## ✨ Features

### 🛠️ 1. Ultimate Theme Creator
Create a complete, ready-to-use theme `.zip` package in seconds:
- **General Settings**: Customize your theme's name, author, description, and base UI colors (MD3 Base, Menu Selected/Unselected).
- **Dark Mode Support**: Easily toggle the Dark Mode metadata flag.
- **Advanced Image Cropping**: Upload your wallpapers and crop them specifically to the exact 256x192 resolution required by dual-screen hardware.
- **Live Overlay Preview**: Add and adjust a custom translucent overlay box for the top screen. You can control the fill color, independent border color, opacity, and corner radius with real-time feedback.
- **Auto-Conversion**: The tool automatically processes your images and colors into the precise bit-depths and formats required (`15bpp`, `A3I5`, `A5I3`, `.pltt`).

### 🔍 2. Universal `.bin` Decoder
Extract and view hidden images and masks from existing Pico Launcher themes:
- **Intelligent Detection**: Automatically detects the file type based on its original filename (ignores extra padding bytes that break other tools).
- **Backgrounds (`topbg.bin`, `bottombg.bin`)**: Decodes 15bpp RGB arrays into standard visible images.
- **Alpha Masks (`bannerListCell.bin`, `gridcell.bin`, `scrim.bin`)**: Accurately renders proprietary A3I5 and A5I3 transparency masks so you can see their exact shapes and gradients.
- **Palette Viewer (`*Pltt.bin`)**: Reads 15bpp color palettes and renders them into a neat visual color grid.
- **PNG Export**: One-click download to save any decoded texture as a standard `.png` file.

## 🚀 Usage

Since the application is 100% client-side, there is no need to install Node.js, Python, or any web server.

1. Clone or download this repository.
2. Double-click on `index.html` to open it in your favorite modern web browser (Chrome, Edge, Firefox, Safari).
3. **To Create a Theme:** Go to the "Theme Creator" tab, fill in your details, upload and crop your Top/Bottom screen backgrounds, and click **Generate Full Theme (.zip)**.
4. **To Extract a File:** Go to the ".bin Decoder" tab, upload any valid `.bin` or `Pltt.bin` file from an existing theme, and view/download the result.

## 🧰 Technical Details & Formats Handled

This tool processes internal textures directly into the browser's `<canvas>` and handles binary manipulation via `ArrayBuffer` and `Uint8Array`. 

Supported conversions:
*   **Backgrounds (256x192):** Converted to/from **15bpp** (5 bits per RGB channel).
*   **Grid/List Cells:** Converted to/from **A3I5** (3-bit Alpha, 5-bit Index).
*   **Scrim Shadows:** Converted to/from **A5I3** (5-bit Alpha, 3-bit Index).
*   **Palettes:** Converted to/from 64-byte 15bpp arrays.

## 📦 Libraries Used

This project wouldn't be possible without these awesome open-source libraries:
*   [**JSZip**](https://stuk.github.io/jszip/): For generating the final `.zip` package entirely in the browser.
*   [**Cropper.js**](https://fengyuanchen.github.io/cropperjs/): For the smooth, aspect-ratio-locked image cropping UI.
*   [**Pickr**](https://simonwep.github.io/pickr/): For the beautiful, modern, and compact color pickers.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE). Feel free to modify, distribute, and use it in your own projects.