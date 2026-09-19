import { describe, expect, it } from "vitest";
import {
  atGlobeZoomLimit,
  GlobeZoomEntry,
  GLOBE_MIN_DISTANCE,
} from "./globeZoom";

describe("Separate zoom gesture to enter a city", () => {
  const limit = GLOBE_MIN_DISTANCE;

  it("stays on Earth throughout the pinch that first reaches the limit", () => {
    const gate = new GlobeZoomEntry();
    gate.beginPinch(90, 6.6);
    expect(gate.pinch(180, 3.2)).toBe(false);
    expect(gate.pinch(240, limit)).toBe(false);
    expect(gate.pinch(310, limit)).toBe(false);
    gate.endPinch();
    gate.beginPinch(90, limit);
    expect(gate.pinch(96, limit)).toBe(false);
    expect(gate.pinch(110, limit)).toBe(true);
    expect(gate.pinch(150, limit)).toBe(false);
  });

  it("ignores rotation jitter, outward pinches and their reversal", () => {
    const gate = new GlobeZoomEntry();
    gate.beginPinch(120, limit);
    expect(gate.pinch(124, limit)).toBe(false);
    expect(gate.pinch(100, limit)).toBe(false);
    expect(gate.pinch(145, limit)).toBe(false);
    gate.endPinch();
    gate.beginPinch(120, limit);
    expect(gate.pinch(145, limit)).toBe(true);
  });

  it("waits for a new scroll burst after reaching the stop, including momentum", () => {
    const gate = new GlobeZoomEntry();
    expect(gate.wheel(-90, 3, 0)).toBe(false);
    for (let t = 60; t <= 600; t += 60)
      expect(gate.wheel(-90, limit, t)).toBe(false);
    expect(gate.wheel(-12, limit, 1000)).toBe(false);
    expect(gate.wheel(-14, limit, 1040)).toBe(true);
    expect(gate.wheel(-90, limit, 1080)).toBe(false);
  });

  it("never enters on zoom out, before maximum zoom, or after cancelling a gesture", () => {
    const gate = new GlobeZoomEntry();
    expect(gate.wheel(90, limit, 0)).toBe(false);
    expect(gate.wheel(-90, limit, 30)).toBe(false);
    gate.beginPinch(80, limit);
    gate.reset();
    expect(gate.pinch(120, limit)).toBe(false);
    expect(atGlobeZoomLimit(2.82)).toBe(false);
    expect(atGlobeZoomLimit(limit + 0.004)).toBe(true);
  });
});
