// swift-tools-version:5.5

import PackageDescription

let package = Package(
    name: "ScreenMirrorServer",
    platforms: [
        .macOS(.v12)
    ],
    dependencies: [
        .package(url: "https://github.com/apple/swift-nio.git", from: "2.32.0")
    ],
    targets: [
        .executableTarget(
            name: "ScreenMirrorServer",
            dependencies: [
                .product(name: "NIO", package: "swift-nio"),
                .product(name: "NIOHTTP1", package: "swift-nio")
            ]
        )
    ]
)
