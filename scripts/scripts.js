


function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');

    // Fetch library if tab opened and not already loaded
    if (tabId === 'tabLibrary' && !libraryLoaded) {
        fetchThemes();
    }
}

function switchNestedTab(tabId) {
    // Select the container of the clicked button to limit the scope if multiple tabpanels exist
    const parent = document.getElementById(tabId).parentElement;
    parent.querySelectorAll('.nested-tab-content').forEach(tab => tab.classList.remove('active'));

    // Deactivate all buttons in the same nested-tabs container
    const tabsContainer = parent.querySelector('.nested-tabs');
    tabsContainer.querySelectorAll('.nested-tab-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

/* =========================================
   0. SUPABASE INITIALIZATION & LIBRARY
   ========================================= */

function loadThemeFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.type !== 'custom') {
                return alert("Invalid theme.json (type is not custom)");
            }

            const rgbToHex = (rgb) => {
                const { r, g, b } = rgb;
                return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
            };

            const setValue = (id, val, isColor = false) => {
                const el = document.getElementById(id);
                if (!el) return;
                if (isColor) {
                    const hex = rgbToHex(val);
                    el.value = hex;
                    if (window.pickrInstances && window.pickrInstances[id]) {
                        window.pickrInstances[id].setColor(hex);
                    }
                } else if (el.type === 'checkbox') {
                    el.checked = val;
                } else {
                    el.value = val;
                }
                el.dispatchEvent(new Event('input'));
                el.dispatchEvent(new Event('change'));
            };

            // Detect Version Compatibility
            if (data.topIcon || data.topBannerTextLine0) {
                document.getElementById('tVersion').value = 'latest';
            } else {
                document.getElementById('tVersion').value = 'legacy';
            }

            // Basic Info
            if (data.name) setValue('tName', data.name);
            if (data.author) setValue('tAuthor', data.author);
            if (data.description) setValue('tDesc', data.description);
            if (data.darkTheme !== undefined) setValue('tDark', data.darkTheme);
            if (data.primaryColor) setValue('tColor', data.primaryColor, true);

            // Top screen elements
            if (data.topIcon) {
                if (data.topIcon.position) {
                    setValue('tiX', data.topIcon.position.x);
                    setValue('tiY', data.topIcon.position.y);
                }
                if (data.topIcon.blendColor) setValue('tiBC', data.topIcon.blendColor, true);
            }

            if (data.topBannerTextLine0) {
                if (data.topBannerTextLine0.position) {
                    setValue('tbt0X', data.topBannerTextLine0.position.x);
                    setValue('tbt0Y', data.topBannerTextLine0.position.y);
                }
                if (data.topBannerTextLine0.width !== undefined) setValue('tbt0W', data.topBannerTextLine0.width);
                if (data.topBannerTextLine0.textColor) setValue('tbt0TC', data.topBannerTextLine0.textColor, true);
                if (data.topBannerTextLine0.blendColor) setValue('tbt0BC', data.topBannerTextLine0.blendColor, true);
            }

            if (data.topBannerTextLine1) {
                if (data.topBannerTextLine1.position) {
                    setValue('tbt1X', data.topBannerTextLine1.position.x);
                    setValue('tbt1Y', data.topBannerTextLine1.position.y);
                }
                if (data.topBannerTextLine1.width !== undefined) setValue('tbt1W', data.topBannerTextLine1.width);
                if (data.topBannerTextLine1.textColor) setValue('tbt1TC', data.topBannerTextLine1.textColor, true);
                if (data.topBannerTextLine1.blendColor) setValue('tbt1BC', data.topBannerTextLine1.blendColor, true);
            }

            if (data.topBannerTextLine2) {
                if (data.topBannerTextLine2.position) {
                    setValue('tbt2X', data.topBannerTextLine2.position.x);
                    setValue('tbt2Y', data.topBannerTextLine2.position.y);
                }
                if (data.topBannerTextLine2.width !== undefined) setValue('tbt2W', data.topBannerTextLine2.width);
                if (data.topBannerTextLine2.textColor) setValue('tbt2TC', data.topBannerTextLine2.textColor, true);
                if (data.topBannerTextLine2.blendColor) setValue('tbt2BC', data.topBannerTextLine2.blendColor, true);
            }

            if (data.topFileNameText) {
                if (data.topFileNameText.position) {
                    setValue('tfnX', data.topFileNameText.position.x);
                    setValue('tfnY', data.topFileNameText.position.y);
                }
                if (data.topFileNameText.width !== undefined) setValue('tfnW', data.topFileNameText.width);
                if (data.topFileNameText.textColor) setValue('tfnTC', data.topFileNameText.textColor, true);
                if (data.topFileNameText.blendColor) setValue('tfnBC', data.topFileNameText.blendColor, true);
            }

            // Bottom screen colors
            if (data.gridIcon) setValue('giBC', data.gridIcon.blendColor, true);
            if (data.bannerListIcon) setValue('bliBC', data.bannerListIcon.blendColor, true);
            if (data.bannerListTextLine0) setValue('blt0TC', data.bannerListTextLine0.textColor, true);
            if (data.bannerListTextLine1) setValue('blt1TC', data.bannerListTextLine1.textColor, true);
            if (data.bannerListTextLine2) setValue('blt2TC', data.bannerListTextLine2.textColor, true);

            updateLayoutControlsVisibility();
            alert("Theme configuration loaded successfully!");
        } catch (err) {
            console.error(err);
            alert("Error parsing theme.json: " + err.message);
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input to allow reloading same file
}

function updateLayoutControlsVisibility() {
    const isLegacy = document.getElementById('tVersion').value === 'legacy';
    const container = document.getElementById('ntPositioning');
    if (!container) return;

    // Select all inputs, buttons inside ntPositioning
    const inputs = container.querySelectorAll('input, button');
    inputs.forEach(input => {
        // Skip the guide checkboxes
        if (input.id === 'showGuidesTop' || input.id === 'showGuidesBottom') return;

        input.disabled = isLegacy;
        // Handle visual dimming
        const parent = input.closest('.overlay-controls');
        if (parent) {
            parent.style.opacity = isLegacy ? '0.3' : '1';
            parent.style.pointerEvents = isLegacy ? 'none' : 'auto';
        }
    });

    // Handle Pickr instances
    for (let id in window.pickrInstances) {
        const el = document.getElementById(id);
        if (el && container.contains(el)) {
            if (isLegacy) window.pickrInstances[id].disable();
            else window.pickrInstances[id].enable();
        }
    }
}


const SUPABASE_URL = "https://buyuuztciayrrokltxrz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1eXV1enRjaWF5cnJva2x0eHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NjEyNDMsImV4cCI6MjA5MDMzNzI0M30.e2U5HOM_-gZ4BNs26ZasEey9w81NfcqZcg-ePqGHCFk"; // Please replace with your actual anon key

let supabaseClient = null;
let libraryLoaded = false;

