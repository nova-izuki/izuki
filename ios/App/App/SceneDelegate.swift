import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = IzukiBridgeViewController()
        window?.makeKeyAndVisible()
        connectionOptions.urlContexts.forEach { IzukiLaunch.capture($0.url) }

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        URLContexts.forEach { IzukiLaunch.capture($0.url) }
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
        (window?.rootViewController as? CAPBridgeViewController)?.bridge?.webView?.evaluateJavaScript("window.dispatchEvent(new Event('izuki-launch'))", completionHandler: nil)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}

// A Shortcut can open izuki://ask?q=<URL-encoded dictated text>. Keep it as
// a draft, never a device action. No accounts or tokens are accepted in URLs.
enum IzukiLaunch {
    static var pending = ""
    static func capture(_ url: URL) {
        guard url.scheme?.lowercased() == "izuki", url.host == "ask",
              let parts = URLComponents(url: url, resolvingAgainstBaseURL: false),
              let question = parts.queryItems?.first(where: { $0.name == "q" })?.value else { return }
        pending = String(question.prefix(4000))
    }
}

class IzukiBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(IzukiDevicePlugin())
    }
}

@objc(IzukiDevicePlugin)
public class IzukiDevicePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "IzukiDevicePlugin"
    public let jsName = "IzukiDevice"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "haptic", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "takeLaunchPrompt", returnType: CAPPluginReturnPromise)
    ]
    @objc func haptic(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            UISelectionFeedbackGenerator().selectionChanged()
            call.resolve(["done": true])
        }
    }
    @objc func takeLaunchPrompt(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let prompt = IzukiLaunch.pending
            IzukiLaunch.pending = ""
            call.resolve(["prompt": prompt])
        }
    }
}
