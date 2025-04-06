import Foundation
import CoreAudio
import CoreGraphics
import AppKit

// MARK: - AirPlay Audio Check

func isAirPlayAudioActive() -> Bool {
    var propertySize = UInt32(MemoryLayout<AudioDeviceID>.size * 32)
    var deviceIDs = [AudioDeviceID](repeating: 0, count: 32)
    var address = AudioObjectPropertyAddress(
        mSelector: kAudioHardwarePropertyDevices,
        mScope: kAudioObjectPropertyScopeGlobal,
        mElement: kAudioObjectPropertyElementMain // ✅ updated for macOS 12+
    )

    let status = AudioObjectGetPropertyData(
        AudioObjectID(kAudioObjectSystemObject),
        &address,
        0,
        nil,
        &propertySize,
        &deviceIDs
    )

    guard status == noErr else { return false }

    for deviceID in deviceIDs {
        var name: CFString = "" as CFString
        var nameSize = UInt32(MemoryLayout<CFString>.size)
        var nameAddress = AudioObjectPropertyAddress(
            mSelector: kAudioDevicePropertyDeviceNameCFString,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMain
        )

        let nameStatus = AudioObjectGetPropertyData(
            deviceID,
            &nameAddress,
            0,
            nil,
            &nameSize,
            &name
        )

        if nameStatus == noErr {
            print("🔈 Audio Output Device: \(name)")
            if "\(name)".lowercased().contains("airplay") {
                return true
            }
        }
    }

    return false
}

// MARK: - Virtual or Mirrored Display Check

func hasMirroredOrVirtualDisplays() -> Bool {
    let screens = NSScreen.screens
    print("🖥️ Detected \(screens.count) screen(s).")
    var externalFound = false

    for (index, screen) in screens.enumerated() {
        let screenDesc = screen.deviceDescription
        guard let screenID = (screenDesc[NSDeviceDescriptionKey("NSScreenNumber")] as? NSNumber)?.uint32Value else {
            continue
        }

        let isMain = screen == NSScreen.main
        let bounds = screen.frame

        let isBuiltIn = CGDisplayIsBuiltin(screenID) != 0

        print("🔎 Screen \(index):")
        print("   - ID: \(screenID)")
        print("   - Built-in: \(isBuiltIn)")
        print("   - Main: \(isMain)")
        print("   - Bounds: \(bounds)")

        if !isBuiltIn {
            externalFound = true
        }
    }

    if externalFound {
        print("🚨 Virtual or external display detected!")
        return true
    } else {
        print("✅ Only built-in display(s) detected.")
        return false
    }
}

// MARK: - Run Detection

func checkMirroringOrAirPlay() -> Bool {
    let airPlayAudio = isAirPlayAudioActive()
    let mirroredOrVirtualDisplay = hasMirroredOrVirtualDisplays()

    print("📊 Summary: AirPlay Audio = \(airPlayAudio), Virtual Display = \(mirroredOrVirtualDisplay), Screens = \(NSScreen.screens.count)")

    if airPlayAudio || mirroredOrVirtualDisplay {
        print("🔒 Block playback!")
        return true
    } else {
        print("✅ No screen mirroring or AirPlay detected.")
        return false
    }
}

_ = checkMirroringOrAirPlay()





// import Foundation
// import AppKit
// import CoreGraphics
// import NIO
// import NIOHTTP1

// func detectScreenMirroring() -> Bool {
//     let screens = NSScreen.screens

//     for screen in screens {
//         if let screenID = screen.deviceDescription[NSDeviceDescriptionKey("NSScreenNumber")] as? CGDirectDisplayID {
//             if CGDisplayIsInMirrorSet(screenID) != 0 {
//                 print("🚨 Screen Mirroring Detected! Blocking playback.")
//                 return true
//             }
//         }
//     }

//     print("✅ No screen mirroring detected.")
//     return false
// }

// final class HTTPHandler: ChannelInboundHandler {
//     typealias InboundIn = HTTPServerRequestPart
//     typealias OutboundOut = HTTPServerResponsePart

//     private var buffer: ByteBuffer?

//     func channelRead(context: ChannelHandlerContext, data: NIOAny) {
//         let reqPart = self.unwrapInboundIn(data)

//         switch reqPart {
//         case .head(let request):
//             print("↘️ Received request: \(request.uri)")
//             let isMirroring = detectScreenMirroring()
//             let responseString = isMirroring
//                 ? "{ \"mirroring\": true }"
//                 : "{ \"mirroring\": false }"

//             var buffer = context.channel.allocator.buffer(capacity: responseString.utf8.count)
//             buffer.writeString(responseString)
//             self.buffer = buffer

//         case .body:
//             break

//         case .end:
//             if let buffer = self.buffer {
//                 var headers = HTTPHeaders()
//                 headers.add(name: "Content-Type", value: "application/json")
//                 headers.add(name: "Content-Length", value: "\(buffer.readableBytes)")

//                 let responseHead = HTTPResponseHead(version: .init(major: 1, minor: 1), status: .ok, headers: headers)
//                 context.write(self.wrapOutboundOut(.head(responseHead)), promise: nil)
//                 context.write(self.wrapOutboundOut(.body(.byteBuffer(buffer))), promise: nil)
//                 context.writeAndFlush(self.wrapOutboundOut(.end(nil)), promise: nil)
//             }
//         }
//     }
// }

// // MARK: - Server Bootstrap

// let group = MultiThreadedEventLoopGroup(numberOfThreads: 1)

// defer {
//     try? group.syncShutdownGracefully()
// }

// let bootstrap = ServerBootstrap(group: group)
//     .serverChannelOption(ChannelOptions.backlog, value: 256)
//     .serverChannelOption(ChannelOptions.socketOption(.so_reuseaddr), value: 1)
//     .childChannelInitializer { channel in
//         channel.pipeline.configureHTTPServerPipeline().flatMap {
//             channel.pipeline.addHandler(HTTPHandler())
//         }
//     }
//     .childChannelOption(ChannelOptions.socketOption(.so_reuseaddr), value: 1)
//     .childChannelOption(ChannelOptions.maxMessagesPerRead, value: 16)
//     .childChannelOption(ChannelOptions.recvAllocator, value: AdaptiveRecvByteBufferAllocator())

// do {
//     let channel = try bootstrap.bind(host: "0.0.0.0", port: 8080).wait()
//     print("🌐 Server running on http://localhost:8080")
//     try channel.closeFuture.wait()
// } catch {
//     print("❌ Server failed to start: \(error)")
// }
