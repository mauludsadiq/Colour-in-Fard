// CF-ID: deterministic colour identity, per CF-Protocol-2.0.0
// (see SPEC-2.0.md in the main repo).
//
// Pure Kotlin, zero third-party dependencies (uses
// java.security.MessageDigest, part of the JDK, for SHA-256). This is
// the eighth independent CF-ID implementation, after FARD, Python, Rust,
// TypeScript, WASM, Swift, and C++, and matches all of them exactly on
// every SPEC-2.0.md test vector.

package com.colourinfard.cfcolor

import java.security.MessageDigest
import kotlin.math.atan2
import kotlin.math.pow

data class Lab(val l: Double, val a: Double, val b: Double, val c: Double, val h: Double)

class InvalidHexException(message: String) : Exception(message)

private fun srgbToLinear(c: Double): Double {
    val cc = c / 255.0
    return if (cc <= 0.04045) cc / 12.92 else ((cc + 0.055) / 1.055).pow(2.4)
}

fun rgbToLab(r: Int, g: Int, b: Int): Lab {
    val r1 = srgbToLinear(r.toDouble())
    val g1 = srgbToLinear(g.toDouble())
    val b1 = srgbToLinear(b.toDouble())

    val x = (r1 * 0.4124564 + g1 * 0.3575761 + b1 * 0.1804375) * 100.0 / 95.047
    val y = (r1 * 0.2126729 + g1 * 0.7151522 + b1 * 0.0721750) * 100.0 / 100.0
    val z = (r1 * 0.0193339 + g1 * 0.1191920 + b1 * 0.9503041) * 100.0 / 108.883

    fun f(v: Double) = if (v > 0.008856) v.pow(1.0 / 3.0) else 7.787 * v + 16.0 / 116.0

    val L = 116.0 * f(y) - 16.0
    val a = 500.0 * (f(x) - f(y))
    val bb = 200.0 * (f(y) - f(z))
    val cc = Math.sqrt(a * a + bb * bb)
    var hh = atan2(bb, a) * 180.0 / Math.PI
    if (hh < 0) hh += 360.0

    return Lab(L, a, bb, cc, hh)
}

/**
 * FARD's round3: truncation toward zero, NOT round-half-up.
 * round3(-86.183) == -86.182
 */
fun round3(x: Double): Double {
    val scaled = x * 1000.0 + 0.5
    val truncated = if (scaled >= 0.0) Math.floor(scaled) else Math.ceil(scaled)
    return truncated / 1000.0
}

private fun jsonNumber(v: Double): String {
    val r = round3(v)
    if (r == Math.floor(r) && !r.isInfinite()) {
        return r.toLong().toString()
    }
    var s = String.format("%.3f", r)
    s = s.trimEnd('0').trimEnd('.')
    return s
}

private fun sha256Hex(input: String): String {
    val digest = MessageDigest.getInstance("SHA-256").digest(input.toByteArray(Charsets.UTF_8))
    return digest.joinToString("") { "%02x".format(it) }
}

/** CF-ID for an RGB triple (0-255 each). */
fun fromRGB(r: Int, g: Int, b: Int): String {
    val lab = rgbToLab(r, g, b)

    val aS = jsonNumber(lab.a)
    val bS = jsonNumber(lab.b)
    val lS = jsonNumber(lab.l)

    // Canonical JSON: alphabetical keys, no whitespace
    val preimage = "{\"a\":$aS,\"b\":$bS,\"l\":$lS}"

    val hexDigest = sha256Hex(preimage)
    val labHash8 = hexDigest.substring(0, 8).uppercase()

    val hex6 = "%02X%02X%02X".format(r, g, b)

    return "CF-$hex6-$labHash8"
}

/** Parse #rgb or #rrggbb (with or without leading '#') and return its CF-ID. */
fun fromHex(hex: String): String {
    var h = hex.removePrefix("#")
    if (h.length == 3) {
        h = h.flatMap { listOf(it, it) }.joinToString("")
    }
    if (h.length != 6 || !h.all { it.isDigit() || it.lowercaseChar() in 'a'..'f' }) {
        throw InvalidHexException("invalid hex colour: $hex")
    }
    val r = h.substring(0, 2).toInt(16)
    val g = h.substring(2, 4).toInt(16)
    val b = h.substring(4, 6).toInt(16)
    return fromRGB(r, g, b)
}