if (SUPABASE_KEY !== "YOUR_ANON_SECRET_KEY") {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

window.isExporting = false;

async function fetchThemes() {
    const themeList = document.getElementById('themeList');
    if (!supabaseClient) {
        themeList.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #ff2a5f; background: rgba(255, 42, 95, 0.1); border-radius: 8px; border: 1px solid #ff2a5f;">
                        <h2 style="margin-top:0">Supabase Connection Required</h2>
                        <p>To view the library, please provide your Supabase Anon Secret Key in the source code.</p>
                        <p style="font-size: 0.85em; opacity: 0.8;">Edit line 614 in index.html with your key.</p>
                    </div>`;
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('themes')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;

        themeList.innerHTML = '';
        if (data.length === 0) {
            themeList.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #aaa;">No themes found in database.</div>';
        } else {
            data.forEach(theme => {
                const postUrl = theme.download_url.replace(/\/download\/?$/, '/');
                const card = document.createElement('div');
                card.className = 'theme-card';
                card.innerHTML = `
                            <div class="theme-thumbnail">
                                <img src="${theme.image_url || 'https://via.placeholder.com/256x192/111/444?text=No+Thumbnail'}" alt="${theme.title}" onerror="this.src='https://via.placeholder.com/256x192/111/444?text=Theme+Preview'">
                            </div>
                            <div class="theme-info">
                                <a href="${postUrl}" target="_blank" class="theme-name" title="View GBAtemp Post: ${theme.title}">${theme.title}</a>
                                <p class="theme-author">by <span>${theme.author}</span></p>
                            </div>
                            <a href="${theme.download_url}" target="_blank" class="theme-download">
                                Download Theme
                            </a>
                        `;
                themeList.appendChild(card);
            });
            libraryLoaded = true;
        }
    } catch (err) {
        console.error("Supabase error:", err);
        themeList.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: #ff2a5f;">
                        <p>Error loading themes: ${err.message}</p>
                    </div>`;
    }
}
/* =========================================
   1. INITIALIZE NATIVE WASM AUDIO ENCODER
   ========================================= */
let isWasmAvailable = false;
let globalSoundParams = null;
let globalRawPcm16 = null;
let resolveEncode = null;
let rejectEncode = null;
const wasmStatus = document.getElementById('wasmStatus');
const audioUploader = document.getElementById('audioUploader');

let soundWorker = null;

function initSoundWorker() {
    if (soundWorker) soundWorker.terminate();
    isWasmAvailable = false;
    wasmStatus.innerText = "⏳ Initializing Audio Encoder...";
    wasmStatus.style.color = "#aaa";

    soundWorker = new Worker('sound/sound.js');
    soundWorker.onmessage = function (e) {
        if (e.data.cmd === "init_result") {
            if (e.data.result) {
                isWasmAvailable = true;
                wasmStatus.innerText = "✅ WASM Encoder Ready!";
                wasmStatus.style.color = "#4caf50";
                audioUploader.disabled = false;
            } else {
                wasmStatus.innerText = "❌ WASM Initialization failed.";
            }
        } else if (e.data.cmd === "decode_result") {
            if (e.data.result) {
                globalSoundParams = e.data.result.soundParams;
                globalRawPcm16 = e.data.result.rawPcm16;
            } else {
                alert("Audio decode failed inside WASM Worker!");
            }
        } else if (e.data.cmd === "encode_result") {
            if (resolveEncode) {
                if (e.data.result) resolveEncode(e.data.result);
                else rejectEncode("Encode failed entirely");
                resolveEncode = null;
                rejectEncode = null;
            }
        }
    };
    soundWorker.onerror = function () {
        wasmStatus.innerText = "❌ Worker Error. Ensure sound.js & sound.wasm are accessible.";
    };
    soundWorker.postMessage({ cmd: "init" });
}

// Run initial init
initSoundWorker();

/* =========================================
   2. COLOR PICKERS & CROPPER
   ========================================= */
window.pickrInstances = {};
function initColorPicker(inputId) {
    const input = document.getElementById(inputId);
    const container = document.createElement('div');
    container.className = 'pickr-container';
    input.type = 'hidden';
    input.parentNode.insertBefore(container, input.nextSibling);

    const pickr = Pickr.create({
        el: container, theme: 'nano', default: input.value,
        swatches: ['#ff2a5f', '#ed1f69', '#4ea8de', '#ffffff', '#333333', '#000000'],
        components: { preview: true, hue: true, interaction: { hex: true, input: true, save: true } },
        i18n: { 'btn:save': 'Save' }
    });
    window.pickrInstances[inputId] = pickr;
    pickr.on('change', (color) => { input.value = color.toHEXA().toString(); input.dispatchEvent(new Event('input')); })
        .on('save', () => pickr.hide());
} [
    'tColor', 'cUnselected', 'cSelected', 'boxColor', 'boxBorderColor',
    'tiBC', 'tbt0TC', 'tbt0BC', 'tbt1TC', 'tbt1BC', 'tbt2TC', 'tbt2BC', 'tfnTC', 'tfnBC',
    'giBC', 'bliBC', 'blt0TC', 'blt1TC', 'blt2TC'
].forEach(initColorPicker);

let cropperTop = null, cropperBottom = null;
function setupCropper(inputId, imageId, wrapperId, isTop) {
    document.getElementById(inputId).addEventListener('change', function (e) {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = function (event) {
            const imgElement = document.getElementById(imageId);
            imgElement.src = event.target.result;
            document.getElementById(wrapperId).style.display = 'block';
            if (isTop && cropperTop) cropperTop.destroy();
            if (!isTop && cropperBottom) cropperBottom.destroy();
            let options = { aspectRatio: 256 / 192, viewMode: 1, autoCropArea: 1, background: false };
            if (isTop) { options.crop = updateTopPreview; cropperTop = new Cropper(imgElement, options); }
            else { options.crop = updateBottomPreview; cropperBottom = new Cropper(imgElement, options); }
        }; reader.readAsDataURL(file);
    });
}
setupCropper('imgTop', 'imageTop', 'cropWrapTop', true); setupCropper('imgBottom', 'imageBottom', 'cropWrapBottom', false);

function drawRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}
function updateTopPreview() {
    if (!cropperTop) return;
    const canvasFinal = document.getElementById('previewTopFinal');
    const ctx = canvasFinal.getContext('2d');
    const cropped = cropperTop.getCroppedCanvas({ width: 256, height: 192 });
    ctx.clearRect(0, 0, 256, 192); ctx.drawImage(cropped, 0, 0);
    if (document.getElementById('boxEnable').checked) {
        ctx.globalAlpha = document.getElementById('boxOpacity').value / 100; ctx.fillStyle = document.getElementById('boxColor').value;
        drawRoundRect(ctx, 8, 120, 240, 60, parseInt(document.getElementById('boxRadius').value)); ctx.fill();
        ctx.globalAlpha = 1.0; ctx.lineWidth = 1.5; ctx.strokeStyle = document.getElementById('boxBorderColor').value; ctx.stroke();
    }

    // DRAW ADVANCED OVERLAYS (GHOST INDICATORS)
    if (window.isExporting || !document.getElementById('showGuidesTop').checked) return;

    const drawIndicator = (x, y, w, h, bc, tc, label) => {
        if (label === "ICON") {
            ctx.fillStyle = bc; ctx.globalAlpha = 0.6;
            ctx.fillRect(x, y, w, h);
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = "#ffffff"; ctx.font = "bold 9px Arial";
            ctx.fillText(label, x + 2, y + 9);
        } else {
            // Draw a dashed bounding box to show the element's width
            ctx.setLineDash([2, 2]);
            ctx.strokeStyle = bc;
            ctx.lineWidth = 0.8;
            ctx.strokeRect(x, y, w, h);
            ctx.setLineDash([]);

            // Draw the text with a very thin outline
            ctx.font = "bold 9px Arial";
            ctx.strokeStyle = bc;
            ctx.lineWidth = 1.2;
            ctx.lineJoin = 'round';
            ctx.strokeText(label, x + 2, y + 9);
            ctx.fillStyle = tc;
            ctx.fillText(label, x + 2, y + 9);
        }
    };

    // 1. Top Icon
    drawIndicator(
        parseInt(document.getElementById('tiX').value),
        parseInt(document.getElementById('tiY').value),
        32, 32,
        document.getElementById('tiBC').value,
        "#ffffff", "ICON"
    );

    // 2. Banner Lines
    const lines = [
        { id: 'tbt0', label: 'LINE 0' },
        { id: 'tbt1', label: 'LINE 1' },
        { id: 'tbt2', label: 'LINE 2' },
        { id: 'tfn', label: 'FILENAME' }
    ];
    lines.forEach(l => {
        drawIndicator(
            parseInt(document.getElementById(l.id + 'X').value),
            parseInt(document.getElementById(l.id + 'Y').value),
            parseInt(document.getElementById(l.id + 'W').value),
            12,
            document.getElementById(l.id + 'BC').value,
            document.getElementById(l.id + 'TC').value,
            l.label
        );
    });
} [
    'boxEnable', 'boxColor', 'boxBorderColor', 'boxOpacity', 'boxRadius',
    'tiX', 'tiY', 'tiBC',
    'tbt0X', 'tbt0Y', 'tbt0W', 'tbt0TC', 'tbt0BC',
    'tbt1X', 'tbt1Y', 'tbt1W', 'tbt1TC', 'tbt1BC',
    'tbt2X', 'tbt2Y', 'tbt2W', 'tbt2TC', 'tbt2BC',
    'tfnX', 'tfnY', 'tfnW', 'tfnTC', 'tfnBC',
    'showGuidesTop', 'showGuidesBottom'
].forEach(id => {
    const handleInput = () => { updateTopPreview(); updateBottomPreview(); };
    document.getElementById(id).addEventListener('input', handleInput);
    document.getElementById(id).addEventListener('change', handleInput);
});

