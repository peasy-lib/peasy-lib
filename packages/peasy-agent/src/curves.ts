export class Curves {

  public static linear(value: number, slope: number, xShift = 0, yShift = 0) {
    return this.sanitize((slope * (value - xShift)) + yShift);
  }

  public static polynomial(value: number, slope: number, exponent: number, xShift = 0, yShift = 0) {
    return this.sanitize((slope * Math.pow(value - xShift, exponent)) + yShift);
  }
  public static logistic(value: number, slope: number, exponent: number, xShift = 0, yShift = 0) {
    return this.sanitize((slope / (1 + Math.exp(-10.0 * exponent * (value - 0.5 - xShift)))) + yShift);
  }
  public static logit(value: number, slope: number, xShift = 0, yShift = 0) {
    return this.sanitize(slope * Math.log((value - xShift) / (1.0 - (value - xShift))) / 5.0 + 0.5 + yShift);
  }
  public static sine(value: number, slope: number, xShift = 0, yShift = 0) {
    return this.sanitize(0.5 * slope * Math.sin(2.0 * Math.PI * (value - xShift)) + 0.5 + yShift);
  }
  public static normal(value: number, slope: number, exponent: number, xShift = 0, yShift = 0) {
    return this.sanitize(slope * Math.exp(-30.0 * exponent * (value - xShift - 0.5) * (value - xShift - 0.5)) + yShift);
  }

  public static clamp(value: number, min = 0, max = 1): number {
    return value < min ? min : (value > max ? max : value);
  }

  public static sanitize(value: number): number {
    if (Number.isNaN(value) || value === Infinity) {
      return 0;
    }
    return this.clamp(value);
  }
}
