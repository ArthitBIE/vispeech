export interface LessonItem {
  text: string;
  phonetic?: string;
  visemeGroup?: string;
  difficulty: number;
}

export interface Lesson {
  id: string; // "easy" | "vowels" | "conversation"
  name: string; // Thai display name
  typeLabel: string; // "คำศัพท์" | "เสียง" | "บทสนทนา"
  items: LessonItem[];
}

export const LESSONS: Lesson[] = [
  {
    id: "easy",
    name: "คำศัพท์ง่าย",
    typeLabel: "คำศัพท์",
    items: [
      {
        text: "ยา",
        phonetic: "/ja:/",
        visemeGroup: "ปากเปิดกลาง",
        difficulty: 1,
      },
      {
        text: "ฝา",
        phonetic: "/fa:/",
        visemeGroup: "ฟันแตะริมฝีปาก",
        difficulty: 1,
      },
      { text: "ดี", phonetic: "/dee:/", visemeGroup: "ทักทาย", difficulty: 1 },
      { text: "มี", phonetic: "/me:/", visemeGroup: "ทักทาย", difficulty: 1 },
      {
        text: "ดู",
        phonetic: "/du:/",
        visemeGroup: "ปากห่อกลม",
        difficulty: 1,
      },
    ],
  },
  {
    id: "vowels",
    name: "เสียงสระ",
    typeLabel: "เสียง",
    items: [
      // Single vowels (สระเดี่ยว) — 18
      {
        text: "อะ",
        phonetic: "/a/",
        visemeGroup: "ปากเปิดกลาง",
        difficulty: 1,
      },
      {
        text: "อา",
        phonetic: "/a:/",
        visemeGroup: "ปากเปิดกว้าง",
        difficulty: 1,
      },
      {
        text: "อิ",
        phonetic: "/i/",
        visemeGroup: "ปากเปิดกลาง",
        difficulty: 1,
      },
      {
        text: "อี",
        phonetic: "/i:/",
        visemeGroup: "ปากเปิดกลาง",
        difficulty: 1,
      },
      {
        text: "อึ",
        phonetic: "/ɯ/",
        visemeGroup: "ปากเปิดกลาง",
        difficulty: 1,
      },
      {
        text: "อือ",
        phonetic: "/ɯ:/",
        visemeGroup: "ปากเปิดกลาง",
        difficulty: 1,
      },
      { text: "อุ", phonetic: "/u/", visemeGroup: "ปากห่อกลม", difficulty: 1 },
      { text: "อู", phonetic: "/u:/", visemeGroup: "ปากห่อกลม", difficulty: 1 },
      {
        text: "เอะ",
        phonetic: "/e/",
        visemeGroup: "ปากเปิดกลาง",
        difficulty: 1,
      },
      {
        text: "เอ",
        phonetic: "/e:/",
        visemeGroup: "ปากเปิดกลาง",
        difficulty: 1,
      },
      {
        text: "แอะ",
        phonetic: "/ɛ/",
        visemeGroup: "ปากเปิดกว้าง",
        difficulty: 1,
      },
      {
        text: "แอ",
        phonetic: "/ɛ:/",
        visemeGroup: "ปากเปิดกว้าง",
        difficulty: 1,
      },
      { text: "โอะ", phonetic: "/o/", visemeGroup: "ปากห่อกลม", difficulty: 1 },
      { text: "โอ", phonetic: "/o:/", visemeGroup: "ปากห่อกลม", difficulty: 1 },
      {
        text: "เอาะ",
        phonetic: "/ɔ/",
        visemeGroup: "ปากห่อกลม",
        difficulty: 1,
      },
      { text: "ออ", phonetic: "/ɔ:/", visemeGroup: "ปากห่อกลม", difficulty: 1 },
      {
        text: "เออะ",
        phonetic: "/ɤ/",
        visemeGroup: "ปากเปิดกลาง",
        difficulty: 1,
      },
      {
        text: "เออ",
        phonetic: "/ɤ:/",
        visemeGroup: "ปากเปิดกลาง",
        difficulty: 1,
      },
      // Diphthongs (สระประสม) — 6
      {
        text: "เอียะ",
        phonetic: "/ia/",
        visemeGroup: "ปากเปิดกลาง",
        difficulty: 1,
      },
      {
        text: "เอีย",
        phonetic: "/ia:/",
        visemeGroup: "ปากเปิดกลาง",
        difficulty: 1,
      },
      {
        text: "เอือะ",
        phonetic: "/ɯa/",
        visemeGroup: "ปากเปิดกลาง",
        difficulty: 1,
      },
      {
        text: "เอือ",
        phonetic: "/ɯa:/",
        visemeGroup: "ปากเปิดกลาง",
        difficulty: 1,
      },
      {
        text: "อัวะ",
        phonetic: "/ua/",
        visemeGroup: "ปากห่อกลม",
        difficulty: 1,
      },
      {
        text: "อัว",
        phonetic: "/ua:/",
        visemeGroup: "ปากห่อกลม",
        difficulty: 1,
      },
      // Special vowels (สระเกิน) — 8
      {
        text: "อำ",
        phonetic: "/am/",
        visemeGroup: "ปากเปิดกลาง",
        difficulty: 1,
      },
      {
        text: "ใอ",
        phonetic: "/ai/",
        visemeGroup: "ปากเปิดกว้าง",
        difficulty: 1,
      },
      {
        text: "ไอ",
        phonetic: "/ai/",
        visemeGroup: "ปากเปิดกว้าง",
        difficulty: 1,
      },
      {
        text: "เอา",
        phonetic: "/au/",
        visemeGroup: "ปากเปิดกว้าง",
        difficulty: 1,
      },
      {
        text: "ฤ",
        phonetic: "/rɯ/",
        visemeGroup: "ปากเปิดกลาง",
        difficulty: 1,
      },
      {
        text: "ฤๅ",
        phonetic: "/rɯ:/",
        visemeGroup: "ปากเปิดกลาง",
        difficulty: 1,
      },
      {
        text: "ฦ",
        phonetic: "/lɯ/",
        visemeGroup: "ปากเปิดกลาง",
        difficulty: 1,
      },
      {
        text: "ฦๅ",
        phonetic: "/lɯ:/",
        visemeGroup: "ปากเปิดกลาง",
        difficulty: 1,
      },
    ],
  },
  {
    id: "conversation",
    name: "บทสนทนา",
    typeLabel: "บทสนทนา",
    items: [
      {
        text: "สวัสดีครับ",
        phonetic: "/sà-wàt-dii kráp/",
        visemeGroup: "ทักทาย",
        difficulty: 1,
      },
      {
        text: "ขอบคุณค่ะ",
        phonetic: "/kɔ̀ɔp-kun kâ/",
        visemeGroup: "ทักทาย",
        difficulty: 1,
      },
      {
        text: "ฉันชื่อสมชาย",
        phonetic: "/chán chɯ̂ɯ sŏm-chaai/",
        visemeGroup: "ทักทาย",
        difficulty: 1,
      },
      {
        text: "ขอโทษนะ",
        phonetic: "/kǒr tôot ná/",
        visemeGroup: "ทักทาย",
        difficulty: 1,
      },
      {
        text: "ลาก่อนนะ",
        phonetic: "/láa-gɔ̀ɔn ná/",
        visemeGroup: "ทักทาย",
        difficulty: 1,
      },
    ],
  },
];

export function findLesson(id: string): Lesson | undefined {
  const normalized = id.toLowerCase();
  return LESSONS.find(
    (l) =>
      l.id.toLowerCase() === normalized || l.name.toLowerCase() === normalized
  );
}

export function lessonHref(group: string): string {
  return `/practice/session?group=${encodeURIComponent(group)}`;
}

export function deriveLesson(words: string[]): Lesson | undefined {
  if (!words.length) return undefined;
  const wordSet = new Set(words);
  let bestLesson: Lesson | undefined;
  let bestCount = 0;
  for (const lesson of LESSONS) {
    const count = lesson.items.filter((item) => wordSet.has(item.text)).length;
    if (count > bestCount) {
      bestCount = count;
      bestLesson = lesson;
    }
  }
  return bestLesson;
}
