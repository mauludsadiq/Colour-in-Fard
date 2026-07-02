# SPEC-EMOLEX-1.0.md -- CF Emotional Palette Protocol 1.0

## Overview

CF-EMOLEX-1.0.0 is a deterministic text-to-palette protocol built on
top of Colour in FARD. Given a text input, a versioned emotion lexicon,
and a versioned colour mapping, it produces a deterministic CF palette
with a tamper-evident receipt chain.

The protocol makes NO claim that colour-emotion associations are
universal psychological truths. It claims only:

  Given lexicon L, mapping M, and text T, palette P is deterministically
  derived, and any party with L and M can reproduce and verify P from T.

This is the same epistemological stance as IF-Protocol: content-derived,
verifiable, honest about its inputs.

## Empirical grounding

### Lexicon: NRC Emotion Lexicon (NRC-EMOLEX)

Source: Mohammad & Turney (2013), "Crowdsourcing a Word-Emotion
Association Lexicon." Computational Intelligence, 29(3), 436-465.

The NRC Emotion Lexicon maps ~14,000 English words to 8 basic emotion
categories (Plutchik 1980) plus positive/negative valence:
  anger, anticipation, disgust, fear, joy, sadness, surprise, trust

It is the most widely used open emotion lexicon in NLP research and is
empirically constructed via crowdsourcing across annotators.

CF-EMOLEX-1.0.0 uses a subset of 1,000 high-frequency, high-agreement
words from NRC-EMOLEX as its base lexicon, extended to the 20 CF
emotion classes via the crosswalk table in section 3.

### Colour anchors: Jonauskaite et al. (2020)

Source: Jonauskaite, D. et al. (2020), "Universal Patterns in
Color-Emotion Associations." Psychological Science, 31(1), 57-74.

This study surveyed 4,598 participants across 30 countries and measured
colour-emotion associations across cultures. It is the largest
cross-cultural study of colour-emotion associations to date.

CF-EMOLEX uses the Jonauskaite et al. cross-cultural consensus colours
as anchors for the 20 emotion classes, placed in LCH colour space
(perceptually uniform, consistent with the rest of Colour in FARD).

### Emotion space: Russell (1980) circumplex

Source: Russell, J.A. (1980), "A circumplex model of affect." Journal
of Personality and Social Psychology, 39(6), 1161-1178.

The circumplex model places emotions in a 2D space of valence
(positive/negative) and arousal (high/low). CF-EMOLEX uses this
to place emotion classes in LCH colour space:

  valence  -> hue angle H (positive = warm hues, negative = cool/dark)
  arousal  -> chroma C (high arousal = high C, low arousal = low C)
  intensity -> lightness L (neutral = mid L, extreme = lower L)

## CF Emotion classes

20 versioned emotion classes with integer IDs:

  0  joy / beauty / delight
  1  neutral / factual / stable
  2  calm / friendliness
  3  affection / attraction
  4  hope / aspiration
  5  energy / excitement / courage
  6  care / gratitude / compassion
  7  achievement / esteem / prestige
  8  relief / forgiveness / comfort
  9  curiosity / absorption
  10 anonymity / hiddenness
  11 boredom / dullness
  12 confusion / ambiguity
  13 anger / hostility / violation
  14 fear / threat
  15 sadness / loss / damage
  16 envy / alienation / resentment
  17 disgust / abhorrence
  18 shame / disgrace
  19 anxiety / craving / agitation

These IDs are FROZEN in version 1.0. A new version of CF-EMOLEX
would assign new IDs rather than reassigning existing ones.

## Colour anchors (LCH)

