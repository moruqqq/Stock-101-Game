# Meridian — a world in motion

An iPhone-first global market simulation with an illustrated Earth, recognisable living cities, fictional news and a local trading economy. The news is deliberately disconnected from reality; its reporting style is matter-of-fact. Everything runs locally. Refreshing resets the game; the selected appearance persists.

## Browser

Requires Node.js 22.12+ (Node 24 recommended).

```sh
npm install
npm run dev
```

Open http://localhost:5173, ideally at 390×844 portrait. Production preview:

```sh
npm run build
npm run preview
```

## iOS Simulator

The Xcode project is included in `ios/`. On a Mac with Xcode 26+:

```sh
npm install
npm run build
npx cap sync ios
npx cap open ios
```

Resolve the Capacitor Swift packages, select the **App** scheme and an installed iPhone Simulator, then Run. After changes, run `npm run ios:sync` and rebuild. This uses Swift Package Manager, iOS 15 minimum, portrait iPhone orientation, bundled assets/fonts, and no remote server.

Status-bar text follows the selected theme through `@capacitor/status-bar`. Light is the default; Mid and Dark are available from the palette icon.

**Native validation boundary:** development and browser checks were performed on Windows. Build and Capacitor sync can be verified here. Actual Xcode compilation, WKWebView behaviour, device GPU performance, Dynamic Island/home-indicator insets, audio and lifecycle transitions still require a Mac/iPhone.

## World → city → streets

- Drag the globe, then pinch/scroll toward a financial centre. The globe stops at maximum zoom. Release and pinch again, start a new scroll burst, or press + once more to enter the city. Continuing the same gesture stays on Earth. City shortcuts, region selection and the complete 15-city directory provide alternate routes.
- Cities occupy a continuous curved Earth surface with a horizon, terrain, waterways, streets and neighbouring landscape. There are no floating city platforms.
- Keep pinching inside the city to reach street level. Drag to orbit; use two fingers to zoom/pan. Zoom sufficiently far out to return to Earth. The overview control resets the camera.
- Each city has three named districts and one or more recognisable landmarks. Select districts or landmark pins to travel locally. Tap building meshes to inspect companies; enter the exchange to trade.
- Traffic, buses, pedestrians, ferries and building lights add activity. City report buttons open the local dispatch list. Details can be collapsed to expose more of the map.

| City      | Geographic / architectural identity                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------- |
| Istanbul  | Bosphorus, two shores, historic peninsula, Galata Tower, mosque domes, suspension bridge, ferries, terracotta roofs |
| London    | Thames, Westminster, London Eye, Tower Bridge, brick streets, red double-deckers                                    |
| Paris     | Seine, limestone blocks, slate roofs, Eiffel Tower, Arc de Triomphe                                                 |
| Tokyo     | Dense rail-oriented districts, bay, Tokyo Tower, Asakusa temple                                                     |
| New York  | Manhattan-like island, street grid, central parkland, stepped towers, Liberty harbour, yellow taxis                 |
| Nairobi   | Highland terrain, river corridor, acacia-like canopy, civic tower                                                   |
| Frankfurt | Main river, pitched old-town roofs, cathedral and banking skyline                                                   |
| Hong Kong | Broad harbour, dense tall buildings, hills and Central skyline                                                      |
| Shanghai  | Huangpu, Bund/Pudong contrast, Oriental Pearl silhouette                                                            |
| Singapore | Marina Bay towers, tropical canopy, garden structures and port                                                      |
| Dubai     | Desert/coast palette, stepped spire, sail-shaped waterfront landmark                                                |
| Sydney    | Harbour, shell-like opera roofs, bridge and ferries                                                                 |
| Toronto   | Lake Ontario shore, observation tower and streetcars                                                                |
| Mumbai    | Dense peninsula streets, gateway waterfront and monsoon atmosphere                                                  |
| São Paulo | Inland ridges, Paulista corridor, suspended museum, parkland and twin spires                                        |

These are compact geographic interpretations, not surveyed street maps. Population/weather labels and all market data are prototype context.

## News and connected events

**101 authored scenarios**, with at least six tied to every city. The opening edition contains 98 reports; three follow-up reports are reserved for a developing story. Reports cover politics, regulation, commodities, energy transitions, technology, transport, climate and urban change. Search by subject/place and filter by region or global scope. Feeds render 12 items at a time, with Load more for the archive.

The initial coffee discovery in Brazil develops into German engine certification, Japan's coffee-fuel transport transition, and export rationing in Brazil. New dispatches arrive every 45 real seconds; causal follow-ups take priority and do not publish ahead of their parent. Developer controls include **COFFEE TRANSITION** and **NEXT DISPATCH** for immediate exploration.

Other reports include overnight African lakes, citizenship for buildings, computer-readable desert sand, grain that grows bread, borders responding to weather, a Gulf freedom charter, and European disputes over closed economic zones. Headlines and explanations use a news register. A simulation notice distinguishes the fictional coverage from real news.

Each report contains geographical scope, timestamp, sector effects, a reconstruction scene and captions. Twelve base scene families cover reports using live 3D models rather than downloaded video. Pause and replay work; clips stop when covered, offscreen or in a background tab. A developing-story panel shows the reports published so far.

Global reports are visible immediately. Regional reports unlock near the region; local reports unlock inside the city. Discoveries remain available for the session.

## Economy and prototype limits

