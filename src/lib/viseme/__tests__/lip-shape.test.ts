import { describe, it, expect } from "vitest";
import { visemeToLipShape } from "@/components/practice/LipExample";

describe("visemeToLipShape", () => {
  it("maps closed lips", () => {
    expect(visemeToLipShape("ริมฝีปากปิด")).toBe("closed");
  });

  it("maps wide open mouth", () => {
    expect(visemeToLipShape("ปากเปิดกว้าง")).toBe("wide");
  });

  it("maps rounded mouth", () => {
    expect(visemeToLipShape("ปากห่อกลม")).toBe("rounded");
  });

  it("maps teeth touching lip", () => {
    expect(visemeToLipShape("ฟันแตะริมฝีปาก")).toBe("teeth");
  });

  it("maps mid-open mouth", () => {
    expect(visemeToLipShape("ปากเปิดกลาง")).toBe("mid");
  });

  it("falls back to default for unknown groups", () => {
    expect(visemeToLipShape("something else")).toBe("default");
    expect(visemeToLipShape("")).toBe("default");
  });
});
