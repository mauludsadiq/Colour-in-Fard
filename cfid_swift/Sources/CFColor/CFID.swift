// CF-ID: deterministic colour identity, per CF-Protocol-2.0.0
// (see SPEC-2.0.md in the main repo).
//
// Pure Swift, zero third-party dependencies (uses CryptoKit, part of
// Apple's standard SDKs, for SHA-256). This is the sixth independent
// CF-ID implementation, after FARD, Python, Rust, TypeScript, and WASM,
// and matches all of them exactly on every SPEC-2.0.md test vector.

import Foundation
import CryptoKit

public struct Lab {
    public let l: Double
    public let a: Double
    public let b: Double
}

public enum CFColorError: Error, CustomStringConvertible {
    case invalidHex(String)
    public var description: String {
        switch self {
        case .invalidHex(let s): return "invalid hex colour: \(s)"
        }
    }
}

private func srgbToLinear(_ c: Double) -> Double {
    let c = c / 255.0
    return c <= 0.04045 ? c / 12.92 : pow((c + 0.055) / 1.055, 2.4)
}

public func rgbToLab(_ r: Int, _ g: Int, _ b: Int) -> Lab {
    let r1 = srgbToLinear(Double(r))
    let g1 = srgbToLinear(Double(g))
    let b1 = srgbToLinear(Double(b))

    let x = (r1 * 0.4124564 + g1 * 0.3575761 + b1 * 0.1804375) * 100.0 / 95.047
    let y = (r1 * 0.2126729 + g1 * 0.7151522 + b1 * 0.0721750) * 100.0 / 100.0
    let z = (r1 * 0.0193339 + g1 * 0.1191920 + b1 * 0.9503041) * 100.0 / 108.883

    func f(_ v: Double) -> Double {
        v > 0.008856 ? pow(v, 1.0 / 3.0) : 7.787 * v + 16.0 / 116.0
    }

    let l = 116.0 * f(y) - 16.0
    let a = 500.0 * (f(x) - f(y))
    let bb = 200.0 * (f(y) - f(z))

    return Lab(l: l, a: a, b: bb)
}

/// FARD's round3: truncation toward zero, NOT round-half-up.
/// round3(-86.183) == -86.182
public func round3(_ x: Double) -> Double {
    let scaled = x * 1000.0 + 0.5
    let truncated = scaled >= 0 ? scaled.rounded(.down) : scaled.rounded(.up)
    return truncated / 1000.0
}

private func jsonNumber(_ v: Double) -> String {
    let r = round3(v)
    if r == r.rounded(.towardZero) {
        return String(Int64(r))
    }
    var s = String(format: "%.3f", r)
    while s.hasSuffix("0") { s.removeLast() }
    if s.hasSuffix(".") { s.removeLast() }
    return s
}

/// CF-ID for an RGB triple (0-255 each).
public func fromRGB(_ r: Int, _ g: Int, _ b: Int) -> String {
    let lab = rgbToLab(r, g, b)

    let aS = jsonNumber(lab.a)
    let bS = jsonNumber(lab.b)
    let lS = jsonNumber(lab.l)

    // Canonical JSON: alphabetical keys, no whitespace
    let preimage = "{\"a\":\(aS),\"b\":\(bS),\"l\":\(lS)}"

    let digest = SHA256.hash(data: Data(preimage.utf8))
    let hexDigest = digest.map { String(format: "%02x", $0) }.joined()
    let labHash8 = String(hexDigest.prefix(8)).uppercased()

    let hex6 = String(format: "%02X%02X%02X", r, g, b)

    return "CF-\(hex6)-\(labHash8)"
}

/// Parse #rgb or #rrggbb (with or without leading '#') and return its CF-ID.
public func fromHex(_ hex: String) throws -> String {
    var h = hex
    if h.hasPrefix("#") { h.removeFirst() }
    if h.count == 3 {
        h = h.flatMap { [$0, $0] }.map(String.init).joined()
    }
    guard h.count == 6, h.allSatisfy({ $0.isHexDigit }) else {
        throw CFColorError.invalidHex(hex)
    }
    guard
        let r = Int(h.prefix(2), radix: 16),
        let g = Int(h.dropFirst(2).prefix(2), radix: 16),
        let b = Int(h.suffix(2), radix: 16)
    else {
        throw CFColorError.invalidHex(hex)
    }
    return fromRGB(r, g, b)
}