document.getElementById('tVersion').addEventListener('change', updateLayoutControlsVisibility);
updateLayoutControlsVisibility();

['blt0TC', 'blt1TC', 'blt2TC'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateBottomPreview);
});

let currentPreviewLayout = 'none';

const overlayBottomImg = new Image();
overlayBottomImg.src = 'images/overlaybuttons.png';
overlayBottomImg.onload = function () {
    if (cropperBottom) updateBottomPreview();
};

function updateBottomPreview() {
    if (!cropperBottom) return;
    const canvasFinal = document.getElementById('previewBottomFinal');
    const ctx = canvasFinal.getContext('2d');
    const cropped = cropperBottom.getCroppedCanvas({ width: 256, height: 192 });
    ctx.clearRect(0, 0, 256, 192);
    if (cropped) ctx.drawImage(cropped, 0, 0);

    // Draw original top bar UI overlay
    if (overlayBottomImg.complete && overlayBottomImg.naturalWidth > 0) {
        ctx.drawImage(overlayBottomImg, 0, 0, 256, 33);
    }

    // Draw requested layout
    if (currentPreviewLayout === 'grid') {
        const imgNorm = document.getElementById('previewImgGrid');
        const imgSel = document.getElementById('previewImgGridSel');
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 5; c++) {
                let xPos = 8 + (c * 48); // 8px default offset
                if (r === 1 && c === 2) ctx.drawImage(imgSel, xPos, 40 + r * 48, 64, 48);
                else ctx.drawImage(imgNorm, xPos, 40 + r * 48, 64, 48);
            }
        }
    } else if (currentPreviewLayout === 'banner') {
        const imgNorm = document.getElementById('previewImgBanner');
        const imgSel = document.getElementById('previewImgBannerSel');
        // 4 rows fitting 256x48 with custom manual offsets per user request
        const rowOffsets = [2, 1, 0, -1];
        for (let r = 0; r < 4; r++) {
            let yPos = (r * 48) + rowOffsets[r];
            if (r === 1) ctx.drawImage(imgSel, 39, yPos, 256, 47);
            else ctx.drawImage(imgNorm, 39, yPos, 256, 47);
        }
    }

    // DRAW BOTTOM GUIDES (TEXT LINES)
    if (window.isExporting || !document.getElementById('showGuidesBottom').checked) return;

    const drawIndicator = (x, y, w, h, tc, label) => {
        if (label === "ICON") {
            ctx.fillStyle = tc; // Using tc as the color passed for the icon (bliBC)
            ctx.globalAlpha = 0.6;
            ctx.fillRect(x, y, w, h);
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = "#ffffff"; ctx.font = "bold 8px Arial";
            ctx.fillText(label, x + 2, y + 8);
        } else {
            // Text color for bottom screen labels
            ctx.fillStyle = tc; ctx.font = "bold 8px Arial";
            ctx.fillText(label, x + 2, y + 8);
        }
    };

    // Draw indicators for 4 rows with manual rowOffsets
    const rowOffsets = [2, 1, 0, -1];
    for (let r = 0; r < 4; r++) {
        let yBase = (r * 48) + rowOffsets[r];
        // Icon Guide - Centered in the 47px banner area
        drawIndicator(44, yBase + 7, 32, 32, document.getElementById('bliBC').value, "ICON");
        // Text Guides - Adjusted to match the new X=39 banner start
        drawIndicator(84, yBase + 6, 160, 10, document.getElementById('blt0TC').value, "LN 0 (TITLE)");
        drawIndicator(84, yBase + 18, 160, 10, document.getElementById('blt1TC').value, "LN 1 (DESC)");
        drawIndicator(84, yBase + 30, 160, 10, document.getElementById('blt2TC').value, "LN 2 (META)");
    }
}

/* =========================================
   3. AUDIO VISUALIZER (WAVESURFER)
   ========================================= */
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let currentAudioBuffer = null;
let wavesurfer = null, wsRegions = null, activeRegion = null;
const audioStart = document.getElementById('audioStart'), audioEnd = document.getElementById('audioEnd');

document.getElementById('audioUploader').addEventListener('change', function (e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function (event) {
        // Enviar nativo al WASM Global
        soundWorker.postMessage({ cmd: "decode", src: new Uint8Array(event.target.result.slice(0)) });

        if (audioContext.state === 'suspended') audioContext.resume();
        audioContext.decodeAudioData(event.target.result, buffer => { currentAudioBuffer = buffer; });
    };
    reader.readAsArrayBuffer(file);

    if (wavesurfer) wavesurfer.destroy();
    wavesurfer = WaveSurfer.create({ container: '#waveform', waveColor: '#4ea8de', progressColor: '#ed1f69', cursorColor: '#fff', height: 80, normalize: true, interact: false });
    wsRegions = wavesurfer.registerPlugin(WaveSurfer.Regions.create());

    wavesurfer.on('ready', () => {
        const duration = wavesurfer.getDuration();
        document.getElementById('audioDurationText').innerText = duration.toFixed(2);
        document.getElementById('audioControls').style.display = 'block';

        // Límite de seguridad visual de 90 segundos
        let endSafe = Math.min(duration, 90);

        activeRegion = wsRegions.addRegion({ start: 0, end: endSafe, color: 'rgba(187, 134, 252, 0.4)', drag: true, resize: true });
        wsRegions.on('region-updated', (r) => { audioStart.value = r.start.toFixed(2); audioEnd.value = r.end.toFixed(2); });
        audioStart.value = activeRegion.start.toFixed(2); audioEnd.value = activeRegion.end.toFixed(2);
        audioStart.max = duration; audioEnd.max = duration;
    });
    wavesurfer.on('play', () => document.getElementById('btnPreviewAudio').innerText = "Stop Preview");
    wavesurfer.on('pause', () => document.getElementById('btnPreviewAudio').innerText = "Play Selected Range");
    wavesurfer.load(URL.createObjectURL(file));
});