Derived from Jonauskaite et al. (2020) cross-cultural consensus,
placed in LCH space consistent with Colour in FARD colour science.
Each anchor is the perceptual centre of the emotion class.

  ID  Name                        L     C     H     hex
  0   joy/beauty/delight          85    65    85     #F5D000
  1   neutral/factual/stable      55    5     200    #7A8088
  2   calm/friendliness           65    30    220    #6B9FBF
  3   affection/attraction        55    55    355    #C45A7A
  4   hope/aspiration             70    45    140    #5EB87A
  5   energy/excitement/courage   55    75    35     #D4500A
  6   care/gratitude/compassion   60    40    60     #C07840
  7   achievement/esteem/prestige 35    30    280    #4A3870
  8   relief/forgiveness/comfort  75    20    160    #7ABFA0
  9   curiosity/absorption        60    50    195    #3A8FAF
  10  anonymity/hiddenness        30    5     220    #3A3F44
  11  boredom/dullness            55    8     85     #8A8868
  12  confusion/ambiguity         50    25    300    #7A5888
  13  anger/hostility/violation   40    65    25     #A82010
  14  fear/threat                 25    20    270    #2A2848
  15  sadness/loss/damage         35    20    240    #3A4868
  16  envy/alienation/resentment  40    35    145    #285840
  17  disgust/abhorrence          35    30    100    #484818
  18  shame/disgrace              30    25    10     #602030
  19  anxiety/craving/agitation   45    45    320    #882858

## Crosswalk: NRC-EMOLEX 8 classes -> CF 20 classes

NRC anger       -> 13 (anger/hostility/violation)
NRC anticipation -> 4 (hope/aspiration), 9 (curiosity/absorption)
NRC disgust     -> 17 (disgust/abhorrence), 18 (shame/disgrace)
NRC fear        -> 14 (fear/threat), 19 (anxiety/craving/agitation)
NRC joy         -> 0 (joy/beauty/delight), 5 (energy/excitement)
NRC sadness     -> 15 (sadness/loss/damage), 16 (envy/alienation)
NRC surprise    -> 9 (curiosity/absorption), 12 (confusion/ambiguity)
NRC trust       -> 2 (calm/friendliness), 6 (care/gratitude)

Classes with no direct NRC mapping (extended by CF-EMOLEX):
  1  neutral      -- assigned to unscored or ambiguous words
  3  affection    -- love-adjacent words not in NRC joy
  7  achievement  -- pride-adjacent, not in NRC
  8  relief       -- post-negative resolution, not in NRC
  10 anonymity    -- absence/invisibility words
  11 boredom      -- low arousal negative, distinct from sadness

## Lexicon claim format

Each word lookup returns a claim:

  {
    "word":             "abandoned",
    "normalized":       "abandon",
    "emotion_id":       15,
    "emotion_name":     "sadness/loss/damage",
    "confidence":       "high",
    "lexicon_version":  "CF-EMOLEX-1.0.0",
    "lexicon_digest":   "sha256:..."
  }

confidence levels:
  high   -- word appears in NRC-EMOLEX with clear assignment
  medium -- word mapped via crosswalk or stemming
  low    -- word matched via fallback heuristic
  none   -- word not in lexicon (assigned to emotion_id 1, neutral)

## Emotion profile format

A text produces an emotion profile: a histogram over the 20 classes.

  {
    "input_text_digest":    "sha256:...",
    "lexicon_digest":       "sha256:...",
    "token_count":          42,
    "scored_count":         28,
    "profile": {
      "0": 3, "1": 8, "2": 1, "4": 2, "5": 1,
      "13": 2, "15": 7, "19": 4
    },
    "dominant_emotion_id":  15,
    "profile_digest":       "sha256:..."
  }

## Palette derivation

From an emotion profile, a palette of k colours is derived:

1. Rank emotion classes by count (descending).
2. Take top k classes.
3. For each class, start from the LCH anchor.
4. Adjust L* based on intensity: dominant emotion gets anchor L*,
   secondary emotions get L* shifted +/-5 for variety.
5. Convert LCH -> RGB -> hex.
6. Compute CF-ID for each colour.
7. Verify WCAG contrast for UI safety.

The result is a standard Colour in FARD palette with CF-IDs,
derivable from the text and the spec.

## Receipt chain

  input_text_digest
    -> emotion_profile_digest
      -> palette_digest
        -> CF-IDs

Each step is a SHA-256 commitment. The full receipt allows any party
with CF-EMOLEX-1.0.0 to verify that a given palette was deterministically
derived from a given text.

## Versioning

CF-EMOLEX-1.0.0 is the initial version. The lexicon digest, colour
anchors, and crosswalk table are all frozen at this version. Changes
to any of these require a new version (CF-EMOLEX-1.1.0 or 2.0.0).
