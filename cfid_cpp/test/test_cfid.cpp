#include "cfcolor/cfid.hpp"
#include <cassert>
#include <cmath>
#include <iostream>
#include <vector>
#include <string>

int main() {
    int passed = 0, failed = 0;

    auto check = [&](const std::string& name, bool ok) {
        if (ok) { std::cout << "  ok  " << name << "\n"; passed++; }
        else    { std::cout << "  FAIL " << name << "\n"; failed++; }
    };

    // SPEC-2.0.md Appendix A.1 vectors
    std::vector<std::pair<std::string,std::string>> cases = {
        {"#000000", "CF-000000-86165F20"},
        {"#ffffff", "CF-FFFFFF-2DD4EB92"},
        {"#ff0000", "CF-FF0000-37AB74A7"},
        {"#00ff00", "CF-00FF00-9377CC77"},
        {"#0000ff", "CF-0000FF-D81673DF"},
        {"#7b3f00", "CF-7B3F00-EA262463"},
        {"#cc0000", "CF-CC0000-791976F7"},
    };
    for (auto& [hex, expected] : cases) {
        check("spec vector " + hex, cfcolor::from_hex(hex) == expected);
    }

    check("3-digit hex expands",
        cfcolor::from_hex("#f00") == cfcolor::from_hex("#ff0000"));

    check("round3 truncates toward zero (negative)",
        cfcolor::round3(-86.183) == -86.182);

    check("round3 truncates toward zero (positive)",
        cfcolor::round3(86.183) == 86.183 && cfcolor::round3(0.0001) == 0.0);

    check("from_rgb matches from_hex",
        cfcolor::from_rgb(255,0,0) == cfcolor::from_hex("#ff0000"));

    bool threw = false;
    try { cfcolor::from_hex("#zzzzzz"); } catch (const std::invalid_argument&) { threw = true; }
    check("invalid hex throws", threw);

    bool threw2 = false;
    try { cfcolor::from_hex("#ff00"); } catch (const std::invalid_argument&) { threw2 = true; }
    check("wrong-length hex throws", threw2);

    std::cout << "\n" << passed << " passed, " << failed << " failed\n";
    return failed == 0 ? 0 : 1;
}
