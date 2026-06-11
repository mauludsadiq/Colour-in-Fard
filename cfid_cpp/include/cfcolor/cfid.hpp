// CF-ID: deterministic colour identity, per CF-Protocol-2.0.0
// (see SPEC-2.0.md in the main repo).
//
// Header-only C++17, zero dependencies (includes its own SHA-256
// implementation). This is the seventh independent CF-ID implementation,
// after FARD, Python, Rust, TypeScript, WASM, and Swift, and matches all
// of them exactly on every SPEC-2.0.md test vector.

#pragma once

#include <array>
#include <cmath>
#include <cstdint>
#include <cstdio>
#include <stdexcept>
#include <string>
#include <vector>

namespace cfcolor {

// ---------------------------------------------------------------------
// SHA-256 (self-contained, no dependencies)
// ---------------------------------------------------------------------
namespace detail {

inline uint32_t rotr(uint32_t x, int n) {
    return (x >> n) | (x << (32 - n));
}

inline std::string sha256_hex(const std::string& input) {
    static const uint32_t K[64] = {
        0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
        0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
        0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
        0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
        0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
        0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
        0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
        0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
    };

    uint32_t h[8] = {
        0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,
        0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19
    };

    std::vector<uint8_t> msg(input.begin(), input.end());
    uint64_t bit_len = static_cast<uint64_t>(msg.size()) * 8;
    msg.push_back(0x80);
    while (msg.size() % 64 != 56) msg.push_back(0);
    for (int i = 7; i >= 0; --i) msg.push_back(static_cast<uint8_t>(bit_len >> (i * 8)));

    for (size_t chunk = 0; chunk < msg.size(); chunk += 64) {
        uint32_t w[64];
        for (int i = 0; i < 16; ++i) {
            w[i] = (uint32_t(msg[chunk + i*4]) << 24) |
                   (uint32_t(msg[chunk + i*4+1]) << 16) |
                   (uint32_t(msg[chunk + i*4+2]) << 8) |
                   (uint32_t(msg[chunk + i*4+3]));
        }
        for (int i = 16; i < 64; ++i) {
            uint32_t s0 = rotr(w[i-15],7) ^ rotr(w[i-15],18) ^ (w[i-15] >> 3);
            uint32_t s1 = rotr(w[i-2],17) ^ rotr(w[i-2],19) ^ (w[i-2] >> 10);
            w[i] = w[i-16] + s0 + w[i-7] + s1;
        }

        uint32_t a=h[0],b=h[1],c=h[2],d=h[3],e=h[4],f=h[5],g=h[6],hh=h[7];

        for (int i = 0; i < 64; ++i) {
            uint32_t s1 = rotr(e,6) ^ rotr(e,11) ^ rotr(e,25);
            uint32_t ch = (e & f) ^ ((~e) & g);
            uint32_t temp1 = hh + s1 + ch + K[i] + w[i];
            uint32_t s0 = rotr(a,2) ^ rotr(a,13) ^ rotr(a,22);
            uint32_t maj = (a & b) ^ (a & c) ^ (b & c);
            uint32_t temp2 = s0 + maj;

            hh = g; g = f; f = e; e = d + temp1;
            d = c; c = b; b = a; a = temp1 + temp2;
        }

        h[0]+=a; h[1]+=b; h[2]+=c; h[3]+=d; h[4]+=e; h[5]+=f; h[6]+=g; h[7]+=hh;
    }

    char buf[65];
    for (int i = 0; i < 8; ++i) std::snprintf(buf + i*8, 9, "%08x", h[i]);
    return std::string(buf, 64);
}

} // namespace detail

// ---------------------------------------------------------------------
// CF-ID
// ---------------------------------------------------------------------

struct Lab {
    double l, a, b;
};

inline double srgb_to_linear(double c) {
    c /= 255.0;
    return c <= 0.04045 ? c / 12.92 : std::pow((c + 0.055) / 1.055, 2.4);
}

inline Lab rgb_to_lab(int r, int g, int b) {
    double r1 = srgb_to_linear(r);
    double g1 = srgb_to_linear(g);
    double b1 = srgb_to_linear(b);

    double x = (r1 * 0.4124564 + g1 * 0.3575761 + b1 * 0.1804375) * 100.0 / 95.047;
    double y = (r1 * 0.2126729 + g1 * 0.7151522 + b1 * 0.0721750) * 100.0 / 100.0;
    double z = (r1 * 0.0193339 + g1 * 0.1191920 + b1 * 0.9503041) * 100.0 / 108.883;

    auto f = [](double v) {
        return v > 0.008856 ? std::pow(v, 1.0/3.0) : 7.787 * v + 16.0/116.0;
    };

    double l = 116.0 * f(y) - 16.0;
    double a = 500.0 * (f(x) - f(y));
    double bb = 200.0 * (f(y) - f(z));

    return Lab{l, a, bb};
}

// FARD's round3: truncation toward zero, NOT round-half-up.
// round3(-86.183) == -86.182
inline double round3(double x) {
    double scaled = x * 1000.0 + 0.5;
    double truncated = scaled >= 0.0 ? std::floor(scaled) : std::ceil(scaled);
    return truncated / 1000.0;
}

namespace detail {

inline std::string json_number(double v) {
    double r = round3(v);
    if (r == std::trunc(r)) {
        char buf[32];
        std::snprintf(buf, sizeof(buf), "%lld", static_cast<long long>(r));
        return std::string(buf);
    }
    char buf[32];
    std::snprintf(buf, sizeof(buf), "%.3f", r);
    std::string s(buf);
    while (!s.empty() && s.back() == '0') s.pop_back();
    if (!s.empty() && s.back() == '.') s.pop_back();
    return s;
}

} // namespace detail

// CF-ID for an RGB triple (0-255 each).
inline std::string from_rgb(int r, int g, int b) {
    Lab lab = rgb_to_lab(r, g, b);

    std::string a_s = detail::json_number(lab.a);
    std::string b_s = detail::json_number(lab.b);
    std::string l_s = detail::json_number(lab.l);

    // Canonical JSON: alphabetical keys, no whitespace
    std::string preimage = "{\"a\":" + a_s + ",\"b\":" + b_s + ",\"l\":" + l_s + "}";

    std::string hexdigest = detail::sha256_hex(preimage);
    std::string labhash8 = hexdigest.substr(0, 8);
    for (auto& c : labhash8) c = static_cast<char>(std::toupper(static_cast<unsigned char>(c)));

    char hex6[7];
    std::snprintf(hex6, sizeof(hex6), "%02X%02X%02X", r, g, b);

    return std::string("CF-") + hex6 + "-" + labhash8;
}

inline int hex_digit_val(char c) {
    if (c >= '0' && c <= '9') return c - '0';
    if (c >= 'a' && c <= 'f') return c - 'a' + 10;
    if (c >= 'A' && c <= 'F') return c - 'A' + 10;
    throw std::invalid_argument("invalid hex digit");
}

// Parse #rgb or #rrggbb (with or without leading '#') and return its CF-ID.
// Throws std::invalid_argument on malformed input.
inline std::string from_hex(const std::string& hex) {
    std::string h = hex;
    if (!h.empty() && h[0] == '#') h = h.substr(1);

    if (h.size() == 3) {
        std::string expanded;
        for (char c : h) { expanded += c; expanded += c; }
        h = expanded;
    }

    if (h.size() != 6) {
        throw std::invalid_argument("invalid hex colour: " + hex);
    }

    int r, g, b;
    try {
        r = hex_digit_val(h[0]) * 16 + hex_digit_val(h[1]);
        g = hex_digit_val(h[2]) * 16 + hex_digit_val(h[3]);
        b = hex_digit_val(h[4]) * 16 + hex_digit_val(h[5]);
    } catch (const std::invalid_argument&) {
        throw std::invalid_argument("invalid hex colour: " + hex);
    }

    return from_rgb(r, g, b);
}

} // namespace cfcolor