- 15 exchanges, 32 fictional companies, 10 sectors. Quotes use local currencies; portfolio totals/cash and settlement use USD at fixed displayed mock rates.
- Local exchange sessions use IANA zones, including daylight saving. The prototype runs sessions every day, including weekends. Pre-market starts two hours before opening; closing starts 15 minutes before close.
- Only open/closing markets update prices, every three real seconds. Global/regional/sector trends, sentiment, scoped event effects and bounded noise drive the tick.
- UI sector directions and price effects use the same data. Events fade after two simulated hours. Archived reports remain readable but no longer move prices. Combined news pressure is capped so a large archive cannot create runaway ticks.
- Developer controls support local time, 1×/10×/60×/600× speed, market transitions, named scenarios, local/regional/global events and optional sounds.
- Whole-share buys/sells update cash, cost basis and holdings immediately. Closed markets, insufficient cash and overselling reject orders. No short selling, fees, real order book, backend, accounts, multiplayer or real financial API.
- Intraday charts mix seeded history and actual simulated ticks. Longer time ranges and portfolio performance curves are labeled illustrative. Current valuations use the live mock account.

## Themes and rendering

Light preserves the illustrated cream/teal palette. Mid uses slate surfaces and dusk lighting. Dark uses deep blue surfaces, darker terrain and illuminated windows. The palette button affects world, cities, news, finance screens, dialogs and iOS status text. Only the theme persists in local storage.

React/HTML/CSS/SVG render the readable interface. Three.js / React Three Fiber / Drei render the planet, cities and report scenes. Framer Motion handles interface transitions; Vite, TypeScript, Tailwind CSS and Capacitor complete the stack.

City building bodies/windows/roofs, trees, 32 vehicles, 48 pedestrians and four boats use instancing. City footprints are bounded, DPR is capped and drops under load, and there is no post-processing. World/city rendering unmounts on financial screens. Report, tick-history and order arrays are bounded.

## Files

- `src/PlayfulWorld.tsx`, `src/Globe.tsx`, `src/WorldDecor.tsx`: world, regional discovery, zoom-based city entry, directory.
- `src/cityProfiles.ts`, `src/CityWorld.tsx`, `src/CityEnvironment.tsx`, `src/CityLandmarks.tsx`: city identities, terrain, districts, life, landmarks and street zoom.
- `src/scenarios.ts`, `src/newswire.ts`: 101 reports and causal scheduling.
- `src/PlayfulNews.tsx`, `src/NewsReel.tsx`, `src/ReportModels.tsx`, `src/ReportThumbnail.tsx`: newsroom, reconstructions and archive.
- `src/Theme.tsx`, `src/themes.css`, `src/expansion.css`: appearance, palette tokens and expanded UI.
- `src/data.ts`, `src/engine.ts`, `src/useGame.ts`: sessions, trading, clock, price and event engines.
- `src/Screens.tsx`, `src/UI.tsx`, `src/GameApp.tsx`: finance and navigation.

## Verification

```sh
npm test
npm run build
npx cap sync ios
# With a dev/preview server running:
npm run test:e2e
npm run test:gestures
npm run test:world
```

47 unit tests cover sessions, DST, settlement, validation, event scope, price bounds, story coverage, causal sequencing, cross-border sector effects and city geography. Browser tests cover exact buy/sell cash reconciliation, blocked orders, search, discovery, themes, persistence, district navigation, report animation, chained dispatches and actual multi-touch globe/city/street transitions.

Browser scripts use Chrome on Windows by default. Set `BROWSER_PATH` elsewhere or install Playwright Chromium. Set `BASE_URL=http://localhost:4173` to use the production preview. Screenshots go to ignored `artifacts/`.

## Attribution

Country geometry: `world-atlas` (ISC, Michael Bostock), based on public-domain Natural Earth data. See `public/ATTRIBUTION.txt`. Fredoka and DM Sans are bundled through Fontsource under the SIL Open Font License. City models and report illustrations are generated in code. Companies, news, prices and economic effects are fictional.

### Street life and reports on location

Cities now have a bounded crowd of up to 144 animated residents: walkers, park joggers and small conversations. Each report also draws a small audience from that same population: people approach a safe viewing spot, turn toward the event, watch or film it, then leave and return at staggered intervals. Water events are watched from shore. Audience placement is independent of camera selection, uses the existing three resident draw calls and keeps regular walkers and conversations in the city. The people button frames a gathering. Published local reports have selectable geographic markers; approaching them reveals the same animated reconstruction used in the news story. **Explore [city]** in a story flies to that exact report, and **Show on streets** in the city dispatch list does the same. The cat governance report also adds roaming and rooftop cats throughout its city. Up to three event reconstructions share the city Canvas at once.

Pinch inward or use minus to pull back from a city; continuing beyond the city overview returns to Earth automatically. Light / Mid / Dark change interface colors; the city terrain, lighting and resident colors stay consistent. Window lights follow local simulation time.

Run `npm run test:zoom-entry` and `npm run test:gestures` for the two-stage globe entry using buttons, wheel and real multitouch.

Run `npm run test:city-life` against the preview server for the report-to-city, theme, street-life and zoom-out checks.

### Turkish / English

Use **TR / EN** in the header or in an open dialog to switch instantly without resetting the simulation, camera, portfolio or order quantity. The preference is stored locally; first launch follows the device language (Turkish for a Turkish device, English otherwise). Menus, financial UI, all 101 report scenarios, captions and all 15 city guides have Turkish text. News and market searches accept either language. Number formatting follows the selected language; currency units remain unchanged. Run `npm run test:locale` against the preview server for the full mobile language and trading flow.
