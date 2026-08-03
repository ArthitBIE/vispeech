"use client";

export type LipShape =
  "closed" | "wide" | "rounded" | "teeth" | "mid" | "default";

export function visemeToLipShape(visemeGroup: string): LipShape {
  switch (visemeGroup) {
    case "ริมฝีปากปิด":
      return "closed";
    case "ปากเปิดกว้าง":
      return "wide";
    case "ปากห่อกลม":
      return "rounded";
    case "ฟันแตะริมฝีปาก":
      return "teeth";
    case "ปากเปิดกลาง":
      return "mid";
    default:
      return "default";
  }
}

const MOUTH_CLASS: Record<LipShape, string> = {
  closed: "h-1 w-16 border-b-2 border-neutral-600",
  wide: "h-7 w-24 rounded-full bg-red-300",
  rounded: "h-10 w-10 rounded-full bg-red-300",
  teeth: "h-7 w-24 rounded-full bg-red-300",
  mid: "h-4 w-16 rounded-full bg-red-300",
  default: "h-7 w-24 rounded-full bg-red-300",
};

export function LipExample({ visemeGroup }: { visemeGroup: string }) {
  const shape = visemeToLipShape(visemeGroup);

  return (
    <div className="flex h-56 items-center justify-center rounded-sm bg-neutral-300">
      <div className="relative h-44 w-36 rounded-b-full rounded-t-sm bg-neutral-100">
        <div className="absolute left-1/2 top-10 h-4 w-10 -translate-x-1/2 rounded-b-full border-b-2 border-neutral-300" />
        <div
          className={`absolute left-1/2 top-20 -translate-x-1/2 ${MOUTH_CLASS[shape]}`}
          data-testid="lip-mouth"
          data-lip-shape={shape}
        >
          {(shape === "teeth" || shape === "default") && (
            <>
              <div className="absolute left-2 right-2 top-3 h-1 rounded-full bg-white" />
              <div className="absolute bottom-2 left-3 right-3 h-px bg-red-700" />
            </>
          )}
        </div>
        <div className="absolute bottom-8 left-1/2 h-4 w-8 -translate-x-1/2 rounded-t-full border-t border-neutral-300" />
      </div>
    </div>
  );
}
