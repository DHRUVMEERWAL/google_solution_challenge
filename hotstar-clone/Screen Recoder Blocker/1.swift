import Foundation
import AppKit
import CoreGraphics

func detectScreenMirroring() -> Bool {
    let screens = NSScreen.screens

    for screen in screens {
        if let screenID = screen.deviceDescription[NSDeviceDescriptionKey("NSScreenNumber")] as? CGDirectDisplayID {
            if CGDisplayIsInMirrorSet(screenID) != 0 {
                print("🚨 Screen Mirroring Detected! Blocking playback.")
                return true
            }
        }
    }

    print("✅ No screen mirroring detected.")
    return false
}

// Run detection
_ = detectScreenMirroring()
