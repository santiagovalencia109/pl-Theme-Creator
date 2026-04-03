# 🎨 Pico Launcher Theme Creator & Decoder

A powerful, entirely browser-based tool to create, edit, and extract custom themes for **Pico Launcher**. Generate perfectly formatted `.zip` themes with a live preview, convert audio to BCSTM, or decode proprietary `.bin` textures and palettes back into `.png` images.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![WASM](https://img.shields.io/badge/WASM-654FF0?style=for-the-badge&logo=webassembly&logoColor=white)

## ✨ Features

### 🛠️ 1. Ultimate Theme Creator
Create a complete, ready-to-use theme `.zip` package in seconds:
- **Multi-Version Compatibility**: Switch between **Legacy** and **v1.2.0+ (Latest)** modes. The UI intelligently adapts, disabling advanced positioning fields when they aren't supported by the launcher version.
- **Advanced Image Cropping**: Upload your wallpapers and crop them specifically to the exact 256x192 resolution required by dual-screen hardware.
- **Smart Layout Guides**: Independent **Top** and **Bottom** guide overlays with high-fidelity text preview (stroke-based effects) and dashed bounding boxes to visualize element widths. Guides automatically hide when custom icon layouts are active to avoid clutter.
- **Custom Menu Icons**: Upload your own PNG icons for Grid and Banner views. Downloadable layout templates are included to help you design your assets.
- **Integrated Theme Library**: Browse and download community themes directly from the **GBAtemp Library** tab, powered by a Supabase backend.
- **Interactive Drag & Resize**: Click and drag any element on the **Top Screen Preview** to move it. You can also resize text fields (Title, Description, Filename) by dragging their right edges directly on the console screen (available in v1.2.0+ mode).
- **Live Preview**: See how your theme looks on a real Nintendo DS frame, including translucent box settings and custom icons.
- **Auto-Conversion**: The tool automatically processes your images and colors into the precise bit-depths and formats required (`15bpp`, `A3I5`, `A5I3`, `.pltt`).

### 🎵 2. Built-in BCSTM Audio Encoder
Convert your favorite music directly in the browser:
- **Fast Conversion**: Powered by a native WASM encoder for high-performance audio processing.
- **Advanced Trimming**: Use a visual waveform to select the exact start and end points of your music.
- **Loop Support**: Automatically configures the output for seamless looping in Pico Launcher.
- **Independent Download**: You can download the `.bcstm` file separately if you only need the music.

### 🔍 3. Universal `.bin` Decoder
Extract and view hidden images and masks from existing Pico Launcher themes:
- **Intelligent Detection**: Automatically detects the file type based on its original filename.
- **Backgrounds (`topbg.bin`, `bottombg.bin`)**: Decodes 15bpp RGB arrays into standard visible images.
- **Alpha Masks (`bannerListCell.bin`, `gridcell.bin`)**: Accurately renders proprietary transparency masks.
- **Palette Viewer (`*Pltt.bin`)**: Reads 15bpp color palettes and renders them into a neat visual color grid.
- **PNG Export**: One-click download to save any decoded texture as a standard `.png` file.

## 🚀 Usage

**CRITICAL:** Due to modern browser security restrictions (CORS), this application **cannot** be run by simply double-clicking `index.html`. It must be served through a local or web server to allow WebWorkers and WASM to function correctly.

1. Clone or download this repository.
2. Open the folder in a local server:
   - **VS Code**: Use the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension.
   - **Python**: Run `python -m http.server` in the directory.
   - **Node.js**: Use `npx serve .`.
3. Open the provided local URL in a modern browser (Chrome, Edge, Firefox).
4. **To Create a Theme:** Go to the "Theme Creator" tab, fill in the details, upload backgrounds/icons, and click **Generate Full Theme (.zip)**.
5. **To Extract a File:** Go to the ".bin Decoder" tab, upload any valid `.bin` or `Pltt.bin` file from an existing theme, and view/download the result.

## 📥 How to Install Your Theme

Once you have generated and downloaded your theme, follow these steps to apply it to your device:

1.  **Prepare the Theme Folder**: Extract the downloaded `.zip` file into a new folder. Note that the name of this folder will be referenced as your theme's name.
2.  **Transfer to SD Card**: Connect your SD card and navigate to the `/_pico/themes/` directory. Copy and paste your entire theme folder into this location.
3.  **Configure Pico Launcher**:
    *   Navigate back to the `/_pico/` root folder.
    *   Open the `settings.json` file with a text editor.
    *   Find the `"theme"` entry and change its value to match the exact name of your theme folder (e.g., `"theme": "MyCustomTheme"`).
4.  **Launch**: Save the changes to the JSON file and restart your Pico Launcher to enjoy your custom creation!

## 🧰 Technical Details & Formats Handled

This tool processes internal textures directly into the browser's `<canvas>` and handles binary manipulation via `ArrayBuffer` and `Uint8Array`. 

Supported conversions:
*   **Backgrounds (256x192):** Converted to/from **15bpp** (5 bits per RGB channel).
*   **Grid/List Cells:** Converted to/from **A3I5** (3-bit Alpha, 5-bit Index).
*   **Scrim Shadows:** Converted to/from **A5I3** (5-bit Alpha, 3-bit Index).
*   **Palettes:** Converted to/from 64-byte 15bpp arrays.
*   **Audio:** Encodes PCM16 to **BCSTM** (Nintendo DSP/ADPCM).

## 📦 Libraries Used

This project wouldn't be possible without these awesome open-source libraries:
*   [**JSZip**](https://stuk.github.io/jszip/): For generating the final `.zip` package.
*   [**Cropper.js**](https://fengyuanchen.github.io/cropperjs/): For the image cropping UI.
*   [**Pickr**](https://simonwep.github.io/pickr/): For the modern color pickers.
*   [**WaveSurfer.js**](https://wavesurfer-js.org/): For the interactive audio waveform visualization.
*   **Native WASM Encoder**: Leveraging [kazuki-4ys](https://github.com/kazuki-4ys/)'s high-performance audio encoding logic.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE). Feel free to modify, distribute, and use it in your own projects.