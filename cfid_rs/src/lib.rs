//! CF-ID: deterministic colour identity, per SPEC-2.0.md (CF-Protocol-2.0.0).
//!
//! Pure Rust, no dependencies (includes its own SHA-256 implementation).
//!
//! ```
//! assert_eq!(cfcolor::from_hex("#7B3F00").unwrap(), "CF-7B3F00-EA262463");
//! ```

mod sha256;
use sha256::sha256_hex;

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Lab {
    pub l: f64,
    pub a: f64,
    pub b: f64,
}

/// FARD's round3: truncation toward zero, NOT round-half-up.
/// round3(-86.183) == -86.182
pub fn round3(x: f64) -> f64 {
    let scaled = x * 1000.0 + 0.5;
    let truncated = if scaled >= 0.0 {
        scaled.floor()
    } else {
        scaled.ceil()
    };
    truncated / 1000.0
}

fn srgb_to_linear(c: f64) -> f64 {
    let c = c / 255.0;
    if c <= 0.04045 {
        c / 12.92
    } else {
        ((c + 0.055) / 1.055).powf(2.4)
    }
}

pub fn rgb_to_lab(r: u8, g: u8, b: u8) -> Lab {
    let r1 = srgb_to_linear(r as f64);
    let g1 = srgb_to_linear(g as f64);
    let b1 = srgb_to_linear(b as f64);

    let x = (r1 * 0.4124564 + g1 * 0.3575761 + b1 * 0.1804375) * 100.0 / 95.047;
    let y = (r1 * 0.2126729 + g1 * 0.7151522 + b1 * 0.0721750) * 100.0 / 100.0;
    let z = (r1 * 0.0193339 + g1 * 0.1191920 + b1 * 0.9503041) * 100.0 / 108.883;

    let f = |v: f64| {
        if v > 0.008856 {
            v.powf(1.0 / 3.0)
        } else {
            7.787 * v + 16.0 / 116.0
        }
    };

    let l = 116.0 * f(y) - 16.0;
    let a = 500.0 * (f(x) - f(y));
    let bb = 200.0 * (f(y) - f(z));

    Lab { l, a, b: bb }
}

/// Format a round3'd number as the canonical JSON encoder does:
/// integers without a decimal point, otherwise up to 3 decimals with no
/// trailing zeros.
fn json_number(v: f64) -> String {
    let r = round3(v);
    if r == r.trunc() {
        format!("{}", r as i64)
    } else {
        let s = format!("{:.3}", r);
        let s = s.trim_end_matches('0');
        let s = s.trim_end_matches('.');
        s.to_string()
    }
}

/// CF-ID for an RGB triple.
pub fn from_rgb(r: u8, g: u8, b: u8) -> String {
    let lab = rgb_to_lab(r, g, b);

    let a_s = json_number(lab.a);
    let b_s = json_number(lab.b);
    let l_s = json_number(lab.l);

    // Canonical JSON: alphabetical keys, no whitespace
    let preimage = format!("{{\"a\":{},\"b\":{},\"l\":{}}}", a_s, b_s, l_s);

    let hexdigest = sha256_hex(preimage.as_bytes());
    let labhash8 = hexdigest[0..8].to_uppercase();

    let hex6 = format!("{:02X}{:02X}{:02X}", r, g, b);

    format!("CF-{}-{}", hex6, labhash8)
}

/// Parse #rgb, #rrggbb (with or without leading '#') and return its CF-ID.
pub fn from_hex(hex: &str) -> Result<String, String> {
    let h = hex.trim_start_matches('#');
    let h = if h.len() == 3 {
        h.chars().flat_map(|c| [c, c]).collect::<String>()
    } else {
        h.to_string()
    };
    if h.len() != 6 {
        return Err(format!("invalid hex colour: {}", hex));
    }
    let r = u8::from_str_radix(&h[0..2], 16).map_err(|e| e.to_string())?;
    let g = u8::from_str_radix(&h[2..4], 16).map_err(|e| e.to_string())?;
    let b = u8::from_str_radix(&h[4..6], 16).map_err(|e| e.to_string())?;
    Ok(from_rgb(r, g, b))
}

#[cfg(test)]
mod tests {
    use super::*;

    // SPEC-2.0.md Appendix A.1 test vectors
    #[test]
    fn spec_vectors() {
        let cases = [
            ("#000000", "CF-000000-86165F20"),
            ("#ffffff", "CF-FFFFFF-2DD4EB92"),
            ("#ff0000", "CF-FF0000-37AB74A7"),
            ("#00ff00", "CF-00FF00-9377CC77"),
            ("#0000ff", "CF-0000FF-D81673DF"),
            ("#7b3f00", "CF-7B3F00-EA262463"),
            ("#cc0000", "CF-CC0000-791976F7"),
        ];
        for (hex, expected) in cases {
            assert_eq!(from_hex(hex).unwrap(), expected, "mismatch for {}", hex);
        }
    }

    #[test]
    fn three_digit_hex_expands() {
        assert_eq!(from_hex("#f00").unwrap(), from_hex("#ff0000").unwrap());
    }

    #[test]
    fn round3_truncates_toward_zero_for_negatives() {
        // SPEC-2.0.md Appendix A.2: round3(-86.183) == -86.182
        assert_eq!(round3(-86.183), -86.182);
    }

    #[test]
    fn round3_truncates_toward_zero_for_positives() {
        assert_eq!(round3(86.183), 86.183);
        assert_eq!(round3(0.0001), 0.0);
    }

    #[test]
    fn invalid_hex_errors() {
        assert!(from_hex("#zzzzzz").is_err());
        assert!(from_hex("#ff00").is_err());
    }
}
