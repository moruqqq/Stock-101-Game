# Meridian — a world in motion

A playable, iPhone-first global stock market simulation. Explore a restrained 3D atlas, discover geographically scoped intelligence, trade fictional companies, and build a global portfolio. Everything runs locally; refreshing resets the session.

## Run in a browser

Requires Node.js 22.12+ (Node 24 recommended).

```sh
npm install
npm run dev
```

Open http://localhost:5173. Use a 390×844 portrait viewport for the primary experience. The desktop layout keeps the same game interactions with additional map intelligence around the globe.

Production preview:

```sh
npm run build
npm run preview
```

## Run in the iOS Simulator

The native Xcode project is already included in `ios/`. On a **Mac with Xcode 26 or later** and its command-line tools installed:

```sh
npm install
npm run build
npx cap sync ios
npx cap open ios
```

1. Allow Xcode to resolve the Capacitor Swift package dependency.
2. Select the **App** scheme and an installed iPhone Simulator (for example iPhone 16).
3. Press **Run**. Simulator builds do not require a paid Apple Developer account.
4. After web changes, run `npm run ios:sync`, then build/run again in Xcode.

Capacitor 8.5 uses Swift Package Manager here; CocoaPods is unnecessary. Native deployment target is iOS 15. The iPhone orientation is portrait, status bar is light, and native launch artwork uses the same dark Meridian identity. The WebView uses bundled assets with no external server URL or live network dependency. Simulator pinch can be performed by holding Option while dragging, or with the Simulator's trackpad gesture support.

See [Capacitor's environment requirements](https://capacitorjs.com/docs/getting-started/environment-setup) and [iOS workflow](https://capacitorjs.com/docs/ios).

**Validation boundary:** this project was built and browser-tested on Windows. Native files and `cap sync ios` were verified, but Xcode compilation, native safe-area values, WKWebView behavior, audio, and device GPU performance must still be checked on a Mac/iPhone. Browser touch tests are not an iOS Simulator certification.

## A quick playable tour

1. **World:** drag the globe, pinch or scroll to zoom, or use +/−. Tap the `Global / All markets` selector to fly to a region. Reset with the crosshair button.
2. **Discover:** amber rings mark stories. Global reports are public immediately. Regional reports unlock as you approach their region; local reports unlock near the relevant city. Discovered reports stay in News for the session. Entering an exchange also reveals its local reports.
3. **Istanbul:** tap the city, inspect its clock, index, movers, and local news, then use the arrow to enter the exchange.
4. **Trade:** open THRA and choose Buy or Sell. Set a whole-share quantity and execute. Confirmed fills immediately change cash, holdings, weighted cost, and portfolio exposure. Closed markets reject orders.
5. **Portfolio:** cash and totals are in USD. Stock quotes use their local currency. An explicitly displayed, fixed mock exchange rate converts each order into USD. View your investments on the globe.
6. **Simulation controls:** tap the sliders beside the logo, or the desktop footer controls. Choose an exchange, set local time, use 1×/10×/60×/600× speed, trigger scenarios, and optionally enable restrained sound effects. To immediately trade THRA, set Istanbul to **14:30**.

## Prototype rules

- 14 financial centers and 30 fictional companies across 10 sectors.
- Clock starts at the current real-world instant and advances at 1× by default. IANA time zones handle daylight saving. Fictional sessions run **every day, including weekends**, without holiday calendars or lunch breaks.
- Pre-market starts two hours before opening; closing begins 15 minutes before the closing bell. Countdown and active hub styling follow the same shared session calculation.
- Only open/closing exchanges simulate price changes, every three real seconds. Movement combines global, regional, sector, sentiment, event, and bounded noise terms. Time acceleration advances the session clock and event age, without creating hundreds of updates per second.
- A new local event appears every real minute. The controls also create local, regional, and global stories, economic news, energy shocks, crashes, and rallies. News impacts fade over two simulated hours; future-dated news does not move prices.
- Background tabs pause price/event work. On return, the clock catches up by elapsed time at the selected simulation speed.
- Buys and sells use current local prices and fixed USD conversion rates. No fees, fractional shares, short selling, pending orders, or real order book. Cash cannot go negative and sales cannot exceed holdings.
- Stock intraday charts include a seeded history followed by simulated ticks. Longer ranges and portfolio performance curves are clearly labeled illustrative; current valuations and returns are calculated from actual mock holdings. The world-card reference index is mock data; exchange indexes derive movement from their constituent mock stocks.
- No backend, accounts, multiplayer, real financial APIs, or persistent storage.

## Stack and layout

React 19.2, TypeScript, Vite, Tailwind CSS 4, Three.js, React Three Fiber, Drei, Framer Motion, and Capacitor. Financial content and controls are HTML/CSS; only the world and its spatial activity use WebGL.

- `src/Globe.tsx`: lightweight country atlas, borders, batched land points, hubs, seven connection arcs, camera flights, drag and pinch controls, and progressive labels.
- `src/WorldScreen.tsx`: map overlays, region selection, proximity-based news discovery.
- `src/data.ts`: fictional hubs, companies, events, time-zone/session logic.
- `src/engine.ts`: pure price and order calculations.
- `src/useGame.ts`: local clock, timers, events, account state, and optional Web Audio tones.
- `src/Screens.tsx`: exchange, company, trading, portfolio, news, and developer interfaces.
- `src/UI.tsx`: accessible sheets, SVG charts, and reusable HTML presentation.
- `src/GameApp.tsx`: navigation and screen flow.
- `ios/`: generated and configured native Xcode project.

The globe uses an 80×56 sphere, one local 2048×1024 atlas texture, batched borders/land points, 14 hub labels, seven low-segment connections, and no post-processing. DPR is capped at 1.5 and drops to 1 under sustained load. The globe unmounts on financial screens. Live price histories, story counts, and order history are bounded. All assets are local, including the geographic atlas and app artwork.

## Verification

```sh
npm test
npm run build
npx cap sync ios
```

The 20 unit tests cover exact session boundaries, daylight saving, midnight countdowns, multi-currency settlement, weighted cost, full liquidation, invalid orders, closed-market behavior, event scope/age, and bounded price histories.

With the dev server running, the browser checks run against Chrome on Windows:

```sh
npm run test:e2e
npm run test:gestures
```

On other machines, set `BROWSER_PATH` to a Chromium/Chrome executable, or install Playwright Chromium (`npx playwright install chromium`). `BASE_URL` can target a production preview instead of localhost:5173. Screenshots are written into ignored `artifacts/`.

The interaction checks cover globe selection and discovery, clock updates, chart ranges, buys and sells with exact USD cash reconciliation, quantity validation, closed-market rejection, portfolio changes, news filtering, scenario controls, and market search. Gesture checks dispatch actual single- and multi-touch browser events and verify rotation, pinch zoom, progressive information, focus-scroll stability, and narrow-screen bounds.

Remaining native acceptance checks: Xcode build/run; Dynamic Island and home-indicator insets; physical-device drag/pinch/scroll behavior; thermal/GPU smoothness; app background/foreground transitions; optional sounds on iOS.

`npm audit --omit=dev` reports no runtime vulnerabilities. The Capacitor CLI's transitive `xcode → uuid` development dependency currently reports a moderate advisory; the compatible audit fix does not resolve it. No forced dependency override was applied.

## Geography attribution

Country geometry comes from `world-atlas` (ISC, Michael Bostock), based on public-domain Natural Earth data. A local copy is included at `public/countries-110m.json`; see `public/ATTRIBUTION.txt`. All company names, news, prices, and market scenarios are fictional prototype data.
