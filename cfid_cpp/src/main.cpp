#include "cfcolor/cfid.hpp"
#include <iostream>

int main(int argc, char** argv) {
    if (argc < 2) {
        std::cerr << "usage: cfid <hex>\n";
        return 1;
    }
    try {
        std::cout << cfcolor::from_hex(argv[1]) << "\n";
    } catch (const std::exception& e) {
        std::cerr << "error: " << e.what() << "\n";
        return 1;
    }
    return 0;
}
