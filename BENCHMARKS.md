# Benchmarks -- Colour in FARD v1.0.0

Measured on MacBook Pro. FARD v1.7.1 interpreter (pure eval, no native compilation).

| Operation               | Scale                    | Real time  |
|-------------------------|--------------------------|------------|
| Full RGB traversal      | 16,777,216 colours       | 41m49s     |
| PPM export (K=255)      | 171MB streamed in chunks | 41m49s     |
| Catalogue generation    | K=10, 1,331 colours      | 1m6s       |
| Relationship sheet SVG  | 1 hex input              | 0.5s       |
| colorbrain explain      | 1 hex, full profile      | 0.8s       |

## Notes

Full spectrum (K=255) is an interpreted workload: 16.7M iterations of float
arithmetic, string formatting, and chunked file I/O. The 41m timing reflects
the interpreter overhead of pure FARD -- not an optimised native pipeline.

Catalogue at K=10 runs LAB/LCH conversion, Delta-E nearest-name lookup against
87 anchors, hex encoding, HSV conversion, and JSON serialisation for 1,331
colours. At 1m6s that is ~50ms per colour in the interpreter.

Single-colour operations (explain, relations) complete in under 1 second
including startup, module resolution, full LAB pipeline, and SVG generation.

The --compile-linked flag (Stage 7 native ELF) is available in fardrun and
would reduce these times significantly. Benchmarks above are interpreter-only.
