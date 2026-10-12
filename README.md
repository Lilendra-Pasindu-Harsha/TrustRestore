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
| Maximum image dimension | 512 pixels |
| Training patch size | 96 × 96 |
| Masking ratio | 8% |
| Optimization iterations | 300 |
| Batch size | 8 |
| Learning rate | 0.0002 |
| Edge-loss weight | 0.15 |
| Monte Carlo predictions | 20 |
| Random seed | 42 |

These values should match the notebook version included in this repository.

## Evaluation

### Restoration Quality

- **PSNR:** Pixel-level fidelity to a clean reference
- **SSIM:** Structural similarity to a clean reference
- **Laplacian variance:** Supplementary sharpness proxy; noise can inflate it

### Trust Analysis

Pearson correlation measures the relationship between Trust Score and mean absolute RGB restoration error.

A negative correlation supports an inverse association within the evaluated image. It does not establish calibrated uncertainty or guaranteed correctness.

### Ablation Configurations

| Configuration | Change |
|---|---|
| Full TrustRestore | All trust components and refinement |
| No data trust | Observation-agreement component removed |
| No structural trust | Gradient-consistency component removed |
| No stability trust | Prediction-variance component removed |
| No refinement | Mean deep-restoration output only |

The trained model and Monte Carlo predictions remain fixed during these ablations. They evaluate trust-guided post-processing, not independently trained model variants.

## Results

Measured results should be added here after running the notebook.

Do not interpret the availability of plots or metrics as evidence that the method improves restoration. Report increases, decreases, and weak trust-error correlations honestly.

## Limitations

- The current evaluation uses a small number of images.
- Training and evaluation use the same degraded images.
- Generalization to unseen images has not been established.
- Masked-pixel prediction does not explicitly invert blur, illumination loss, or JPEG compression.
- The model may oversmooth details or retain degradation.
- Trust scores are uncalibrated and normalized per image.
- Stable predictions can still be incorrect.
- Bilateral refinement is not guaranteed to improve PSNR or SSIM.
- Monte Carlo sampling increases inference cost.

The project is not intended for safety-critical or diagnostic use.

## Technologies

Python · PyTorch · OpenCV · NumPy · pandas · Matplotlib ·
scikit-image · Google Colab · Gradio

## Research Paper

A companion manuscript describes the proposed framework, controlled evaluation protocol, trust formulation, and limitations.

**Publication status:** Research draft; no peer-reviewed publication is claimed.

## Author

**Pasindu Harsha**

Department of Electronic and Telecommunication Engineering  
General Sir John Kotelawala Defence University, Sri Lanka

GitHub: https://github.com/Lilendra-Pasindu-Harsha

## References

1. D. Ulyanov, A. Vedaldi, and V. Lempitsky, “Deep Image Prior,” CVPR, 2018.  
   https://openaccess.thecvf.com/content_cvpr_2018/html/Ulyanov_Deep_Image_Prior_CVPR_2018_paper.html

2. J. Lehtinen et al., “Noise2Noise: Learning Image Restoration without Clean Data,” ICML, 2018.  
   https://proceedings.mlr.press/v80/lehtinen18a.html

3. A. Krull, T.-O. Buchholz, and F. Jug, “Noise2Void—Learning Denoising From Single Noisy Images,” CVPR, 2019.  
   https://openaccess.thecvf.com/content_CVPR_2019/html/Krull_Noise2Void_-_Learning_Denoising_From_Single_Noisy_Images_CVPR_2019_paper.html

4. Y. Gal and Z. Ghahramani, “Dropout as a Bayesian Approximation: Representing Model Uncertainty in Deep Learning,” ICML, 2016.  
   https://proceedings.mlr.press/v48/gal16.html

5. Z. Wang et al., “Image Quality Assessment: From Error Visibility to Structural Similarity,” IEEE Transactions on Image Processing, 2004.  
   https://doi.org/10.1109/TIP.2003.819861

6. C. Tomasi and R. Manduchi, “Bilateral Filtering for Gray and Color Images,” ICCV, 1998.  
   https://doi.org/10.1109/ICCV.1998.710815

## License

This project is distributed under the MIT License. See `LICENSE` for details.
