// Art style catalog. Each style is a complete art-direction block used for the hero
// sheet AND every page illustration of a book, so one book = one consistent look.
// Style names are deliberately generic (no studio trademarks) — the looks speak for themselves.

export interface ArtStyle {
  id: string;
  nameTh: string;
  nameEn: string;
  /** Preview thumbnail shown in the picker (same scene rendered per style) */
  preview: string;
  /** Full art-direction prompt appended to hero + page generations */
  prompt: string;
}

const COMMON = 'Square 1:1 image, full-bleed scene, high detail, professional children\'s book quality.';

export const ART_STYLES: ArtStyle[] = [
  {
    id: 'watercolor',
    nameTh: 'สีน้ำคลาสสิก',
    nameEn: 'Classic Watercolor',
    preview: '/legacy/80980aeb-6dc1-409f-b75c-3d973f347d5f-storyhero-style-watercolor.png',
    prompt:
      `Soft dreamy watercolor children's picture-book illustration, warm pastel palette, gentle rounded shapes, cozy magical storybook atmosphere, delicate linework. ${COMMON}`,
  },
  {
    id: 'animation-3d',
    nameTh: 'การ์ตูน 3 มิติ แนวพิกซาร์',
    nameEn: 'Pixar-Inspired 3D',
    preview: '/legacy/e63ac0ff-4fc3-455e-a7f2-de1392edeabc-storyhero-style-animation-3d.png',
    prompt:
      `Premium 3D animated family-movie still: expressive characters with big sparkling eyes, soft cinematic lighting, subsurface glow on skin, detailed hair, vibrant saturated colors, shallow depth of field, rendered CGI look. ${COMMON}`,
  },
  {
    // The classic golden-age animated-movie look (id kept stable for existing books)
    id: 'fairytale-cartoon',
    nameTh: 'เทพนิยาย แนวดิสนีย์',
    nameEn: 'Disney-Inspired Fairytale',
    preview: '/legacy/2dcc87f6-de31-4f32-bd61-6e6acee3b914-storyhero-style-fairytale-cartoon.png',
    prompt:
      `Golden-age hand-drawn fairytale animation style: clean flowing ink outlines, cel-shaded colors, enchanted castle-storybook mood, graceful character design, painterly background scenery. ${COMMON}`,
  },
  {
    id: 'anime',
    nameTh: 'อนิเมะญี่ปุ่น',
    nameEn: 'Japanese Anime',
    preview: '/legacy/e725421d-6126-4dbd-a95c-f8522b122bd6-storyhero-style-anime.png',
    prompt:
      `Heartwarming Japanese anime film style: soft cel shading, luminous pastoral backgrounds with drifting clouds and glowing light, big gentle eyes, hand-painted texture, nostalgic summer-afternoon warmth. ${COMMON}`,
  },
  {
    id: 'comic',
    nameTh: 'คอมิกฮีโร่',
    nameEn: 'Comic Book Hero',
    preview: '/legacy/f7a21f71-6766-4d79-a645-25287e4d72ef-storyhero-style-comic.png',
    prompt:
      `Bold kid-friendly comic-book style: strong confident outlines, dynamic heroic poses, vivid primary colors, subtle halftone dot shading, energetic action framing. ${COMMON}`,
  },
  {
    id: 'claymation',
    nameTh: 'ดินปั้นน่ารัก',
    nameEn: 'Clay Animation',
    preview: '/legacy/6f5aabb3-dc2b-40ac-9dc0-dad2a38b22e6-storyhero-style-claymation.png',
    prompt:
      `Charming claymation stop-motion style: handcrafted plasticine characters with visible fingerprint textures, miniature diorama sets, warm studio lighting, adorable chunky proportions. ${COMMON}`,
  },
  {
    id: 'papercraft',
    nameTh: 'กระดาษตัดแปะ',
    nameEn: 'Paper Cut-out',
    preview: '/legacy/18547237-becf-45ba-ad28-22acbe52ffdb-storyhero-style-papercraft.png',
    prompt:
      `Layered paper cut-out collage style: textured construction-paper shapes with soft drop shadows between layers, folded paper details, bright cheerful colors, handmade picture-book charm. ${COMMON}`,
  },
  {
    id: 'crayon',
    nameTh: 'สีเทียนสดใส',
    nameEn: 'Crayon Wonder',
    preview: '/legacy/c5111d14-5bf9-49ec-8c4c-00cac254463e-storyhero-style-crayon.png',
    prompt:
      `Joyful crayon and colored-pencil children's drawing style: playful waxy strokes, visible paper grain, sunny naive charm, bright happy colors, like the best drawing on the classroom wall. ${COMMON}`,
  },
  {
    id: 'painterly',
    nameTh: 'ภาพวาดในฝัน',
    nameEn: 'Dreamy Storybook Painting',
    preview: '/legacy/a6afd5b9-c9c3-4149-a074-1858108eb2df-storyhero-style-painterly.png',
    prompt:
      `Dreamy painterly digital storybook illustration: soft airbrushed rendering, glossy semi-realistic characters, luminous pastel color palette, gentle glowing light, richly painted fantasy-book-cover quality, smooth blended gradients, magical whimsical atmosphere with soft bokeh sparkles. ${COMMON}`,
  },
  {
    id: 'real-magic',
    nameTh: 'เวทมนตร์เสมือนจริง',
    nameEn: 'Real Life Magic',
    preview: '/legacy/b9eebc21-9200-40ec-ac3c-65563fd5137b-storyhero-style-real-magic.png',
    prompt:
      `Photorealistic cinematic fantasy photograph: looks like a real family-movie still with a real child on a breathtaking magical set, golden enchanted lighting, film-grade color grading, shallow depth of field, real sparkles of light in the air, believable textures and costumes, warm premium blockbuster feel. ${COMMON}`,
  },
];

export const DEFAULT_STYLE_ID = 'watercolor';

export function getArtStyle(id: string | null | undefined): ArtStyle {
  return ART_STYLES.find((s) => s.id === id) || ART_STYLES[0];
}