function updateRegionFromInputs() {
    if (!activeRegion) return;
    let s = parseFloat(audioStart.value), e = parseFloat(audioEnd.value);
    if (s >= 0 && e > s) activeRegion.setOptions({ start: s, end: e });
}
audioStart.addEventListener('input', updateRegionFromInputs); audioEnd.addEventListener('input', updateRegionFromInputs);
document.getElementById('btnPreviewAudio').addEventListener('click', () => {
    if (wavesurfer.isPlaying()) wavesurfer.pause(); else if (activeRegion) activeRegion.play();
});

document.getElementById('btnDownloadAudioOnly').addEventListener('click', async function () {
    if (!globalSoundParams || !isWasmAvailable) return alert("Audio not loaded or encoder not ready.");
    const btn = this;
    const originalText = btn.innerText;
    btn.innerText = "Encoding Audio...";
    btn.disabled = true;
    try {
        const startS = parseFloat(audioStart.value);
        const endS = parseFloat(audioEnd.value);
        if (endS > startS) {
            let params = new Uint32Array(globalSoundParams);
            let sampleRate = params[0];
            let origTotalSamples = params[1];
            let channels = params[5] || 2;

            let startSample = Math.floor(startS * sampleRate);
            let endSample = Math.floor(endS * sampleRate);
            let totalSamples = endSample - startSample;

            let trimmedPcm16 = null;
            if (globalRawPcm16) {
                let actualOrigTotalSamples = Math.floor(globalRawPcm16.length / channels);

                let channelsToEncode = 2;

                trimmedPcm16 = new Int16Array(totalSamples * channelsToEncode);

                // Downmix to Mono (L+R)/2 + Fade-In/Out to prevent clicks
                const fadeS = 400;
                for (let i = 0; i < totalSamples; i++) {
                    let sum = 0;
                    for (let c = 0; c < channels; c++) {
                        sum += globalRawPcm16[(c * actualOrigTotalSamples) + startSample + i] || 0;
                    }
                    let val = Math.round(sum / channels);

                    // Micro Fade-In/Out
                    if (i < fadeS) val = Math.round(val * (i / fadeS));
                    else if (i > totalSamples - fadeS) val = Math.round(val * ((totalSamples - i) / fadeS));

                    trimmedPcm16[i] = val;
                }

                params[1] = totalSamples;
                params[2] = 0; // Loop Flag
                params[3] = 0; // Loop start
                params[4] = totalSamples; // Loop end
                params[6] = channelsToEncode;
            }

            const bcstmBytes = await new Promise((resolve, reject) => {
                resolveEncode = resolve;
                rejectEncode = reject;
                soundWorker.postMessage({ cmd: "encode", buildType: 1, soundParams: params, pcm16: trimmedPcm16 ? trimmedPcm16.buffer : null });
            });

            if (bcstmBytes && bcstmBytes.length > 1024) {
                const blob = new Blob([bcstmBytes], { type: "application/octet-stream" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "bgm.bcstm";
                link.click();
                // Cleanup memory
                initSoundWorker();
            } else {
                alert("⚠️ Audio encoder returned empty file. Skipping audio.");
            }
        } else {
            alert("Invalid audio range. Start time must be less than end time.");
        }
    } catch (error) {
        alert("Error encoding audio: " + error);
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
});




/* =========================================
   5. NDS TEXTURE & ZIP GENERATION
   ========================================= */
const offCanvas = document.getElementById('offscreenCanvas');
const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

function hexToRgb(h) { let b = parseInt(h.substring(1), 16); return { r: (b >> 16) & 255, g: (b >> 8) & 255, b: b & 255 }; }
function canvasTo15Bpp(canvas) {
    const data = canvas.getContext('2d').getImageData(0, 0, 256, 192).data, buffer = new Uint8Array(256 * 192 * 2);
    for (let i = 0, j = 0; i < data.length; i += 4, j += 2) {
        let c16 = (Math.round((data[i + 2] / 255) * 31) << 10) | (Math.round((data[i + 1] / 255) * 31) << 5) | Math.round((data[i] / 255) * 31);
        if (data[i + 3] > 128) c16 |= (1 << 15); buffer[j] = c16 & 0xFF; buffer[j + 1] = (c16 >> 8) & 0xFF;
    } return buffer;
}
function generateCustomPalette(hex) {
    const rgb = hexToRgb(hex);
    const ramp = [0, 0, 0.04, 0.09, 0.29, 0.54, 0.80, 0.83, 0.90, 0.93, 1, 1, 1, 1, 1, 1];
    const pb = new Uint8Array(64); // 32 colors total
    // Indices 0-15 remain black (0x0000)
    for (let i = 0; i < 16; i++) {
        let r = Math.round((rgb.r / 255) * 31 * ramp[i]);
        let g = Math.round((rgb.g / 255) * 31 * ramp[i]);
        let b = Math.round((rgb.b / 255) * 31 * ramp[i]);
        let c16 = (b << 10) | (g << 5) | r;
        // We fill from index 16 to 31 (the "second row")
        let pos = (i + 16) * 2;
        pb[pos] = c16 & 0xFF; pb[pos + 1] = (c16 >> 8) & 0xFF;
    }
    return pb;
}

function quantizeTo32Colors(imageData) {
    let colorCounts = {};
    for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i + 3] < 10) continue;
        let r = imageData.data[i] >> 3;
        let g = imageData.data[i + 1] >> 3;
        let b = imageData.data[i + 2] >> 3;
        let key = `${r},${g},${b}`;
        colorCounts[key] = (colorCounts[key] || 0) + 1;
    }
    let sortedColors = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a]);
    let palette = sortedColors.slice(0, 32).map(k => {
        let parts = k.split(',');
        return { r: (parseInt(parts[0]) << 3), g: (parseInt(parts[1]) << 3), b: (parseInt(parts[2]) << 3) };
    });
    while (palette.length < 32) palette.push({ r: 0, g: 0, b: 0 });
    return palette;
}

function closestColorIndex(r, g, b, palette) {
    let minD = Infinity; let idx = 0;
    for (let i = 0; i < 32; i++) {
        let dr = r - palette[i].r, dg = g - palette[i].g, db = r - palette[i].b;
        let d = dr * dr + dg * dg + db * db;
        if (d < minD) { minD = d; idx = i; }
    }
    return idx;
}

