import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Native Izuki Companion shell.
 *
 * The website remains the shared, offline-capable experience. Capacitor wraps
 * the same reviewed files for Android and iOS, then adds only device features
 * that native platforms can honestly provide (notifications, microphone
 * permission, and — only when the user enables it — Android Accessibility
 * control for explicit taps, typing, scrolling and short visible routines).
 * iOS still has no equivalent app-wide control, and nothing here pretends
 * otherwise.
 */
const config: CapacitorConfig = {
  appId: "com.novaizuki.mobile",
  appName: "Izuki Companion",
  webDir: "docs/app",
  bundledWebRuntime: false,
  server: {
    androidScheme: "https",
    iosScheme: "https",
  },
};

export default config;
