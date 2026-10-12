/**
 * TrustRestore - Interactive Client-Side Engine & Showcase Controller
 * Developed by: Pasindu Harsha
 * Associated with: CircuitWave Labs
 */

(function () {
  'use strict';

  // State Management
  const state = {
    customImageLoaded: false,
    threshold: 0.45,
    useSyntheticDegrade: true,
    lightFactor: 0.50,
    noiseLevel: 0.035,
    blurKernel: 9,
    activeView: 'grid', // 'grid' or 'split'
    splitPosition: 50,
    
    // Canvases & Image Data
    cleanCanvas: null,
    obsData: null,
    restData: null,
    trustScores: null,
    refData: null,
    width: 384,
    height: 384
  };

  // DOM Elements
  const elements = {
    dropzone: document.getElementById('dropzone'),
    fileInput: document.getElementById('file-input'),
    btnSampleScene: document.getElementById('btn-sample-scene'),
    btnSamplePattern: document.getElementById('btn-sample-pattern'),
    thresholdSlider: document.getElementById('threshold-slider'),
    thresholdVal: document.getElementById('threshold-val'),
    degradeSwitch: document.getElementById('degrade-switch'),
    degradeParams: document.getElementById('degrade-params'),
    lightSlider: document.getElementById('light-slider'),
    lightVal: document.getElementById('light-val'),
    noiseSlider: document.getElementById('noise-slider'),
    noiseVal: document.getElementById('noise-val'),
    blurSlider: document.getElementById('blur-slider'),
    blurVal: document.getElementById('blur-val'),
    reprocessBtn: document.getElementById('reprocess-btn'),
    
    // View tabs
    tabGrid: document.getElementById('tab-grid'),
    tabSplit: document.getElementById('tab-split'),
    viewportGrid: document.getElementById('viewport-grid'),
    viewportSplit: document.getElementById('viewport-split'),
    
    // Grid Canvases
    canvasObserved: document.getElementById('canvas-observed'),
    canvasRestored: document.getElementById('canvas-restored'),
    canvasTrust: document.getElementById('canvas-trust'),
    canvasRefined: document.getElementById('canvas-refined'),
    
    // Split Viewer
    splitBeforeImg: document.getElementById('split-before-img'),
    splitAfterImg: document.getElementById('split-after-img'),
    splitOverlay: document.getElementById('split-overlay'),
    splitHandle: document.getElementById('split-handle'),
    
    // Diagnostics
    diagTrustScore: document.getElementById('diag-trust-score'),
    diagLowTrustPct: document.getElementById('diag-low-trust-pct'),
    diagObsSharp: document.getElementById('diag-obs-sharp'),
    diagRefSharp: document.getElementById('diag-ref-sharp'),
    
    // Inspector Tooltip
    inspectorOverlay: document.getElementById('inspector-overlay'),
    
    // Buttons
    downloadRefined: document.getElementById('download-refined'),
    downloadTrust: document.getElementById('download-trust'),
    copyCmdBtn: document.getElementById('copy-cmd-btn')
  };

  // Helper: Jet Colormap mapping [0, 1] to [R, G, B]
  function jetColormap(val) {
    val = Math.max(0, Math.min(1, val));
    let r = Math.max(0, Math.min(1, 1.5 - Math.abs(val * 4 - 3)));
    let g = Math.max(0, Math.min(1, 1.5 - Math.abs(val * 4 - 2)));
    let b = Math.max(0, Math.min(1, 1.5 - Math.abs(val * 4 - 1)));
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  // ==========================================
  // PROCEDURAL UNSEEN TEST IMAGE GENERATORS
  // ==========================================

  // Generate an unseen high-detail architectural landscape
  function generateUnseenSceneCanvas(w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.65);
    sky.addColorStop(0, '#1e3a8a');
    sky.addColorStop(0.5, '#3b82f6');
    sky.addColorStop(1, '#93c5fd');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Sun with bloom
    const sunGrad = ctx.createRadialGradient(w * 0.75, h * 0.25, 5, w * 0.75, h * 0.25, 60);
    sunGrad.addColorStop(0, '#fffbeb');
    sunGrad.addColorStop(0.3, '#fef08a');
    sunGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(w * 0.75, h * 0.25, 60, 0, Math.PI * 2);
    ctx.fill();

    // Distant mountains
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.6);
    ctx.lineTo(w * 0.2, h * 0.45);
    ctx.lineTo(w * 0.45, h * 0.55);
    ctx.lineTo(w * 0.7, h * 0.42);
    ctx.lineTo(w, h * 0.58);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Foreground architecture buildings with high-frequency window patterns
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(w * 0.1, h * 0.45, w * 0.25, h * 0.55);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(w * 0.4, h * 0.38, w * 0.3, h * 0.62);
    ctx.fillStyle = '#334155';
    ctx.fillRect(w * 0.75, h * 0.5, w * 0.2, h * 0.5);

    // Glowing windows (High frequency detail to evaluate trust map)
    ctx.fillStyle = '#fde047';
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 5; c++) {
        if ((r + c) % 2 === 0) {
          ctx.fillRect(w * 0.43 + c * (w * 0.05), h * 0.42 + r * (h * 0.07), w * 0.03, h * 0.04);
        }
      }
    }

    // Street ground
    const ground = ctx.createLinearGradient(0, h * 0.85, 0, h);
    ground.addColorStop(0, '#111827');
    ground.addColorStop(1, '#030712');
    ctx.fillStyle = ground;
    ctx.fillRect(0, h * 0.85, w, h * 0.15);

    return canvas;
  }

  // Generate an unseen high-frequency calibration pattern
  function generateUnseenPatternCanvas(w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    // Dark slate background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Concentric calibration rings
    for (let r = 10; r < w * 0.45; r += 12) {
      ctx.strokeStyle = r % 24 === 0 ? '#38bdf8' : '#e2e8f0';
      ctx.lineWidth = r % 24 === 0 ? 3 : 1.5;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Radial spokes
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(w / 2 + Math.cos(a) * (w * 0.45), h / 2 + Math.sin(a) * (h * 0.45));
      ctx.stroke();
    }

    // Corner high-frequency checkerboards
    const size = 6;
    for (let cy = 0; cy < 60; cy += size) {
      for (let cx = 0; cx < 60; cx += size) {
        if ((cx / size + cy / size) % 2 === 0) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(10 + cx, 10 + cy, size, size);
          ctx.fillRect(w - 70 + cx, h - 70 + cy, size, size);
        }
      }
    }

    return canvas;
  }

  // ==========================================
  // IMAGE PROCESSING KERNELS & ENGINE
  // ==========================================

  // 1. Synthetic Compound Degradation
  function applySyntheticDegradation(imgData, light, noise, blur) {
    const w = imgData.width;
    const h = imgData.height;
    const data = new Uint8ClampedArray(imgData.data);
    const len = data.length;

    // A. Low-light attenuation & Gaussian Noise
    for (let i = 0; i < len; i += 4) {
      const gNoise = (Math.random() + Math.random() + Math.random() - 1.5) * noise * 255 * 2.2;
      data[i] = Math.min(255, Math.max(0, data[i] * light + gNoise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * light + gNoise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * light + gNoise));
    }

    // B. Horizontal Motion Blur
    if (blur > 1) {
      const half = Math.floor(blur / 2);
      const output = new Uint8ClampedArray(data);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let rSum = 0, gSum = 0, bSum = 0, count = 0;
          for (let k = -half; k <= half; k++) {
            const nx = x + k;
            if (nx >= 0 && nx < w) {
              const idx = (y * w + nx) * 4;
              rSum += data[idx];
              gSum += data[idx + 1];
              bSum += data[idx + 2];
              count++;
            }
          }
          const outIdx = (y * w + x) * 4;
          output[outIdx] = rSum / count;
          output[outIdx + 1] = gSum / count;
          output[outIdx + 2] = bSum / count;
        }
      }
      return new ImageData(output, w, h);
    }

    return new ImageData(data, w, h);
  }

  // 2. Grayscale & Sobel Gradient extraction
  function computeSobelGradient(data, w, h) {
    const grad = new Float32Array(w * h);
    const gray = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) {
      gray[i] = (data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114) / 255.0;
    }

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const gx =
          -1 * gray[(y - 1) * w + (x - 1)] + 1 * gray[(y - 1) * w + (x + 1)] +
          -2 * gray[y * w + (x - 1)]       + 2 * gray[y * w + (x + 1)] +
          -1 * gray[(y + 1) * w + (x - 1)] + 1 * gray[(y + 1) * w + (x + 1)];

        const gy =
          -1 * gray[(y - 1) * w + (x - 1)] - 2 * gray[(y - 1) * w + x] - 1 * gray[(y - 1) * w + (x + 1)] +
           1 * gray[(y + 1) * w + (x - 1)] + 2 * gray[(y + 1) * w + x] + 1 * gray[(y + 1) * w + (x + 1)];

        grad[y * w + x] = Math.sqrt(gx * gx + gy * gy);
      }
    }
    return grad;
  }

  // 3. Deep Restoration Simulation
  function simulateDeepRestoration(obsData) {
    const w = obsData.width;
    const h = obsData.height;
    const src = obsData.data;
    const restored = new Uint8ClampedArray(src.length);

    // Contrast recovery & high-frequency unsharp enhancement
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        for (let c = 0; c < 3; c++) {
          let val = src[idx + c] / 255.0;
          val = Math.pow(val, 0.70) * 1.38; // Gamma low-light restoration
          restored[idx + c] = Math.min(255, Math.max(0, Math.round(val * 255)));
        }
        restored[idx + 3] = 255;
      }
    }
    return new ImageData(restored, w, h);
  }

  // 4. Tri-Factor Trust Map Computation
  function computeTriFactorTrustMap(obsData, restData) {
    const w = obsData.width;
    const h = obsData.height;
    const totalPixels = w * h;
    const obs = obsData.data;
    const rest = restData.data;

    const obsGrad = computeSobelGradient(obs, w, h);
    const restGrad = computeSobelGradient(rest, w, h);

    // A. Estimate noise sigma via median residual
    let residuals = new Float32Array(totalPixels);
    for (let i = 0; i < totalPixels; i++) {
      const idx = i * 4;
      const dr = Math.abs(rest[idx] - obs[idx]) / 255.0;
      const dg = Math.abs(rest[idx + 1] - obs[idx + 1]) / 255.0;
      const db = Math.abs(rest[idx + 2] - obs[idx + 2]) / 255.0;
      residuals[i] = (dr + dg + db) / 3.0;
    }

    const sortedRes = Float32Array.from(residuals).sort();
    const sn = Math.max(0.015, sortedRes[Math.floor(totalPixels * 0.5)] * 1.4826);

    // B. Gradient error
    let serr = new Float32Array(totalPixels);
    for (let i = 0; i < totalPixels; i++) {
      serr[i] = Math.abs(restGrad[i] - obsGrad[i]);
    }
    const sortedSerr = Float32Array.from(serr).sort();
    const sg = Math.max(0.015, sortedSerr[Math.floor(totalPixels * 0.75)]);

    const trustScores = new Float32Array(totalPixels);
    let minT = 1e9, maxT = -1e9;

    for (let i = 0; i < totalPixels; i++) {
      // Data Trust
      const res = residuals[i];
      const dataTrust = Math.exp(-(res * res) / (2 * sn * sn + 1e-8));

      // Structural Trust
      const s = serr[i];
      const structTrust = Math.exp(-(s * s) / (2 * sg * sg + 1e-8));

      // Stability Trust (MC Proxy)
      const mcVar = (s * 0.4 + res * 0.6) * 0.25;
      const stableTrust = Math.exp(-mcVar / 0.15);

      const t = dataTrust * structTrust * stableTrust;
      trustScores[i] = t;
      if (t < minT) minT = t;
      if (t > maxT) maxT = t;
    }

    // Normalize to [0, 1]
    const range = Math.max(1e-8, maxT - minT);
    for (let i = 0; i < totalPixels; i++) {
      trustScores[i] = (trustScores[i] - minT) / range;
    }

    return trustScores;
  }

  // 5. Jet Colormap Generation for Canvas
  function createJetTrustImageData(trustScores, w, h) {
    const imgData = new ImageData(w, h);
    const data = imgData.data;
    for (let i = 0; i < w * h; i++) {
      const [r, g, b] = jetColormap(trustScores[i]);
      const idx = i * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
    return imgData;
  }

  // 6. Adaptive Bilateral Refinement
  function applyTrustRefinement(restData, trustScores, threshold) {
    const w = restData.width;
    const h = restData.height;
    const totalPixels = w * h;
    const rest = restData.data;

    // Mask identification & dilation
    const lowTrust = new Uint8Array(totalPixels);
    for (let i = 0; i < totalPixels; i++) {
      if (trustScores[i] < threshold) lowTrust[i] = 1;
    }

    const dilated = new Uint8Array(totalPixels);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let isAny = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < h && nx >= 0 && nx < w) {
              if (lowTrust[ny * w + nx] === 1) {
                isAny = 1;
                break;
              }
            }
          }
          if (isAny) break;
        }
        dilated[y * w + x] = isAny;
      }
    }

    // Edge-preserving Bilateral Filter on low trust pixels
    const output = new Uint8ClampedArray(rest);
    const radius = 3;
    const sigmaColor = 35.0;
    const sigmaSpace = 4.0;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (dilated[i] === 0) continue; // Keep deep model restoration

        const cIdx = i * 4;
        const centerR = rest[cIdx];
        const centerG = rest[cIdx + 1];
        const centerB = rest[cIdx + 2];

        let sumR = 0, sumG = 0, sumB = 0, sumWeight = 0;

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < h && nx >= 0 && nx < w) {
              const nIdx = (ny * w + nx) * 4;
              const nR = rest[nIdx];
              const nG = rest[nIdx + 1];
              const nB = rest[nIdx + 2];

              const spatialDist = dx * dx + dy * dy;
              const colorDist = (centerR - nR) ** 2 + (centerG - nG) ** 2 + (centerB - nB) ** 2;

              const weight = Math.exp(-spatialDist / (2 * sigmaSpace ** 2) - colorDist / (2 * sigmaColor ** 2));
              sumR += nR * weight;
              sumG += nG * weight;
              sumB += nB * weight;
              sumWeight += weight;
            }
          }
        }

        if (sumWeight > 0) {
          output[cIdx] = Math.round(sumR / sumWeight);
          output[cIdx + 1] = Math.round(sumG / sumWeight);
          output[cIdx + 2] = Math.round(sumB / sumWeight);
        }
      }
    }

    return new ImageData(output, w, h);
  }

  // 7. Laplacian Sharpness Metric
  function computeLaplacianSharpness(imgData) {
    const w = imgData.width;
    const h = imgData.height;
    const data = imgData.data;
    const gray = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) {
      gray[i] = data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114;
    }

    let sum = 0, sumSq = 0, count = 0;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const lap =
          gray[(y - 1) * w + x] +
          gray[(y + 1) * w + x] +
          gray[y * w + (x - 1)] +
          gray[y * w + (x + 1)] -
          4 * gray[y * w + x];
        sum += lap;
        sumSq += lap * lap;
        count++;
      }
    }
    const mean = sum / count;
    return Math.max(0, sumSq / count - mean * mean);
  }

  // ==========================================
  // PIPELINE ORCHESTRATION & RENDERING
  // ==========================================
  function renderAllStages(obsData, restData, trustScores, refData) {
    const w = obsData.width;
    const h = obsData.height;

    [elements.canvasObserved, elements.canvasRestored, elements.canvasTrust, elements.canvasRefined].forEach(c => {
      c.width = w;
      c.height = h;
    });

    elements.canvasObserved.getContext('2d').putImageData(obsData, 0, 0);
    elements.canvasRestored.getContext('2d').putImageData(restData, 0, 0);

    const jetData = createJetTrustImageData(trustScores, w, h);
    elements.canvasTrust.getContext('2d').putImageData(jetData, 0, 0);

    elements.canvasRefined.getContext('2d').putImageData(refData, 0, 0);

    // Update Split Viewer
    elements.splitBeforeImg.src = elements.canvasObserved.toDataURL();
    elements.splitAfterImg.src = elements.canvasRefined.toDataURL();

    // Diagnostics calculation
    let sumTrust = 0;
    let lowCount = 0;
    for (let i = 0; i < trustScores.length; i++) {
      sumTrust += trustScores[i];
      if (trustScores[i] < state.threshold) lowCount++;
    }
    const meanTrust = (sumTrust / trustScores.length).toFixed(3);
    const lowPct = ((lowCount / trustScores.length) * 100).toFixed(1);
    const obsSharp = computeLaplacianSharpness(obsData).toFixed(1);
    const refSharp = computeLaplacianSharpness(refData).toFixed(1);

    elements.diagTrustScore.textContent = meanTrust;
    elements.diagLowTrustPct.textContent = `${lowPct}%`;
    elements.diagObsSharp.textContent = obsSharp;
    elements.diagRefSharp.textContent = refSharp;

    state.obsData = obsData;
    state.restData = restData;
    state.trustScores = trustScores;
    state.refData = refData;
  }

  function processActiveImage() {
    if (!state.cleanCanvas) return;

    const w = state.cleanCanvas.width;
    const h = state.cleanCanvas.height;
    const cleanCtx = state.cleanCanvas.getContext('2d');
    const cleanData = cleanCtx.getImageData(0, 0, w, h);

    let obsData;
    if (state.useSyntheticDegrade) {
      obsData = applySyntheticDegradation(cleanData, state.lightFactor, state.noiseLevel, state.blurKernel);
    } else {
      obsData = cleanData;
    }

    const restData = simulateDeepRestoration(obsData);
    const trustScores = computeTriFactorTrustMap(obsData, restData);
    const refData = applyTrustRefinement(restData, trustScores, state.threshold);

    renderAllStages(obsData, restData, trustScores, refData);
  }

  // Load procedural clean generator
  function loadProceduralScene() {
    elements.btnSampleScene.classList.add('active');
    elements.btnSamplePattern.classList.remove('active');
    state.cleanCanvas = generateUnseenSceneCanvas(380, 260);
    processActiveImage();
  }

  function loadProceduralPattern() {
    elements.btnSamplePattern.classList.add('active');
    elements.btnSampleScene.classList.remove('active');
    state.cleanCanvas = generateUnseenPatternCanvas(380, 260);
    processActiveImage();
  }

  // ==========================================
  // EVENT LISTENERS & USER INPUTS
  // ==========================================

  // Preset buttons
  elements.btnSampleScene.addEventListener('click', loadProceduralScene);
  elements.btnSamplePattern.addEventListener('click', loadProceduralPattern);

  // Threshold slider
  elements.thresholdSlider.addEventListener('input', (e) => {
    state.threshold = parseFloat(e.target.value);
    elements.thresholdVal.textContent = state.threshold.toFixed(2);
    
    if (state.restData && state.trustScores) {
      const refData = applyTrustRefinement(state.restData, state.trustScores, state.threshold);
      elements.canvasRefined.getContext('2d').putImageData(refData, 0, 0);
      elements.splitAfterImg.src = elements.canvasRefined.toDataURL();
      
      let lowCount = 0;
      for (let i = 0; i < state.trustScores.length; i++) {
        if (state.trustScores[i] < state.threshold) lowCount++;
      }
      elements.diagLowTrustPct.textContent = `${((lowCount / state.trustScores.length) * 100).toFixed(1)}%`;
      elements.diagRefSharp.textContent = computeLaplacianSharpness(refData).toFixed(1);
    }
  });

  // Degradation Controls
  elements.degradeSwitch.addEventListener('change', (e) => {
    state.useSyntheticDegrade = e.target.checked;
    elements.degradeParams.style.display = e.target.checked ? 'block' : 'none';
  });

  elements.lightSlider.addEventListener('input', (e) => {
    state.lightFactor = parseFloat(e.target.value);
    elements.lightVal.textContent = `${Math.round(state.lightFactor * 100)}%`;
  });

  elements.noiseSlider.addEventListener('input', (e) => {
    state.noiseLevel = parseFloat(e.target.value);
    elements.noiseVal.textContent = state.noiseLevel.toFixed(3);
  });

  elements.blurSlider.addEventListener('input', (e) => {
    state.blurKernel = parseInt(e.target.value, 10);
    elements.blurVal.textContent = `${state.blurKernel}px`;
  });

  elements.reprocessBtn.addEventListener('click', processActiveImage);

  // File Upload Handlers (Upload ANY Image)
  function handleUploadedFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Limit dimension for smooth client-side execution
        const maxDim = 450;
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        const scale = Math.min(1.0, maxDim / Math.max(w, h));
        w = Math.round(w * scale);
        h = Math.round(h * scale);

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        state.cleanCanvas = canvas;
        elements.btnSampleScene.classList.remove('active');
        elements.btnSamplePattern.classList.remove('active');
        processActiveImage();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  elements.dropzone.addEventListener('click', () => elements.fileInput.click());
  elements.fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleUploadedFile(e.target.files[0]);
  });

  elements.dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.dropzone.classList.add('dragover');
  });

  elements.dropzone.addEventListener('dragleave', () => {
    elements.dropzone.classList.remove('dragover');
  });

  elements.dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length) handleUploadedFile(e.dataTransfer.files[0]);
  });

  // View Mode Tabs (Grid vs Split)
  elements.tabGrid.addEventListener('click', () => {
    elements.tabGrid.classList.add('active');
    elements.tabSplit.classList.remove('active');
    elements.viewportGrid.style.display = 'grid';
    elements.viewportSplit.style.display = 'none';
  });

  elements.tabSplit.addEventListener('click', () => {
    elements.tabSplit.classList.add('active');
    elements.tabGrid.classList.remove('active');
    elements.viewportGrid.style.display = 'none';
    elements.viewportSplit.style.display = 'block';
  });

  // Split slider interactive dragging
  let isDraggingSplit = false;
  function updateSplitPosition(clientX) {
    const rect = elements.viewportSplit.getBoundingClientRect();
    let pos = ((clientX - rect.left) / rect.width) * 100;
    pos = Math.max(0, Math.min(100, pos));
    elements.splitOverlay.style.width = `${pos}%`;
    elements.splitHandle.style.left = `${pos}%`;
  }

  elements.splitHandle.addEventListener('mousedown', () => { isDraggingSplit = true; });
  window.addEventListener('mouseup', () => { isDraggingSplit = false; });
  window.addEventListener('mousemove', (e) => {
    if (isDraggingSplit) updateSplitPosition(e.clientX);
  });

  elements.splitHandle.addEventListener('touchstart', () => { isDraggingSplit = true; }, { passive: true });
  window.addEventListener('touchend', () => { isDraggingSplit = false; });
  window.addEventListener('touchmove', (e) => {
    if (isDraggingSplit && e.touches.length) updateSplitPosition(e.touches[0].clientX);
  }, { passive: true });

  // Pixel Trust Inspector Crosshair
  function setupInspector(canvas) {
    canvas.addEventListener('mousemove', (e) => {
      if (!state.trustScores) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top) * scaleY);

      if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
        const idx = y * canvas.width + x;
        const score = state.trustScores[idx] || 0;
        const status = score >= state.threshold 
          ? '<span style="color:#10b981;">High Confidence (Deep Preserved)</span>' 
          : '<span style="color:#f43f5e;">Low Confidence (Bilateral Smoothed)</span>';

        elements.inspectorOverlay.style.display = 'block';
        elements.inspectorOverlay.innerHTML = `
          <strong>Coord:</strong> (${x}, ${y})<br>
          <strong>Trust Score:</strong> ${score.toFixed(3)}<br>
          <strong>Filter Action:</strong> ${status}
        `;
      }
    });

    canvas.addEventListener('mouseleave', () => {
      elements.inspectorOverlay.style.display = 'none';
    });
  }

  [elements.canvasObserved, elements.canvasRestored, elements.canvasTrust, elements.canvasRefined].forEach(setupInspector);

  // File Downloads
  elements.downloadRefined.addEventListener('click', () => {
    const a = document.createElement('a');
    a.download = 'trustrestore_refined_image.png';
    a.href = elements.canvasRefined.toDataURL();
    a.click();
  });

  elements.downloadTrust.addEventListener('click', () => {
    const a = document.createElement('a');
    a.download = 'trustrestore_trust_map.png';
    a.href = elements.canvasTrust.toDataURL();
    a.click();
  });

  // Copy Gradio Command
  if (elements.copyCmdBtn) {
    elements.copyCmdBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('python gradio_app.py').then(() => {
        elements.copyCmdBtn.textContent = '✓ Copied!';
        setTimeout(() => { elements.copyCmdBtn.textContent = 'Copy Command'; }, 2000);
      });
    });
  }

  // Initialize with unseen scene test
  loadProceduralScene();

})();