async function processCustomIcon(fileInputId, w, h) {
    const input = document.getElementById(fileInputId);
    if (!input || !input.files || input.files.length === 0) return null;
    const file = input.files[0];
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise(r => img.onload = r);

    offCanvas.width = w; offCanvas.height = h;
    offCtx.clearRect(0, 0, w, h);
    offCtx.drawImage(img, 0, 0, w, h);
    const imgData = offCtx.getImageData(0, 0, w, h);

    const palette = quantizeTo32Colors(imgData);

    const plttBin = new Uint8Array(64);
    for (let i = 0; i < 32; i++) {
        let c16 = (Math.round((palette[i].b / 255) * 31) << 10) | (Math.round((palette[i].g / 255) * 31) << 5) | Math.round((palette[i].r / 255) * 31);
        plttBin[i * 2] = c16 & 0xFF; plttBin[i * 2 + 1] = (c16 >> 8) & 0xFF;
    }

    const imgBin = new Uint8Array(w * h);
    for (let i = 0, p = 0; i < w * h; i++, p += 4) {
        let alpha = Math.round((imgData.data[p + 3] / 255) * 7);
        let idx = closestColorIndex(imgData.data[p], imgData.data[p + 1], imgData.data[p + 2], palette);
        imgBin[i] = (alpha << 5) | idx;
    }

    return { bin: imgBin, pltt: plttBin };
}

