# cfcolor (C++)

CF-ID: deterministic colour identity, per CF-Protocol-2.0.0
(see SPEC-2.0.md in the main repo).

Header-only C++17, zero dependencies (includes its own SHA-256
implementation in include/cfcolor/cfid.hpp). This is the seventh
independent CF-ID implementation, after FARD, Python, Rust, TypeScript,
WASM, and Swift, and matches all of them exactly on every SPEC-2.0.md
test vector.

Header-only and dependency-free makes this suitable for embedding via a
C ABI in native creative-tool plugins (Roadmap v4 Phase C.3/C.4).

## Usage

    #include "cfcolor/cfid.hpp"

    cfcolor::from_hex("#7B3F00");   // "CF-7B3F00-EA262463"
    cfcolor::from_rgb(255, 0, 0);   // "CF-FF0000-37AB74A7"

from_hex throws std::invalid_argument on malformed input.

## CLI

    clang++ -std=c++17 -O2 -I include src/main.cpp -o cfid
    ./cfid "#7B3F00"
    CF-7B3F00-EA262463

## Build and test

    mkdir build && cd build
    cmake .. -DCMAKE_BUILD_TYPE=Release
    cmake --build .
    ctest --output-on-failure

13/13 checks pass: all 7 SPEC-2.0.md Appendix A.1 vectors, the round3
negative-truncation edge case from Appendix A.2, 3-digit hex expansion,
from_rgb/from_hex consistency, and invalid-input error handling
(malformed hex digits and wrong-length strings both throw).

## Status

Part of the Colour-in-FARD project's Roadmap v4, Phase B.4. Not yet
packaged for any package manager (vcpkg/Conan); as a single header file
it can simply be copied into a project.
