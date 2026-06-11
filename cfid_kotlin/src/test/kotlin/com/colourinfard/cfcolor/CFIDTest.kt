package com.colourinfard.cfcolor

import kotlin.system.exitProcess

private var passed = 0
private var failed = 0

private fun check(name: String, ok: Boolean) {
    if (ok) { println("  ok  $name"); passed++ }
    else    { println("  FAIL $name"); failed++ }
}

fun main() {
    // SPEC-2.0.md Appendix A.1 vectors
    val cases = listOf(
        "#000000" to "CF-000000-86165F20",
        "#ffffff" to "CF-FFFFFF-2DD4EB92",
        "#ff0000" to "CF-FF0000-37AB74A7",
        "#00ff00" to "CF-00FF00-9377CC77",
        "#0000ff" to "CF-0000FF-D81673DF",
        "#7b3f00" to "CF-7B3F00-EA262463",
        "#cc0000" to "CF-CC0000-791976F7",
    )
    for ((hex, expected) in cases) {
        check("spec vector $hex", fromHex(hex) == expected)
    }

    check("3-digit hex expands", fromHex("#f00") == fromHex("#ff0000"))

    check("round3 truncates toward zero (negative)", round3(-86.183) == -86.182)

    check("round3 truncates toward zero (positive)",
        round3(86.183) == 86.183 && round3(0.0001) == 0.0)

    check("fromRGB matches fromHex", fromRGB(255, 0, 0) == fromHex("#ff0000"))

    var threw = false
    try { fromHex("#zzzzzz") } catch (e: InvalidHexException) { threw = true }
    check("invalid hex throws", threw)

    var threw2 = false
    try { fromHex("#ff00") } catch (e: InvalidHexException) { threw2 = true }
    check("wrong-length hex throws", threw2)

    val lab = rgbToLab(123, 63, 0)
    check("lch hue in [0,360)", lab.h >= 0.0 && lab.h < 360.0)

    println("\n$passed passed, $failed failed")
    if (failed > 0) exitProcess(1)
}