document.getElementById('btnGenerate').addEventListener('click', async function () {
    if (!cropperTop || !cropperBottom) return alert("Please upload both background images first.");
    const btn = this; btn.innerText = "Processing Data & Audio..."; btn.disabled = true;
    try {
        const zip = new JSZip();
        const themeNameInput = document.getElementById('tName').value.trim();
        const themeVersion = document.getElementById('tVersion').value;
        let themeJson = {
            type: "custom",
            name: themeNameInput,
            description: document.getElementById('tDesc').value,
            author: document.getElementById('tAuthor').value,
            primaryColor: hexToRgb(document.getElementById('tColor').value),
            darkTheme: document.getElementById('tDark').checked
        };
        if (themeVersion === "latest") {
            themeJson = {
                ...themeJson,
                topIcon: {
                    position: { x: parseInt(document.getElementById('tiX').value), y: parseInt(document.getElementById('tiY').value) },
                    blendColor: hexToRgb(document.getElementById('tiBC').value)
                },
                topBannerTextLine0: {
                    position: { x: parseInt(document.getElementById('tbt0X').value), y: parseInt(document.getElementById('tbt0Y').value) },
                    width: parseInt(document.getElementById('tbt0W').value),
                    textColor: hexToRgb(document.getElementById('tbt0TC').value),
                    blendColor: hexToRgb(document.getElementById('tbt0BC').value)
                },
                topBannerTextLine1: {
                    position: { x: parseInt(document.getElementById('tbt1X').value), y: parseInt(document.getElementById('tbt1Y').value) },
                    width: parseInt(document.getElementById('tbt1W').value),
                    textColor: hexToRgb(document.getElementById('tbt1TC').value),
                    blendColor: hexToRgb(document.getElementById('tbt1BC').value)
                },
                topBannerTextLine2: {
                    position: { x: parseInt(document.getElementById('tbt2X').value), y: parseInt(document.getElementById('tbt2Y').value) },
                    width: parseInt(document.getElementById('tbt2W').value),
                    textColor: hexToRgb(document.getElementById('tbt2TC').value),
                    blendColor: hexToRgb(document.getElementById('tbt2BC').value)
                },
                topFileNameText: {
                    position: { x: parseInt(document.getElementById('tfnX').value), y: parseInt(document.getElementById('tfnY').value) },
                    width: parseInt(document.getElementById('tfnW').value),
                    textColor: hexToRgb(document.getElementById('tfnTC').value),
                    blendColor: hexToRgb(document.getElementById('tfnBC').value)
                },
                gridIcon: {
                    blendColor: hexToRgb(document.getElementById('giBC').value)
                },
                bannerListIcon: {
                    blendColor: hexToRgb(document.getElementById('bliBC').value)
                },
                bannerListTextLine0: {
                    textColor: hexToRgb(document.getElementById('blt0TC').value)
                },
                bannerListTextLine1: {
                    textColor: hexToRgb(document.getElementById('blt1TC').value)
                },
                bannerListTextLine2: {
                    textColor: hexToRgb(document.getElementById('blt2TC').value)
                }
            };
        }
        zip.file("theme.json", JSON.stringify(themeJson, null, 4));

        window.isExporting = true;
        updateTopPreview();
        zip.file("topbg.bin", canvasTo15Bpp(document.getElementById('previewTopFinal')));
        zip.file("bottombg.bin", canvasTo15Bpp(cropperBottom.getCroppedCanvas({ width: 256, height: 192 })));

        let cUnsel = document.getElementById('cUnselected').value, cSel = document.getElementById('cSelected').value;

        const iconsToProcess = [
            { id: 'imgGrid', name: 'gridcell', w: 64, h: 48, defaultHex: cUnsel },
            { id: 'imgGridSel', name: 'gridcellSelected', w: 64, h: 48, defaultHex: cSel },
            { id: 'imgBanner', name: 'bannerListCell', w: 256, h: 49, defaultHex: cUnsel },
            { id: 'imgBannerSel', name: 'bannerListCellSelected', w: 256, h: 49, defaultHex: cSel }
        ];

        for (let icon of iconsToProcess) {
            const customData = await processCustomIcon(icon.id, icon.w, icon.h);
            if (customData) {
                zip.file(`${icon.name}.bin`, customData.bin);
                zip.file(`${icon.name}Pltt.bin`, customData.pltt);
            } else {
                zip.file(`${icon.name}Pltt.bin`, generateCustomPalette(icon.defaultHex));
                try {
                    const res = await fetch(`theme/${icon.name}.bin`);
                    if (res.ok) zip.file(`${icon.name}.bin`, await res.arrayBuffer());
                } catch (e) { console.error("Missing asset in /theme folder:", icon.name); }
            }
        }

        // Tomar el resto de archivos (scrim estático) desde la carpeta /theme/
        const themeAssets = ["scrim.bin", "scrimPltt.bin"];
        for (const asset of themeAssets) {
            try {
                const res = await fetch(`theme/${asset}`);
                if (res.ok) zip.file(asset, await res.arrayBuffer());
            } catch (e) { console.error("Missing asset in /theme folder:", asset); }
        }

        // COMPRESIÓN BCSTM POR WASM (NATIVO ARRAYBUFFER MODO)
        if (globalSoundParams && isWasmAvailable) {
            const startS = parseFloat(audioStart.value);
            const endS = parseFloat(audioEnd.value);
            if (endS > startS) {
                let params = new Uint32Array(globalSoundParams);
                let sampleRate = params[0];
                let origTotalSamples = params[1];
                let channels = params[5] || 2;

                let startSample = Math.floor(startS * sampleRate);
                let endSample = Math.floor(endS * sampleRate);
                let totalSamples = endSample - startSample;

                let trimmedPcm16 = null;
                if (globalRawPcm16) {
                    let actualOrigTotalSamples = Math.floor(globalRawPcm16.length / channels);
                    let useMono = true; // Hardcoded Mono
                    let channelsToEncode = 1;

                    trimmedPcm16 = new Int16Array(totalSamples * channelsToEncode);

                    // Downmix to Mono (L+R)/2 + Fade-In/Out to prevent clicks
                    const fadeS = 400;
                    for (let i = 0; i < totalSamples; i++) {
                        let sum = 0;
                        for (let c = 0; c < channels; c++) {
                            sum += globalRawPcm16[(c * actualOrigTotalSamples) + startSample + i] || 0;
                        }
                        let val = Math.round(sum / channels);

                        // Micro Fade-In/Out
                        if (i < fadeS) val = Math.round(val * (i / fadeS));
                        else if (i > totalSamples - fadeS) val = Math.round(val * ((totalSamples - i) / fadeS));

                        trimmedPcm16[i] = val;
                    }

                    params[1] = totalSamples;
                    params[2] = 0; // Loop Flag
                    params[3] = 0; // Loop start
                    params[4] = totalSamples; // Loop end
                    params[6] = channelsToEncode;
                }

                const bcstmBytes = await new Promise((resolve, reject) => {
                    resolveEncode = resolve;
                    rejectEncode = reject;
                    soundWorker.postMessage({ cmd: "encode", buildType: 1, soundParams: params, pcm16: trimmedPcm16 ? trimmedPcm16.buffer : null });
                });

                if (bcstmBytes && bcstmBytes.length > 1024) {
                    zip.folder("bgm").file("bgm.bcstm", bcstmBytes);
                } else {
                    alert("⚠️ Audio encoder returned empty file. Skipping audio.");
                }
            }
        }

        // === GENERATE SCREENSHOTS ===
        const screenshotCanvas = document.createElement('canvas'); // Reuse this
        const ssCtx = screenshotCanvas.getContext('2d');

        // Helper to capture current combined view (Top + Bottom + Branding Footer)
        const captureFullLayout = async (name) => {
            screenshotCanvas.width = 256;
            screenshotCanvas.height = 192 * 2 + 42; // 384 (Screens) + 42 (Branding Footer)

            // Background
            ssCtx.fillStyle = "#000";
            ssCtx.fillRect(0, 0, 256, screenshotCanvas.height);

            // Draw screens (NO GAP)
            ssCtx.drawImage(document.getElementById('previewTopFinal'), 0, 0);
            ssCtx.drawImage(document.getElementById('previewBottomFinal'), 0, 192);

            // Footer Branding Area
            ssCtx.fillStyle = "#111";
            ssCtx.fillRect(0, 384, 256, 42);

            // Branding Text
            ssCtx.fillStyle = "#ffffff";
            ssCtx.font = "bold 11px 'Segoe UI', Arial, sans-serif";
            ssCtx.textAlign = "center";
            ssCtx.fillText("Made with Pico Theme Creator", 128, 404);

            ssCtx.fillStyle = "#ed1f69";
            ssCtx.font = "9px 'Segoe UI', Arial, sans-serif";
            ssCtx.fillText("https://github.com/santiagovalencia109/pl-Theme-Creator/", 128, 417);

            const blob = await new Promise(r => screenshotCanvas.toBlob(r, 'image/png'));
            zip.file(name, blob);
        };

        // Preserve current layout state to restore later
        const originalLayout = currentPreviewLayout;

        // 1. Theme Screenshot (Base Theme - No icons overlay)
        currentPreviewLayout = 'none';
        updateBottomPreview();
        await captureFullLayout("themescreenshot.png");

        // 2. Grid Layout Screenshot (if icons exist)
        if (document.getElementById('previewImgGrid').style.display === 'block') {
            currentPreviewLayout = 'grid';
            updateBottomPreview();
            await captureFullLayout("gridscreenshot.png");
        }

        // 3. Banner Layout Screenshot (if icons exist)
        if (document.getElementById('previewImgBanner').style.display === 'block') {
            currentPreviewLayout = 'banner';
            updateBottomPreview();
            await captureFullLayout("bannerscreenshot.png");
        }

        // Restore original preview state
        currentPreviewLayout = originalLayout;
        updateBottomPreview();

        const readmeContent = `==================================================
   Generated with Pico Launcher Theme Creator     
==================================================

App URL: https://santiagovalencia109.github.io/pl-Theme-Creator/
GitHub Repository: https://github.com/santiagovalencia109/pl-Theme-Creator/

--------------------------------------------------
[EN] HOW TO INSTALL YOUR THEME
--------------------------------------------------
1. Prepare the Theme Folder: 
   Extract the downloaded .zip file into a single folder. 
   Give that folder the name you want for your theme.

2. Transfer to SD Card: 
   Connect your SD card and navigate to /_pico/themes/. 
   Copy and paste your theme folder into this location.

3. Configure settings.json:
   Go back to the /_pico/ root folder on your SD card.
   Open settings.json with a text editor.
   Find the "theme" entry and change its value to match 
   your theme folder's name (e.g., "theme": "MyTheme").

4. Launch:
   Save the file and restart Pico Launcher to enjoy!

--------------------------------------------------
[ES] CÓMO INSTALAR TU TEMA
--------------------------------------------------
1. Prepara la carpeta del tema:
   Extrae el archivo .zip descargado en una carpeta.
   Dale a esa carpeta el nombre que quieras para tu tema.

2. Transfiere a la Tarjeta SD:
   Conecta tu tarjeta SD y ve al directorio /_pico/themes/.
   Copia y pega la carpeta de tu tema en esta ubicación.

3. Configura settings.json:
   Regresa a la carpeta raíz /_pico/ de tu tarjeta SD.
   Abre settings.json con un editor de texto.
   Busca la entrada "theme" y cambia su valor para que 
   coincida con el nombre de tu carpeta (ej: "theme": "MiTema").

4. Iniciar:
   Guarda el archivo y reinicia el Pico Launcher para disfrutar.

==================================================`;
        zip.file("CREDITS_&_INSTALL.txt", readmeContent);

        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a"); link.href = URL.createObjectURL(content);
        link.download = (themeNameInput.replace(/[<>:"/\\|?*]+/g, '') || "PicoTheme") + ".zip";
        link.click();

        // Cleanup & Re-init Audio Encoder to prevent memory issues on consecutive runs
        if (isWasmAvailable) {
            console.log("Cleaning up WASM memory...");
            initSoundWorker();
        }
    } catch (error) {
        alert("Error generating theme: " + error);
    } finally {
        window.isExporting = false;
        updateTopPreview();
        btn.innerText = "Generate Full Theme (.zip)"; btn.disabled = false;
    }
});

/* =========================================
   6. ADVANCED DECODER
   ========================================= */
const decoderCanvas = document.getElementById('decoderCanvas');
const decoderCtx = decoderCanvas.getContext('2d');
const btnDownloadExtracted = document.getElementById('btnDownloadExtracted');

let currentDecodedFileName = 'Extracted_Texture.png';

document.getElementById('binUploader').addEventListener('change', async function (e) {
    const files = e.target.files; if (!files.length) return;

    let imgFile = null, palFile = null;
    for (let i = 0; i < files.length; i++) {
        if (files[i].name.toLowerCase().includes('pltt')) palFile = files[i];
        else imgFile = files[i];
    }

    // Set global filename for download
    const baseFile = imgFile || palFile;
    if (baseFile) {
        currentDecodedFileName = baseFile.name.split('.')[0] + '.png';
    }

    // If a palette is present, extract the RGB color list
    let paletteRgb = null;
    let numColors = 0;
    if (palFile) {
        const pBuf = new Uint8Array(await palFile.arrayBuffer());
        numColors = Math.min(256, Math.floor(pBuf.length / 2));
        paletteRgb = [];
        for (let i = 0; i < numColors; i++) {
            let c16 = pBuf[i * 2] | (pBuf[i * 2 + 1] << 8);
            paletteRgb.push({
                r: Math.round(((c16 & 0x1F) / 31) * 255),
                g: Math.round((((c16 >> 5) & 0x1F) / 31) * 255),
                b: Math.round((((c16 >> 10) & 0x1F) / 31) * 255)
            });
        }
    }

    // If ONLY a palette was uploaded, visualize it alone
    if (palFile && !imgFile) {
        let cols = Math.min(numColors, 16), rows = Math.ceil(numColors / cols) || 1, sSize = 25;
        decoderCanvas.width = cols * sSize; decoderCanvas.height = rows * sSize;
        decoderCtx.clearRect(0, 0, decoderCanvas.width, decoderCanvas.height);
        for (let i = 0; i < numColors; i++) {
            let c = paletteRgb[i];
            decoderCtx.fillStyle = `rgb(${c.r},${c.g},${c.b})`;
            let x = (i % cols) * sSize, y = Math.floor(i / cols) * sSize;
            decoderCtx.fillRect(x, y, sSize, sSize); decoderCtx.strokeStyle = "rgba(0,0,0,0.4)"; decoderCtx.strokeRect(x, y, sSize, sSize);
        }
        document.getElementById('decoderInfo').innerText = `Detected: Palette Grid (${numColors} colors)`;
        decoderCanvas.style.display = 'block'; btnDownloadExtracted.style.display = 'inline-block'; return;
    }

    // Decode the image if it was uploaded
    if (imgFile) {
        const fileName = imgFile.name.toLowerCase();
        const buffer = new Uint8Array(await imgFile.arrayBuffer());
        const size = buffer.length;
        let w, h, formatName, imgData;

        if (fileName.includes('topbg') || fileName.includes('bottombg')) {
            w = 256; h = 192; formatName = "Background (15bpp RGB)";
            decoderCanvas.width = w; decoderCanvas.height = h; imgData = decoderCtx.createImageData(w, h);
            for (let i = 0, p = 0; i < w * h * 2; i += 2, p += 4) {
                if (i < size - 1) {
                    let c16 = buffer[i] | (buffer[i + 1] << 8);
                    imgData.data[p] = Math.round(((c16 & 0x1F) / 31) * 255); imgData.data[p + 1] = Math.round((((c16 >> 5) & 0x1F) / 31) * 255);
                    imgData.data[p + 2] = Math.round((((c16 >> 10) & 0x1F) / 31) * 255); imgData.data[p + 3] = 255;
                }
            }
        } else if (fileName.includes('bannerlistcell') || fileName.includes('gridcell')) {
            w = fileName.includes('banner') ? 256 : 64; h = fileName.includes('banner') ? 49 : 48; formatName = "Graphics (A3I5)";
            decoderCanvas.width = w; decoderCanvas.height = h; imgData = decoderCtx.createImageData(w, h);
            for (let i = 0, p = 0; i < w * h; i++, p += 4) {
                if (i < size) {
                    let alpha = Math.round((((buffer[i] >> 5) & 0x7) / 7) * 255);
                    let index = buffer[i] & 0x1F;
                    if (paletteRgb && paletteRgb[index]) {
                        imgData.data[p] = paletteRgb[index].r; imgData.data[p + 1] = paletteRgb[index].g; imgData.data[p + 2] = paletteRgb[index].b;
                    } else {
                        imgData.data[p] = imgData.data[p + 1] = imgData.data[p + 2] = 255;
                    }
                    imgData.data[p + 3] = alpha;
                }
            }
        } else if (fileName.includes('scrim')) {
            w = 8; h = 42; formatName = "Shadow (A5I3)";
            decoderCanvas.width = w; decoderCanvas.height = h; imgData = decoderCtx.createImageData(w, h);
            for (let i = 0, p = 0; i < w * h; i++, p += 4) {
                if (i < size) {
                    let alpha = Math.round((((buffer[i] >> 3) & 0x1F) / 31) * 255);
                    let index = buffer[i] & 0x07;
                    if (paletteRgb && paletteRgb[index]) {
                        imgData.data[p] = paletteRgb[index].r; imgData.data[p + 1] = paletteRgb[index].g; imgData.data[p + 2] = paletteRgb[index].b;
                    } else {
                        imgData.data[p] = imgData.data[p + 1] = imgData.data[p + 2] = 0;
                    }
                    imgData.data[p + 3] = alpha;
                }
            }
        } else return alert("File format not recognized.");

        decoderCtx.putImageData(imgData, 0, 0);
        let pInfo = paletteRgb ? " + Palette applied" : " (No palette, pure mask)";
        if (fileName.includes('topbg') || fileName.includes('bottombg')) pInfo = "";
        document.getElementById('decoderInfo').innerText = `Detected: ${formatName}${pInfo} | Dimensions: ${w}x${h}px`;
        decoderCanvas.style.display = 'block'; btnDownloadExtracted.style.display = 'inline-block';
    }
});

btnDownloadExtracted.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = currentDecodedFileName;
    link.href = decoderCanvas.toDataURL('image/png');
    link.click();
});

function updateLayoutButtonsState() {
    const btnGrid = document.getElementById('btnPreviewGridLayout');
    const pGridNorm = document.getElementById('previewImgGrid');
    const pGridSel = document.getElementById('previewImgGridSel');
    if (pGridNorm.style.display === 'block' && pGridSel.style.display === 'block') {
        btnGrid.disabled = false;
        btnGrid.style.opacity = '1';
        btnGrid.innerText = 'Preview Grid Layout';
    } else {
        btnGrid.disabled = true;
        btnGrid.style.opacity = '0.5';
        btnGrid.innerText = 'Upload Both Grid Icons';
        if (currentPreviewLayout === 'grid') {
            currentPreviewLayout = 'none';
            document.getElementById('btnClearLayout').style.display = 'none';
            updateBottomPreview();
        }
    }

    const btnBanner = document.getElementById('btnPreviewBannerLayout');
    const pBannerNorm = document.getElementById('previewImgBanner');
    const pBannerSel = document.getElementById('previewImgBannerSel');
    if (pBannerNorm.style.display === 'block' && pBannerSel.style.display === 'block') {
        btnBanner.disabled = false;
        btnBanner.style.opacity = '1';
        btnBanner.innerText = 'Preview Banner Layout';
    } else {
        btnBanner.disabled = true;
        btnBanner.style.opacity = '0.5';
        btnBanner.innerText = 'Upload Both Banner Icons';
        if (currentPreviewLayout === 'banner') {
            currentPreviewLayout = 'none';
            document.getElementById('btnClearLayout').style.display = 'none';
            updateBottomPreview();
        }
    }
}

['imgGrid', 'imgGridSel', 'imgBanner', 'imgBannerSel'].forEach(id => {
    document.getElementById(id).addEventListener('change', function (e) {
        const file = e.target.files[0];
        const preview = document.getElementById('previewImg' + id.substring(3));
        const expectedW = id.includes('Grid') ? 64 : 256;
        const expectedH = id.includes('Grid') ? 48 : 49;

        if (file) {
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);
            img.onload = function () {
                if (img.width !== expectedW || img.height !== expectedH) {
                    alert(`Error: The image must be exactly ${expectedW}x${expectedH} pixels. This image is ${img.width}x${img.height}.`);
                    e.target.value = ''; // clear input
                    preview.src = '';
                    preview.style.display = 'none';
                } else {
                    preview.src = objectUrl;
                    preview.style.display = 'block';
                }
                updateLayoutButtonsState();
            };
            img.src = objectUrl;
        } else {
            preview.src = '';
            preview.style.display = 'none';
            updateLayoutButtonsState();
        }
    });
});

