export const GLOBE_MIN_DISTANCE = 2.65;
export const atGlobeZoomLimit = (distance: number) =>
  distance <= GLOBE_MIN_DISTANCE + 0.012;

// Reaching the stop never counts as entering. A separate gesture must START
// at the stop, so a held pinch or trackpad momentum cannot carry into a city.
export class GlobeZoomEntry {
  private pinchStart = 0;
  private pinchReady = false;
  private wheelTime = -Infinity;
  private wheelReady = false;
  private wheelTravel = 0;

  beginPinch(spread: number, distance: number) {
    this.pinchStart = spread;
    this.pinchReady = atGlobeZoomLimit(distance);
  }

  pinch(spread: number, distance: number) {
    if (spread < this.pinchStart - 8 || !atGlobeZoomLimit(distance))
      this.pinchReady = false;
    const enter =
      this.pinchReady &&
      spread - this.pinchStart > Math.max(12, this.pinchStart * 0.08);
    if (enter) this.pinchReady = false;
    return enter;
  }

  endPinch() {
    this.pinchReady = false;
  }

  wheel(delta: number, distance: number, time: number) {
    // OrbitControls emits start/end for every wheel event, including momentum;
    // group the whole scroll burst instead of treating those as new gestures.
    if (time - this.wheelTime > 320) {
      this.wheelReady = atGlobeZoomLimit(distance);
      this.wheelTravel = 0;
    }
    this.wheelTime = time;
    if (delta > 0 || !atGlobeZoomLimit(distance)) this.wheelReady = false;
    this.wheelTravel += Math.max(0, -delta);
    const enter = this.wheelReady && this.wheelTravel >= 24;
    if (enter) this.wheelReady = false;
    return enter;
  }

  reset() {
    this.endPinch();
    this.wheelReady = false;
    this.wheelTime = -Infinity;
    this.wheelTravel = 0;
  }
}
