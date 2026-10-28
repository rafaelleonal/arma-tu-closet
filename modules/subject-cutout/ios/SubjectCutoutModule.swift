import ExpoModulesCore
import Vision
import CoreImage
import ImageIO
import UniformTypeIdentifiers

/// Removes the background of a local photo with Apple Vision subject lifting (iOS 17+).
/// Runs only on the device; the photo never leaves it. Returns a PNG file URL inside the app's documents.
public class SubjectCutoutModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SubjectCutout")

    Function("isAvailable") { () -> Bool in
      if #available(iOS 17.0, *) { return true }
      return false
    }

    AsyncFunction("removeBackground") { (uri: String, maxSide: Double) throws -> [String: Any] in
      guard #available(iOS 17.0, *) else {
        throw Exception(name: "Unsupported", description: "Quitar fondo requiere iOS 17 o posterior.")
      }
      guard let input = URL(string: uri), input.isFileURL else {
        throw Exception(name: "InvalidUri", description: "Elige una foto guardada en este dispositivo.")
      }
      guard let image = CIImage(contentsOf: input, options: [.applyOrientationProperty: true]) else {
        throw Exception(name: "Unreadable", description: "No pudimos leer la foto.")
      }
      // Vision cannot run this request in the iOS Simulator ("Could not create inference context"); test on a device.
      let request = VNGenerateForegroundInstanceMaskRequest()
      let handler = VNImageRequestHandler(ciImage: image)
      do {
        try handler.perform([request])
      } catch {
        throw Exception(name: "Vision", description: "No pudimos quitar el fondo de esta foto.")
      }
      guard let result = request.results?.first, !result.allInstances.isEmpty else {
        throw Exception(name: "NoSubject", description: "No encontramos una prenda clara en la foto. Prueba con fondo liso y buena luz.")
      }
      let buffer: CVPixelBuffer
      do {
        buffer = try result.generateMaskedImage(ofInstances: result.allInstances, from: handler, croppedToInstancesExtent: true)
      } catch {
        throw Exception(name: "Vision", description: "No pudimos quitar el fondo de esta foto.")
      }
      var cut = CIImage(cvPixelBuffer: buffer)
      let longest = max(cut.extent.width, cut.extent.height)
      if maxSide > 0 && longest > CGFloat(maxSide) {
        let scale = CGFloat(maxSide) / longest
        cut = cut.transformed(by: CGAffineTransform(scaleX: scale, y: scale))
      }
      let context = CIContext()
      guard let cg = context.createCGImage(cut, from: cut.extent) else {
        throw Exception(name: "Encode", description: "No pudimos preparar el recorte.")
      }
      let folder = try FileManager.default.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
        .appendingPathComponent("wardrobe", isDirectory: true)
      try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
      let output = folder.appendingPathComponent("cutout-\(UUID().uuidString).png")
      guard let destination = CGImageDestinationCreateWithURL(output as CFURL, UTType.png.identifier as CFString, 1, nil) else {
        throw Exception(name: "Encode", description: "No pudimos guardar el recorte.")
      }
      CGImageDestinationAddImage(destination, cg, nil)
      guard CGImageDestinationFinalize(destination) else {
        throw Exception(name: "Encode", description: "No pudimos guardar el recorte.")
      }
      return ["uri": output.absoluteString, "width": cg.width, "height": cg.height]
    }
  }
}
