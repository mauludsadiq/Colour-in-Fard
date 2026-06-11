# cfcolor (Kotlin)

CF-ID: deterministic colour identity, per CF-Protocol-2.0.0
(see SPEC-2.0.md in the main repo).

Pure Kotlin, zero third-party dependencies (uses
java.security.MessageDigest, part of the JDK, for SHA-256). This is the
eighth independent CF-ID implementation, after FARD, Python, Rust,
TypeScript, WASM, Swift, and C++, and matches all of them exactly on
every SPEC-2.0.md test vector.

This was the deferred half of Roadmap v4 Phase B.3 (the Swift half
shipped first; this completes it). Together with cfid_swift, this is the
prerequisite pair for any future Android/iOS app (Phase C.5).

## Usage

    import com.colourinfard.cfcolor.fromHex
    import com.colourinfard.cfcolor.fromRGB

    fromHex("#7B3F00")   // "CF-7B3F00-EA262463"
    fromRGB(255, 0, 0)   // "CF-FF0000-37AB74A7"

fromHex throws InvalidHexException on malformed input.

## CLI

    kotlinc src/main/kotlin/com/colourinfard/cfcolor/CFID.kt \
            src/main/kotlin/com/colourinfard/cfcolor/cli/Main.kt \
            -include-runtime -d cfid.jar
    java -jar cfid.jar "#7B3F00"
    CF-7B3F00-EA262463

## Build and test

No Gradle wrapper is included -- this is built and tested directly with
kotlinc to keep the dependency surface minimal (consistent with every
other language port in this project). The test suite is a plain
assert-based runner (kotlin.test/JUnit were avoided -- they require
additional jars not bundled with a bare kotlinc install):

    kotlinc src/main/kotlin/com/colourinfard/cfcolor/CFID.kt \
            src/test/kotlin/com/colourinfard/cfcolor/CFIDTest.kt \
            -include-runtime -d test.jar
    java -cp test.jar com.colourinfard.cfcolor.CFIDTestKt

14/14 checks pass: all 7 SPEC-2.0.md Appendix A.1 vectors, the round3
negative-truncation edge case from Appendix A.2, 3-digit hex expansion,
fromRGB/fromHex consistency, invalid-input error handling (malformed and
wrong-length hex both throw), and a hue-range check.

## Status

Part of the Colour-in-FARD project's Roadmap v4, Phase B.3 (Kotlin half --
this completes Phase B.3, alongside cfid_swift). Not yet packaged for
Maven Central or as an Android .aar; a Gradle build can be added when an
Android module is actually started (Phase C.5).
