//! WebAssembly bindings for cfcolor.
//!
//! The CF-ID algorithm itself lives in the dependency-free `cfcolor`
//! crate (cfid_rs); this crate is purely a thin wasm-bindgen wrapper so
//! that `cfcolor` itself stays free of the wasm-bindgen dependency.

use wasm_bindgen::prelude::*;

/// CF-ID for a hex colour string (#rgb or #rrggbb).
/// Throws a JS exception on invalid input.
#[wasm_bindgen(js_name = fromHex)]
pub fn from_hex(hex: &str) -> Result<String, JsError> {
    cfcolor::from_hex(hex).map_err(|e| JsError::new(&e))
}

/// CF-ID for an RGB triple (0-255 each).
#[wasm_bindgen(js_name = fromRgb)]
pub fn from_rgb(r: u8, g: u8, b: u8) -> String {
    cfcolor::from_rgb(r, g, b)
}

/// FARD's round3: truncation toward zero (not round-half-up).
#[wasm_bindgen]
pub fn round3(x: f64) -> f64 {
    cfcolor::round3(x)
}