document.getElementById('btnPreviewGridLayout').addEventListener('click', () => {
    currentPreviewLayout = 'grid';
    document.getElementById('btnClearLayout').style.display = 'inline-block';
    document.getElementById('showGuidesBottom').checked = false;
    updateBottomPreview();
});

document.getElementById('btnPreviewBannerLayout').addEventListener('click', () => {
    currentPreviewLayout = 'banner';
    document.getElementById('btnClearLayout').style.display = 'inline-block';
    document.getElementById('showGuidesBottom').checked = false;
    updateBottomPreview();
});

document.getElementById('btnClearLayout').addEventListener('click', () => {
    currentPreviewLayout = 'none';
    document.getElementById('btnClearLayout').style.display = 'none';
    updateBottomPreview();
});

// Fetch latest commit hash from GitHub API
async function fetchLastCommit() {
    try {
        const response = await fetch('https://api.github.com/repos/santiagovalencia109/pl-Theme-Creator/commits/main');
        if (response.ok) {
            const data = await response.json();
            document.getElementById('commit-hash').innerText = data.sha.substring(0, 7);
        }
    } catch (e) { /* Silently fail if API rate limit or offline */ }
}
fetchLastCommit();

/* =========================================
   7. DRAG AND DROP FUNCTIONALITY
   ========================================= */
