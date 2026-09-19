import type { CapacitorConfig } from "@capacitor/cli";
const config: CapacitorConfig = {
  appId: "com.meridian.marketworld",
  appName: "Meridian",
  webDir: "dist",
  backgroundColor: "#f5f2e9",
  ios: {
    contentInset: "never",
    backgroundColor: "#f5f2e9",
    preferredContentMode: "mobile",
    scrollEnabled: false,
  },
};
export default config;
