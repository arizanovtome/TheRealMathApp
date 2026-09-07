# Android splash artwork

Generated with the built-in image generation tool, using `icon.png` as the brand reference.

- `splash-android-light.png`: white background, dark chalkboard green lettering (target `colors.board`, `#2a4538`), gold angle-shaped A.
- `splash-android-dark.png`: black background matching the Android splash night color.

The Android override in `app.json` selects the image from the phone's appearance setting. The 220 dp image width keeps the lettering inside Android's splash icon mask. Native splash changes require a new Android build.

## Generation prompts

Light color refinement (built-in image tool, using the light asset as the edit target): Use case: precise-object-edit. Edit the supplied white Android splash image. Change ONLY all green lettering (THE REAL and M,T,H) to flat dark chalkboard green #2A4538, RGB 42,69,56, matching the app's board color. Preserve exactly the gold angle-shaped A, white background, typography, letter geometry, alignment, layout, scale, margins and square dimensions. No new texture, gradients, shadows or other changes. Use solid uniform #2A4538 inside the green letters.

Light: Use case: logo-brand. Create a square 1024x1024 Android splash image using the reference logo. Exact text THE REAL above MATH; preserve the reference typography and distinctive gold geometric angle symbol replacing the A in MATH. Change all cream/white letters to rich readable emerald green #25845D, keep angle-shaped A saturated gold #F6C449. Background must be perfectly flat pure white #FFFFFF, no texture, gradient, border, shadow or icon tile. Center the entire two-line logo within the central 64% of the canvas width with ample empty margins for Android splash masking. Crisp polished edges. Reference is the existing app logo; preserve its identity.

Dark (using the light asset as reference): Use case: precise-object-edit. Create the dark-mode counterpart of this Android splash logo. Change only the white background to perfectly uniform pure black #000000, including inside letter counters and the gold angle symbol. Preserve EXACT logo geometry, two-line text THE REAL / MATH, positioning, scale, green letters and gold angle-shaped A. No additional objects, shadows, border, gradients or texture. Square output same framing as input.