document.querySelectorAll('.upload-box, .upload-item, input[type="file"]').forEach(zone => {
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (zone.classList.contains('upload-item')) {
            zone.style.background = 'rgba(237, 31, 105, 0.2)';
            zone.style.borderRadius = '8px';
        } else {
            zone.style.borderColor = '#ed1f69';
            zone.style.background = '#32223b';
        }
    });
    zone.addEventListener('dragleave', (e) => {
        e.stopPropagation();
        zone.style.borderColor = '';
        zone.style.background = '';
    });
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        zone.style.borderColor = '';
        zone.style.background = '';

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            let targetInput = (zone.tagName === 'INPUT' && zone.type === 'file') ? zone : zone.querySelector('input[type="file"]');

            if (targetInput) {
                const dt = new DataTransfer();
                for (let i = 0; i < files.length; i++) {
                    dt.items.add(files[i]);
                    // If input is NOT 'multiple', only process the first file
                    if (!targetInput.multiple) break;
                }
                targetInput.files = dt.files;
                targetInput.dispatchEvent(new Event('change'));
            }
        }
    });
});
/* =========================================
   6. INTERACTIVE PREVIEW (DRAG & RESIZE)
   ========================================= */
const topCanvas = document.getElementById('previewTopFinal');
let isDragging = false, isResizing = false;
let targetObj = null, startX, startY, startW, startValX, startValY;
topCanvas.addEventListener('mousedown', e => {
    if (document.getElementById('tVersion').value !== 'latest') return;
    const rect = topCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (256 / rect.width);
    const y = (e.clientY - rect.top) * (192 / rect.height);
    const items = [
        { id: 'ti', x: 'tiX', y: 'tiY', w: 32, h: 32, canResize: false },
        { id: 'tbt0', x: 'tbt0X', y: 'tbt0Y', w: 'tbt0W', h: 12, canResize: true },
        { id: 'tbt1', x: 'tbt1X', y: 'tbt1Y', w: 'tbt1W', h: 12, canResize: true },
        { id: 'tbt2', x: 'tbt2X', y: 'tbt2Y', w: 'tbt2W', h: 12, canResize: true },
        { id: 'tfn', x: 'tfnX', y: 'tfnY', w: 'tfnW', h: 12, canResize: true }
    ];
    for (const item of items) {
        const ix = parseInt(document.getElementById(item.x).value);
        const iy = parseInt(document.getElementById(item.y).value);
        const iw = (typeof item.w === 'string') ? parseInt(document.getElementById(item.w).value) : item.w;
        if (x >= ix && x <= ix + iw && y >= iy && y <= iy + item.h) {
            targetObj = item; startX = x; startY = y; startValX = ix; startValY = iy;
            if (item.canResize && x > (ix + iw - 10)) { isResizing = true; startW = iw; } else { isDragging = true; }
            topCanvas.style.cursor = isResizing ? 'ew-resize' : 'grabbing';
            e.preventDefault(); return;
        }
    }
});
window.addEventListener('mousemove', e => {
    if (document.getElementById('tVersion').value !== 'latest') {
        topCanvas.style.cursor = 'default';
        return;
    }
    if (!targetObj) {
        const rect = topCanvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (256 / rect.width);
        const y = (e.clientY - rect.top) * (192 / rect.height);
        const items = [
            { id: 'ti', x: 'tiX', y: 'tiY', w: 32, h: 32 },
            { id: 'tbt0', x: 'tbt0X', y: 'tbt0Y', w: 'tbt0W', h: 12 },
            { id: 'tbt1', x: 'tbt1X', y: 'tbt1Y', w: 'tbt1W', h: 12 },
            { id: 'tbt2', x: 'tbt2X', y: 'tbt2Y', w: 'tbt2W', h: 12 },
            { id: 'tfn', x: 'tfnX', y: 'tfnY', w: 'tfnW', h: 12 }
        ];
        let hovering = false;
        for (const i of items) {
            const ix = parseInt(document.getElementById(i.x).value), iy = parseInt(document.getElementById(i.y).value), iw = (typeof i.w === 'string') ? parseInt(document.getElementById(i.w).value) : i.w;
            if (x >= ix && x <= ix + iw && y >= iy && y <= iy + 12) {
                topCanvas.style.cursor = (x > (ix + iw - 10) && i.id !== 'ti') ? 'ew-resize' : 'grab';
                hovering = true; break;
            }
        }
        if (!hovering) topCanvas.style.cursor = 'default';
        return;
    }
    const rect = topCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (256 / rect.width), y = (e.clientY - rect.top) * (192 / rect.height);
    const dx = x - startX, dy = y - startY;
    if (isResizing) {
        const inputW = document.getElementById(targetObj.w);
        inputW.value = Math.max(10, Math.round(startW + dx));
        inputW.dispatchEvent(new Event('input'));
    } else if (isDragging) {
        const inputX = document.getElementById(targetObj.x), inputY = document.getElementById(targetObj.y);
        inputX.value = Math.round(startValX + dx);
        inputY.value = Math.round(startValY + dy);
        inputX.dispatchEvent(new Event('input')); inputY.dispatchEvent(new Event('input'));
    }
});
window.addEventListener('mouseup', () => { isDragging = false; isResizing = false; targetObj = null; topCanvas.style.cursor = 'default'; });
