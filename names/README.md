# CF Naming Databases

A naming database is a versioned NDJSON file: one JSON object per line,
each with `name` and `hex` fields.

    {"name":"scarlet","hex":"#ff2300"}
    {"name":"vermilion","hex":"#ea682d"}

## How naming works

CF-ID is independent of naming -- the identity CF-CC0000-791976F7 never
changes. The *name* attached to a colour ("scarlet", "crimson", "vermilion")
depends on which naming database is used and which distance metric
(CIE76 or CIEDE2000).

Every naming database has a version hash: the first 8 hex characters
(uppercase) of SHA256 over the raw NDJSON file content. Any output that
used a naming database (e.g. apps/naming.fard, apps/lookup.fard) records
this hash in its receipt, so the exact naming database used for any naming
claim is verifiable.

## Files

- cf-anchors-1.0.0.ndjson -- the original CF anchor set (112 entries):
  CSS named colours, neons, gray ladder, and violet-cast darks. This is
  the default naming database used throughout Colour-in-FARD.
- cf-pigments-1.0.0.ndjson -- a small example database derived from the
  CF Historical Pigment Corpus, demonstrating that alternative naming
  databases can give different (and equally valid) names for the same
  CF-ID.

## Publishing your own naming database

Anyone can publish a naming database:

1. Create an NDJSON file with {"name": ..., "hex": ...} lines
2. Use it with any app that accepts a naming database path:

       fardrun run --program apps/naming.fard --out out/run -- "#cc0000" "path/to/your-db.ndjson"

3. The receipt will record your database's version hash, so others can
   verify exactly which naming database produced a given name.

There is no central authority over naming. The identity layer (CF-ID) is
permanent and version-1.0.0 forever; the naming layer is open and
versioned, and a colour can have as many names as there are naming
databases that include it.
