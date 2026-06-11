// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "CFColor",
    platforms: [.macOS(.v10_15)],
    products: [
        .library(name: "CFColor", targets: ["CFColor"]),
        .executable(name: "cfid", targets: ["cfid"]),
    ],
    targets: [
        .target(name: "CFColor"),
        .executableTarget(name: "cfid", dependencies: ["CFColor"]),
        .testTarget(name: "CFColorTests", dependencies: ["CFColor"]),
    ]
)
