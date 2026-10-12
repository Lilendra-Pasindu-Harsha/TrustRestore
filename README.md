# TrustRestore

### A Preliminary Self-Supervised Trust-Aware Framework for Compound Image Restoration

TrustRestore explores a simple question:

> Can an image-restoration system also show which parts of its output are more reliable?

The project combines a lightweight self-supervised U-Net with a per-pixel Trust Map based on observation agreement, structural consistency, and Monte Carlo prediction stability.

It includes a Google Colab research workflow and an optional Gradio interface for uploading images and viewing restoration results.

> **Research status:** Preliminary proof of concept. Trust scores are heuristic reliability indicators, not calibrated probabilities or guarantees of correctness.

## Overview

Images captured by phones and low-cost cameras may contain noise, low illumination, motion blur, and compression artifacts.

TrustRestore investigates restoration under limited-data conditions without requiring a large external paired training dataset. Clean source images are retained only as references for controlled evaluation.

The current experiment trains a shared U-Net on patches sampled from the uploaded degraded images. Those same images are subsequently evaluated, so the results describe reconstruction behavior rather than generalization to unseen images.

## Key Features

- Masked-patch self-supervised U-Net training
- Controlled synthetic compound degradation
- Monte Carlo dropout prediction variance
- Data-consistency and Sobel-gradient structural trust scores
- Per-pixel Trust Map visualization
- Trust-guided bilateral refinement
- PSNR and SSIM evaluation against clean references
- Trust-versus-error correlation analysis
- Inference-stage component ablations
- Exported figures and CSV result tables
- Optional Gradio image-upload interface

## Method

```text
Degraded image
      ↓
Masked-patch self-supervised U-Net
      ↓
Multiple Monte Carlo dropout predictions
      ↓
Mean restoration + prediction variance
      ↓
Data consistency × Structural consistency × Prediction stability
      ↓
Per-pixel Trust Map
      ↓
Low-trust bilateral refinement
      ↓
Final output
```

### Trust Components

| Component | Purpose |
|---|---|
| Data consistency | Measures agreement between restored and observed pixel values |
| Structural consistency | Compares grayscale Sobel-gradient magnitudes |
| Prediction stability | Measures agreement across stochastic model predictions |

The component scores are multiplied and normalized separately for each image.

High trust means greater agreement under these criteria. It does not necessarily mean the restored pixel matches the clean scene.

## Running in Google Colab

1. Open Google Colab.
2. Upload the project notebook.
3. Select a GPU runtime if available.
4. Run the setup cells.
5. Upload 1–3 clean source images for controlled evaluation.
6. Run degradation, training, restoration, and analysis.
7. Download the generated research-output ZIP.
8. Run the optional Gradio cell to try the upload interface.

### Controlled Research Evaluation

```text
Clean reference
      ↓
Synthetic degradation
      ↓
Restoration
      ↓
Comparison with the clean reference
```

Clean references make PSNR and SSIM meaningful.

### Real-Image Demonstration

The Gradio interface accepts real images and displays:

- Mean deep-restoration output
- Colorized Trust Map
- Trust-refined output

PSNR and SSIM are not reported for arbitrary uploads because corresponding clean references are unavailable.

## Default Configuration

| Setting | Value |
|---|---:|
| Maximum image dimension
