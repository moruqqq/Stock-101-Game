import type { CapacitorConfig } from "@capacitor/cli";
const config: CapacitorConfig = {
  appId: "com.meridian.marketworld",
  appName: "Meridian",
  webDir: "dist",
  backgroundColor: "#0b1014",
  ios: {
    contentInset: "never",
    backgroundColor: "#0b1014",
    preferredContentMode: "mobile",
    scrollEnabled: false,
  },
};
export default config;
