export const PHONICS_GROUP_1 = {
  id: 1,
  graphemes: ['s', 'a', 't', 'i', 'p', 'n'] as const,
  cumulativeGraphemes: ['s', 'a', 't', 'i', 'p', 'n'] as const,
  storyPageCount: 5,
  practiceWords: ['ant', 'sit', 'tap', 'tin', 'nap'] as const,
};

export const PHONICS_GROUP_2 = {
  id: 2,
  graphemes: ['c', 'k', 'e', 'h', 'r', 'm', 'd'] as const,
  cumulativeGraphemes: ['s', 'a', 't', 'i', 'p', 'n', 'c', 'k', 'e', 'h', 'r', 'm', 'd'] as const,
  storyPageCount: 5,
  practiceWords: ['cat', 'kid', 'hen', 'red', 'map'] as const,
};

export const PHONICS_GROUP_3 = {
  id: 3,
  graphemes: ['g', 'o', 'u', 'l', 'f', 'b'] as const,
  cumulativeGraphemes: ['s', 'a', 't', 'i', 'p', 'n', 'c', 'k', 'e', 'h', 'r', 'm', 'd', 'g', 'o', 'u', 'l', 'f', 'b'] as const,
  storyPageCount: 5,
  practiceWords: ['bug', 'pot', 'rug', 'log', 'fun'] as const,
};

export const PHONICS_GROUP_4 = {
  id: 4,
  graphemes: ['ai', 'j', 'oa', 'ie', 'ee', 'or'] as const,
  cumulativeGraphemes: [...PHONICS_GROUP_3.cumulativeGraphemes, 'ai', 'j', 'oa', 'ie', 'ee', 'or'] as const,
  storyPageCount: 5,
  practiceWords: ['rain', 'boat', 'pie', 'feet', 'horn'] as const,
};

export const PHONICS_GROUP_5 = {
  id: 5,
  graphemes: ['z', 'w', 'ng', 'v', 'oo'] as const,
  cumulativeGraphemes: [...PHONICS_GROUP_4.cumulativeGraphemes, 'z', 'w', 'ng', 'v', 'oo'] as const,
  storyPageCount: 5,
  practiceWords: ['king', 'vest', 'book', 'wood', 'moon'] as const,
};

export const PHONICS_GROUP_6 = {
  id: 6,
  graphemes: ['y', 'x', 'ch', 'sh', 'th'] as const,
  cumulativeGraphemes: [...PHONICS_GROUP_5.cumulativeGraphemes, 'y', 'x', 'ch', 'sh', 'th'] as const,
  storyPageCount: 5,
  practiceWords: ['yak', 'box', 'chip', 'shop', 'moth'] as const,
};

export const PHONICS_GROUP_7 = {
  id: 7,
  graphemes: ['qu', 'ou', 'oi', 'ue', 'er', 'ar', 'ear', 'air'] as const,
  cumulativeGraphemes: [...PHONICS_GROUP_6.cumulativeGraphemes, 'qu', 'ou', 'oi', 'ue', 'er', 'ar', 'ear', 'air'] as const,
  storyPageCount: 5,
  practiceWords: ['coin', 'blue', 'barn', 'hear', 'chair'] as const,
};

export const PHONICS_GROUPS = [
  PHONICS_GROUP_1,
  PHONICS_GROUP_2,
  PHONICS_GROUP_3,
  PHONICS_GROUP_4,
  PHONICS_GROUP_5,
  PHONICS_GROUP_6,
  PHONICS_GROUP_7,
] as const;

export type SupportedPhonicsGroup = (typeof PHONICS_GROUPS)[number]['id'];

const GROUP_1_WORDS = new Set([
  'a', 'an', 'ant', 'ants', 'as', 'at',
  'in', 'it', 'its',
  'nap', 'naps', 'nip', 'nips',
  'pan', 'pans', 'pat', 'pats', 'pin', 'pins', 'pit', 'pits',
  'sap', 'sat', 'sin', 'sip', 'sips', 'sit', 'sits',
  'snap', 'snaps', 'snip', 'snips', 'span', 'spans', 'spin', 'spins', 'spit', 'spits',
  'tan', 'tans', 'tap', 'taps', 'tin', 'tins', 'tip', 'tips',
]);

// Group 2 is cumulative: children may blend the Group 1 sounds as well as the
// newly introduced c, k, e, h, r, m and d sounds. The locked reading lines do
// not rely on later digraphs or unintroduced vowel sounds.
const GROUP_2_WORDS = new Set([
  ...GROUP_1_WORDS,
  'camp', 'camps', 'can', 'cans', 'cap', 'caps', 'cat', 'cats',
  'dad', 'dads', 'damp', 'did', 'dim', 'dims', 'dip', 'dips',
  'had', 'ham', 'hand', 'hands', 'has', 'hat', 'hats', 'hen', 'hens', 'hid', 'him', 'hip', 'hips', 'hit', 'hits',
  'kid', 'kids', 'kit', 'kits',
  'is',
  'mad', 'man', 'map', 'maps', 'mat', 'mats', 'men', 'met',
  'net', 'nets',
  'pen', 'pens', 'pet', 'pets',
  'ram', 'rams', 'ran', 'rat', 'rats', 'red', 'rest', 'rests', 'rip', 'rips',
  'sad', 'sand', 'send', 'sent', 'set', 'sets',
  'ten',
]);

const GROUP_3_WORDS = new Set([
  ...GROUP_2_WORDS,
  'bad', 'bob', 'bug', 'bugs', 'bun', 'buns',
  'clip', 'clips', 'cut', 'cuts',
  'dig', 'digs', 'dog', 'dogs', 'dot', 'dots',
  'fog', 'fun',
  'get', 'gets', 'got',
  'hot',
  'log', 'logs', 'lot', 'lots',
  'mud',
  'nut', 'nuts',
  'of', 'on',
  'pot', 'pots',
  'rug', 'rugs', 'run', 'runs',
  'sun',
  'tug', 'tugs',
  'up',
]);

const GROUP_4_WORDS = new Set([
  ...GROUP_3_WORDS,
  'boat', 'boats',
  'corn',
  'feet', 'float', 'floats', 'fort', 'forts',
  'goat', 'goats',
  'horn', 'horns',
  'jam', 'jar', 'jars', 'job', 'jobs',
  'loaf', 'loaves',
  'pie', 'pies',
  'rain', 'rains',
  'see', 'sees',
]);

const GROUP_5_WORDS = new Set([
  ...GROUP_4_WORDS,
  'bang', 'book', 'books',
  'drum', 'drums',
  'fell',
  'good',
  'king', 'kings',
  'look', 'looks',
  'moon',
  'pink',
  'sing', 'sings',
  'van', 'vans', 'vest', 'vests',
  'well', 'wells', 'wet', 'wind', 'wood',
  'zoo',
]);

const GROUP_6_WORDS = new Set([
  ...GROUP_5_WORDS,
  'box', 'boxes',
  'chip', 'chips',
  'free',
  'glad',
  'moth', 'moths',
  'shed', 'sheds', 'shop', 'shops', 'shut', 'shuts', 'six',
  'that', 'this',
  'yak', 'yaks', 'yam', 'yams', 'yes',
]);

const GROUP_7_WORDS = new Set([
  ...GROUP_6_WORDS,
  'air',
  'barn', 'barns', 'blue',
  'chair', 'chairs', 'clear', 'coin', 'coins',
  'fair', 'fern', 'ferns',
  'hair', 'hear', 'hears',
  'near',
  'pair', 'pairs',
  'quick', 'quilt', 'quilts',
  'soil', 'sound', 'sounds',
]);

export interface PhonicsStoryPage {
  text_en: string;
  text_th: string;
  image_prompt: string;
}

export interface PhonicsStoryPlan {
  title_en: string;
  title_th: string;
  costume: string;
  world: string;
  pages: PhonicsStoryPage[];
  practice: PhonicsStoryPage;
}

export interface PhonicsValidation {
  valid: boolean;
  invalidWords: string[];
  issues: string[];
}

const TEMPLATES = [
  {
    id: 'ant-tin',
    titleEn: 'and the Ant',
    titleTh: 'กับมดน้อย',
    lines: ['An ant.', 'An ant sits.', 'An ant taps a tin.', 'Tap, tap, tap!', 'An ant naps.'],
    thai: [
      'เจอมดตัวหนึ่ง',
      'มดน้อยนั่งลง',
      'มดน้อยเคาะกระป๋อง',
      'แตะ แตะ แตะ!',
      'แล้วมดน้อยก็งีบหลับ',
    ],
    scenes: [
      'the hero child kneels beside one friendly ant in a sunny garden',
      'the friendly ant sits on a broad green leaf while the hero child watches',
      'the ant taps a small shiny tin as the hero child smiles nearby',
      'the ant taps the tin three times and tiny flower petals bounce with the rhythm',
      'the ant naps inside the cozy tin while the hero child rests beside it',
    ],
  },
  {
    id: 'pin-spin',
    titleEn: 'and the Spinning Pin',
    titleTh: 'กับเข็มหมุดหมุนติ้ว',
    lines: ['A pin in a tin.', 'An ant sits.', 'An ant taps a tin.', 'A pin spins!', 'An ant naps.'],
    thai: [
      'มีเข็มหมุดอยู่ในกระป๋อง',
      'มดน้อยนั่งลง',
      'มดน้อยเคาะกระป๋อง',
      'เข็มหมุดหมุนติ้ว!',
      'แล้วมดน้อยก็งีบหลับ',
    ],
    scenes: [
      'the hero child discovers a bright round-headed pin inside a small tin',
      'a friendly ant sits beside the tin while the hero child leans closer',
      'the ant taps the tin and the hero child waits with delight',
      'the pin spins safely like a tiny top while the ant and hero child cheer',
      'the friendly ant naps beside the still pin as the hero child smiles',
    ],
  },
  {
    id: 'ant-pan',
    titleEn: 'and the Little Pan',
    titleTh: 'กับกระทะใบจิ๋ว',
    lines: ['An ant in a pan.', 'An ant sits.', 'An ant taps a pan.', 'Pat, pat, pat!', 'An ant naps.'],
    thai: [
      'มดน้อยอยู่ในกระทะใบจิ๋ว',
      'มดน้อยนั่งลง',
      'มดน้อยเคาะกระทะ',
      'แปะ แปะ แปะ!',
      'แล้วมดน้อยก็งีบหลับ',
    ],
    scenes: [
      'the hero child finds a friendly ant in a tiny toy pan at a garden picnic',
      'the ant sits in the little pan while the hero child watches closely',
      'the ant taps the toy pan with its feet and the hero child grins',
      'the ant pats the pan three times as soft picnic napkins flutter',
      'the ant naps in the cozy toy pan while the hero child sits nearby',
    ],
  },
] as const;

const GROUP_2_TEMPLATES = [
  {
    id: 'hen-red-cap',
    titleEn: 'and the Red Cap',
    titleTh: 'กับหมวกสีแดง',
    lines: ['A hen.', 'A hen in a pen.', 'A red cap.', 'A hen taps a red cap.', 'A hen rests.'],
    thai: [
      'เจอแม่ไก่ตัวหนึ่ง',
      'แม่ไก่อยู่ในคอกเล็ก ๆ',
      'เจอหมวกสีแดงใบหนึ่ง',
      'แม่ไก่แตะหมวกสีแดง',
      'แล้วแม่ไก่ก็พักอย่างสบายใจ',
    ],
    scenes: [
      'the hero child meets one friendly hen in a flower-filled garden',
      'the hero child kneels beside the friendly hen inside a cozy low wooden pen',
      'the hero child discovers one bright red cap beside the hen pen',
      'the friendly hen taps the red cap with its beak while the hero child laughs',
      'the friendly hen rests beside the red cap as the hero child sits peacefully nearby',
    ],
    world: 'a sunny cottage garden with a cozy hen pen and warm picture-book details',
  },
  {
    id: 'rat-ham',
    titleEn: 'and the Rat with Ham',
    titleTh: 'กับหนูน้อยและแฮม',
    lines: ['A rat.', 'A rat has ham.', 'A rat hid ham.', 'A rat is mad.', 'A rat is sad.'],
    thai: [
      'เจอหนูน้อยตัวหนึ่ง',
      'หนูน้อยมีแฮมชิ้นหนึ่ง',
      'หนูน้อยซ่อนแฮมเอาไว้',
      'หนูน้อยเริ่มโกรธ',
      'สุดท้ายหนูน้อยกลับรู้สึกเศร้า',
    ],
    scenes: [
      'the hero child meets one tiny friendly rat near a whimsical tree-stump home',
      'the tiny rat proudly holds a small piece of ham while the hero child watches',
      'the rat hides the ham beneath a safe little picnic mat as the hero child looks surprised',
      'the rat folds its paws with a comically cross expression while the hero child stays gentle',
      'the sad little rat sits beside the hero child, who offers a warm comforting hand',
    ],
    world: 'a cheerful garden beside a whimsical tree-stump home with flowers and soft sunshine',
  },
  {
    id: 'ram-map-camp',
    titleEn: 'and the Camp Map',
    titleTh: 'กับแผนที่แคมป์',
    lines: ['A ram at camp.', 'A map.', 'A ram had a map.', 'A ram ran.', 'A ram rests.'],
    thai: [
      'เจอแกะตัวผู้ที่แคมป์',
      'มีแผนที่อยู่หนึ่งแผ่น',
      'แกะตัวผู้ถือแผนที่เอาไว้',
      'แล้วแกะก็วิ่งออกไป',
      'สุดท้ายแกะก็นอนพัก',
    ],
    scenes: [
      'the hero child meets one fluffy friendly ram at a bright forest camp',
      'the hero child finds a simple picture map beside the cozy camp tent, with no written words visible',
      'the friendly ram holds the picture map as the hero child points toward a sunny path',
      'the playful ram runs along the safe forest path while the hero child follows with delight',
      'the friendly ram rests on soft grass beside the hero child near the warm camp tent',
    ],
    world: 'a bright friendly forest camp with a cozy tent, soft paths and golden morning light',
  },
] as const;

const GROUP_3_TEMPLATES = [
  {
    id: 'bug-dot-pot',
    titleEn: 'and the Little Bug',
    titleTh: 'กับแมลงตัวน้อย',
    keywords: /bug|dot|garden|insect/,
    lines: ['A bug.', 'A bug has a dot.', 'A bug hid in a pot.', 'A bug is mad.', 'A bug rests.'],
    thai: ['เจอแมลงตัวหนึ่ง', 'แมลงมีจุดเล็ก ๆ', 'แมลงซ่อนอยู่ในกระถาง', 'แมลงเริ่มโกรธ', 'สุดท้ายแมลงก็นอนพัก'],
    scenes: [
      'the hero child meets one tiny friendly spotted bug in a bright garden',
      'the hero child notices one clear round dot on the friendly bug',
      'the little bug hides safely inside a tipped flower pot while the hero child looks closer',
      'the little bug makes a comically cross face as the hero child stays gentle',
      'the calm little bug rests on a leaf beside the smiling hero child',
    ],
    world: 'a sunny flower garden with terracotta pots, broad leaves and playful picture-book details',
  },
  {
    id: 'hot-pot-nut',
    titleEn: 'and the Hot Pot',
    titleTh: 'กับหม้อร้อน',
    keywords: /pot|nut|cook|kitchen|food/,
    lines: ['A pot.', 'A pot is hot.', 'A nut.', 'A kid cuts a nut.', 'A nut in a pot.'],
    thai: ['เจอหม้อใบหนึ่ง', 'หม้อใบนั้นร้อน', 'มีถั่วหนึ่งเม็ด', 'เด็กน้อยหั่นถั่วอย่างระมัดระวัง', 'แล้วถั่วก็ลงไปอยู่ในหม้อ'],
    scenes: [
      'the hero child discovers one friendly cream-colored cooking pot in a cozy kitchen',
      'the pot warms safely on a small stove while the hero child keeps a careful distance',
      'the hero child holds one large nut beside the pot',
      'the hero child carefully cuts the nut on a child-safe board with an adult nearby',
      'the nut sits inside the warm pot as the hero child smiles proudly',
    ],
    world: 'a warm whimsical family kitchen with safe child-sized cooking tools and golden morning light',
  },
  {
    id: 'dog-muddy-rug',
    titleEn: 'and the Muddy Rug',
    titleTh: 'กับพรมเปื้อนโคลน',
    keywords: /dog|rug|mud|pet|puppy/,
    lines: ['A dog on a rug.', 'A dog digs.', 'Mud on a rug.', 'A dog is sad.', 'A dog tugs a rug.'],
    thai: ['มีลูกสุนัขอยู่บนพรม', 'ลูกสุนัขเริ่มขุด', 'โคลนเลอะอยู่บนพรม', 'ลูกสุนัขรู้สึกเศร้า', 'แล้วลูกสุนัขก็ดึงพรมมาช่วยกันเก็บ'],
    scenes: [
      'the hero child meets one fluffy puppy sitting on a round rug in a cozy room',
      'the playful puppy digs gently at one edge of the rug while the hero child looks surprised',
      'a few soft muddy paw prints appear on the rug',
      'the puppy sits sadly beside the muddy rug while the hero child offers comfort',
      'the puppy tugs the rug toward the hero child so they can clean it together',
    ],
    world: 'a cozy sunlit playroom opening onto a small garden, with a soft round rug and warm details',
  },
] as const;

const GROUP_4_TEMPLATES = [
  {
    id: 'goat-loaf-boat',
    titleEn: 'and the Goat in a Boat',
    titleTh: 'กับแพะในเรือ',
    keywords: /goat|boat|loaf|lake|river/,
    lines: ['A goat.', 'A goat has a loaf.', 'A goat gets in a boat.', 'A boat floats.', 'A goat rests.'],
    thai: ['เจอแพะตัวหนึ่ง', 'แพะมีขนมปังหนึ่งก้อน', 'แพะขึ้นไปนั่งในเรือ', 'เรือลอยไปอย่างนุ่มนวล', 'สุดท้ายแพะก็นอนพัก'],
    scenes: [
      'the hero child meets one friendly little goat beside a calm lake',
      'the goat proudly carries one loaf of bread while the hero child watches',
      'the goat steps safely into a small wooden boat beside the hero child',
      'the little boat floats gently across sparkling calm water',
      'the goat rests beside the hero child in the moored boat near the shore',
    ],
    world: 'a bright lakeside meadow with a small wooden boat, wildflowers and soft blue water',
  },
  {
    id: 'goat-horn-corn',
    titleEn: 'and the Goat with a Horn',
    titleTh: 'กับแพะเขางาม',
    keywords: /horn|corn|farm|goat|fort/,
    lines: ['A goat has a horn.', 'A goat has corn.', 'A goat runs at corn.', 'A goat hits a pot.', 'A goat rests at a fort.'],
    thai: ['แพะมีเขาหนึ่งข้าง', 'แพะมีข้าวโพด', 'แพะวิ่งไปหาข้าวโพด', 'แพะเผลอชนกระถาง', 'สุดท้ายแพะพักอยู่ที่ป้อมไม้'],
    scenes: [
      'the hero child meets one gentle goat with a small curved horn at a cheerful farm',
      'the goat stands beside a basket of golden corn while the hero child smiles',
      'the excited goat runs safely toward a small pile of corn',
      'the goat gently bumps an empty flower pot as the hero child reaches out',
      'the goat rests with the hero child inside a cozy child-sized wooden fort',
    ],
    world: 'a cheerful farm with corn rows, a tiny wooden fort, flowers and warm sunshine',
  },
  {
    id: 'rain-jam-jar',
    titleEn: 'and the Jam Jar',
    titleTh: 'กับขวดแยม',
    keywords: /jam|jar|rain|job|berry/,
    lines: ['A job.', 'A job is jam.', 'A jar.', 'Rain taps a jar.', 'Jam in a jar.'],
    thai: ['มีงานหนึ่งอย่าง', 'งานนั้นคือทำแยม', 'มีขวดโหลหนึ่งใบ', 'ฝนเคาะเบา ๆ ที่ขวดโหล', 'สุดท้ายแยมก็อยู่ในขวดโหล'],
    scenes: [
      'the hero child receives a fun jam-making job in a cozy kitchen',
      'the hero child stirs bright berry jam in a safe child-sized pot',
      'the hero child holds one clean empty glass jar',
      'soft rain taps the window beside the waiting jar',
      'the hero child proudly fills the jar with finished jam, with no label or written words',
    ],
    world: 'a cozy cottage kitchen on a gentle rainy day with berries, jars and warm amber light',
  },
] as const;

const GROUP_5_TEMPLATES = [
  {
    id: 'book-on-wood',
    titleEn: 'and the Garden Book',
    titleTh: 'กับหนังสือในสวน',
    keywords: /book|wood|look|read|garden/,
    lines: ['A book.', 'A book on wood.', 'A good book.', 'Wind hits a book.', 'A kid gets a book.'],
    thai: ['มีหนังสือหนึ่งเล่ม', 'หนังสือวางอยู่บนตอไม้', 'เป็นหนังสือที่ดีมาก', 'ลมพัดโดนหนังสือ', 'เด็กน้อยเก็บหนังสือกลับมาได้'],
    scenes: [
      'the hero child finds one beautiful picture book in a cottage garden, with no readable cover text',
      'the book rests on a smooth tree stump while the hero child sits nearby',
      'the hero child enjoys looking through the good picture book',
      'a playful gust of wind lifts the book pages as the hero child reaches for it',
      'the hero child safely catches and gets the closed book back before it reaches a tiny mud puddle',
    ],
    world: 'a peaceful cottage garden with a broad tree stump, flowers, soft wind and storybook warmth',
  },
  {
    id: 'pink-vest-well',
    titleEn: 'and the Pink Vest',
    titleTh: 'กับเสื้อกั๊กสีชมพู',
    keywords: /vest|pink|well|wet|clothes/,
    lines: ['A pink vest.', 'A vest is wet.', 'A kid at a well.', 'A vest fell in a well.', 'A kid is sad.'],
    thai: ['มีเสื้อกั๊กสีชมพู', 'เสื้อกั๊กเปียกน้ำ', 'เด็กน้อยอยู่ข้างบ่อน้ำตื้น', 'เสื้อกั๊กพลัดตกลงไปในบ่อน้ำตื้น', 'เด็กน้อยรู้สึกเศร้า'],
    scenes: [
      'the hero child happily wears one bright pink vest in a flower garden',
      'a playful splash makes the pink vest wet',
      'the hero child stands beside a very shallow safe wishing well with an adult nearby',
      'the pink vest slips safely into the shallow well while the hero child stays beside it',
      'the hero child sits sadly beside the well in the wet pink vest and receives comfort',
    ],
    world: 'a sunny enclosed garden with a very shallow child-safe wishing well and colorful flowers',
  },
  {
    id: 'king-van-song',
    titleEn: 'and the Singing King',
    titleTh: 'กับราชานักร้อง',
    keywords: /king|van|sing|song|bang|music/,
    lines: ['A king.', 'A king has a van.', 'A king sings.', 'A king taps a drum.', 'Bang, bang, bang!'],
    thai: ['เจอราชาองค์หนึ่ง', 'ราชามีรถตู้', 'ราชาเริ่มร้องเพลง', 'ราชาเคาะกลอง', 'ปัง ปัง ปัง!'],
    scenes: [
      'the hero child meets one kind funny king outside a bright castle',
      'the king proudly shows the hero child a whimsical blue van',
      'the king sings happily beside the hero child and the van',
      'the king taps a colorful toy drum while the hero child claps',
      'the hero child and king finish with three joyful drum beats beside the van',
    ],
    world: 'a playful castle courtyard with a whimsical blue van, music and bright festival colors',
  },
] as const;

const GROUP_6_TEMPLATES = [
  {
    id: 'moth-in-shed',
    titleEn: 'and the Moth in the Shed',
    titleTh: 'กับผีเสื้อกลางคืนในโรงเก็บของ',
    keywords: /moth|shed|box|garden/,
    lines: ['A shed.', 'A moth in a shed.', 'A box.', 'A kid shuts a box.', 'A moth is free.'],
    thai: ['เจอโรงเก็บของหลังเล็ก', 'มีผีเสื้อกลางคืนอยู่ข้างใน', 'มีกล่องหนึ่งใบ', 'เด็กน้อยปิดกล่องอย่างเบามือ', 'สุดท้ายผีเสื้อกลางคืนก็บินเป็นอิสระ'],
    scenes: [
      'the hero child discovers a cozy wooden garden shed',
      'one friendly moth flutters safely inside the sunlit shed',
      'the hero child finds one open cardboard box with no writing on it',
      'the hero child gently shuts the empty box while the moth stays safely above it',
      'the hero child opens the shed door and the happy moth flies free into the garden',
    ],
    world: 'a warm sunlit wooden garden shed with simple tools, flowers and gentle magical details',
  },
  {
    id: 'chip-in-shop',
    titleEn: 'and the Chip in the Shop',
    titleTh: 'กับมันฝรั่งแผ่นในร้าน',
    keywords: /shop|chip|box|snack/,
    lines: ['A shop.', 'A box in a shop.', 'A kid has a look.', 'A chip in a box.', 'A kid is glad.'],
    thai: ['เจอร้านเล็ก ๆ', 'มีกล่องอยู่ในร้าน', 'เด็กน้อยลองมองดู', 'มีมันฝรั่งแผ่นอยู่ในกล่อง', 'เด็กน้อยดีใจมาก'],
    scenes: [
      'the hero child arrives at a cheerful tiny toy-and-snack shop',
      'the hero child discovers one plain box inside the shop, with no writing on it',
      'the hero child peeks curiously into the open box',
      'one large crisp chip sits inside the box as a playful surprise',
      'the glad hero child holds the open box and smiles at the shopkeeper',
    ],
    world: 'a cheerful colorful village shop with toys, plain boxes and soft afternoon light',
  },
  {
    id: 'yak-and-yam',
    titleEn: 'and the Yak with a Yam',
    titleTh: 'กับจามรีและมันเทศ',
    keywords: /yak|yam|farm|hot|six/,
    lines: ['A kid is hot.', 'A kid has a yam.', 'A yak runs.', 'A yak gets a yam.', 'A yak has six yams.'],
    thai: ['เด็กน้อยรู้สึกร้อน', 'เด็กน้อยมีมันเทศหนึ่งหัว', 'จามรีวิ่งเข้ามา', 'จามรีได้มันเทศไปหนึ่งหัว', 'สุดท้ายจามรีมีมันเทศหกหัว'],
    scenes: [
      'the hero child feels warm while walking through a sunny yam field',
      'the hero child proudly holds one purple yam',
      'one fluffy friendly yak runs playfully along the safe farm path',
      'the friendly yak gently takes one yam from a basket beside the hero child',
      'the smiling yak sits beside exactly six yams while the hero child counts them',
    ],
    world: 'a sunny rolling yam farm with a friendly fluffy yak, baskets and purple wildflowers',
  },
] as const;

const GROUP_7_TEMPLATES = [
  {
    id: 'fair-hair-chair',
    titleEn: 'and the Chair',
    titleTh: 'กับเก้าอี้ข้างสายลม',
    keywords: /chair|hair|fair|pair|wind/,
    lines: ['A kid sits on a chair.', 'A kid has fair hair.', 'Wind hits fair hair.', 'A pair of hair clips.', 'A kid clips fair hair.'],
    thai: ['เด็กน้อยนั่งบนเก้าอี้', 'เด็กน้อยมีผมสีอ่อน', 'ลมพัดโดนเส้นผม', 'มีกิ๊บติดผมหนึ่งคู่', 'เด็กน้อยติดกิ๊บให้ผมเรียบร้อย'],
    scenes: [
      'the hero child sits on a cozy wooden chair in a bright reading room',
      'soft sunshine makes the hero child fair hair glow warmly',
      'a playful breeze lifts the hero child fair hair near an open window',
      'the hero child finds a matching pair of colorful hair clips beside the chair',
      'the hero child clips fair hair neatly into place and smiles',
    ],
    world: 'a bright cozy reading room with a wooden chair, an open window and soft flowers',
  },
  {
    id: 'sound-at-barn',
    titleEn: 'and the Sound at the Barn',
    titleTh: 'กับเสียงที่โรงนา',
    keywords: /barn|sound|hear|fern|farm/,
    lines: ['A kid is near a barn.', 'A fern at a barn.', 'A kid hears a sound.', 'A kid gets near a barn.', 'A cat in a barn.'],
    thai: ['เด็กน้อยอยู่ใกล้โรงนา', 'มีต้นเฟิร์นอยู่ข้างโรงนา', 'เด็กน้อยได้ยินเสียงหนึ่ง', 'เด็กน้อยค่อย ๆ เข้าไปใกล้โรงนา', 'ที่แท้มีแมวอยู่ในโรงนา'],
    scenes: [
      'the hero child stands near a warm red barn on a sunny farm',
      'the hero child notices one lush green fern beside the barn door',
      'the hero child pauses after hearing a gentle sound from inside the barn',
      'the curious hero child steps safely nearer to the open barn door',
      'one friendly cat appears inside the barn as the hero child smiles with relief',
    ],
    world: 'a peaceful sunny farm with a red barn, green ferns, flowers and soft golden light',
  },
  {
    id: 'coin-on-quilt',
    titleEn: 'and the Coin on the Quilt',
    titleTh: 'กับเหรียญบนผ้าห่ม',
    keywords: /coin|quilt|quick|soil|garden/,
    lines: ['A coin.', 'A coin on a quilt.', 'A kid is quick.', 'A kid digs in soil.', 'A coin on a quilt.'],
    thai: ['เจอเหรียญหนึ่งเหรียญ', 'เหรียญวางอยู่บนผ้าห่ม', 'เด็กน้อยรีบมองหาอย่างรวดเร็ว', 'เด็กน้อยขุดดูในดิน', 'สุดท้ายเหรียญยังอยู่บนผ้าห่ม'],
    scenes: [
      'the hero child discovers one shiny coin in a flower garden',
      'the coin rests on a colorful patchwork quilt with no letters or numbers visible',
      'the quick hero child looks around after thinking the coin is missing',
      'the hero child gently digs in soft garden soil with a small safe trowel',
      'the hero child finds the coin still shining on the patchwork quilt and laughs',
    ],
    world: 'a cheerful flower garden with a colorful patchwork quilt, soft soil and afternoon sunshine',
  },
] as const;

function cleanInterest(value: unknown): string {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 240);
}

function selectTemplate(interest: string) {
  const lower = interest.toLowerCase();
  if (/pin|spin|tin|robot|machine/.test(lower)) return TEMPLATES[1];
  if (/ant|garden|bug|insect/.test(lower)) return TEMPLATES[0];
  if (/pan|picnic|cook|food/.test(lower)) return TEMPLATES[2];
  let hash = 0;
  for (const char of lower) hash = ((hash * 31) + char.charCodeAt(0)) >>> 0;
  return TEMPLATES[hash % TEMPLATES.length];
}

function selectGroup2Template(interest: string) {
  const lower = interest.toLowerCase();
  if (/hen|pet|cap|chicken|garden/.test(lower)) return GROUP_2_TEMPLATES[0];
  if (/rat|ham|food|picnic|mouse/.test(lower)) return GROUP_2_TEMPLATES[1];
  if (/camp|map|ram|forest|outdoor/.test(lower)) return GROUP_2_TEMPLATES[2];
  let hash = 0;
  for (const char of lower) hash = ((hash * 31) + char.charCodeAt(0)) >>> 0;
  return GROUP_2_TEMPLATES[hash % GROUP_2_TEMPLATES.length];
}

function selectLaterTemplate<T extends { keywords: RegExp }>(templates: readonly T[], interest: string): T {
  const lower = interest.toLowerCase();
  const matched = templates.find((template) => template.keywords.test(lower));
  if (matched) return matched;
  let hash = 0;
  for (const char of lower) hash = ((hash * 31) + char.charCodeAt(0)) >>> 0;
  return templates[hash % templates.length];
}

export function buildGroup1PhonicsPlan(childName: string, interestValue?: unknown): PhonicsStoryPlan {
  const interest = cleanInterest(interestValue);
  const template = selectTemplate(interest);
  const heroName = String(childName || 'My Hero').trim().slice(0, 50) || 'My Hero';
  const visualInterest = interest
    ? ` Gently include this parent-selected visual interest without adding written words: ${interest}.`
    : '';
  const costume = 'a bright purple explorer vest over a cream shirt, blue shorts, and white sneakers';
  const world = 'a sunny miniature garden adventure with warm, friendly picture-book details';

  return {
    title_en: `${heroName} ${template.titleEn}`,
    title_th: `${heroName} ${template.titleTh}`,
    costume,
    world,
    pages: template.lines.map((text_en, index) => ({
      text_en,
      text_th: `${heroName}${template.thai[index]}`,
      image_prompt: `${template.scenes[index]}, in ${world}.${visualInterest}`,
    })),
    practice: {
      text_en: PHONICS_GROUP_1.practiceWords.join(' · '),
      text_th: `ฝึกผสมเสียง: ${PHONICS_GROUP_1.practiceWords.join(' · ')}`,
      image_prompt: `A playful end-of-book practice scene in ${world}: the hero child, one friendly ant, a small tin, and safe oversized toy pins arranged as clear spot illustrations, with generous empty space and no written text.`,
    },
  };
}

export function buildGroup2PhonicsPlan(childName: string, interestValue?: unknown): PhonicsStoryPlan {
  const interest = cleanInterest(interestValue);
  const template = selectGroup2Template(interest);
  const heroName = String(childName || 'My Hero').trim().slice(0, 50) || 'My Hero';
  const visualInterest = interest
    ? ` Gently include this parent-selected visual interest without adding written words: ${interest}.`
    : '';
  const costume = 'a bright red explorer jacket over a cream shirt, tan shorts, green boots, and a small blue backpack';
  const world = template.world;

  return {
    title_en: `${heroName} ${template.titleEn}`,
    title_th: `${heroName} ${template.titleTh}`,
    costume,
    world,
    pages: template.lines.map((text_en, index) => ({
      text_en,
      text_th: `${heroName}${template.thai[index]}`,
      image_prompt: `${template.scenes[index]}, in ${world}.${visualInterest}`,
    })),
    practice: {
      text_en: PHONICS_GROUP_2.practiceWords.join(' · '),
      text_th: `ฝึกผสมเสียง: ${PHONICS_GROUP_2.practiceWords.join(' · ')}`,
      image_prompt: `A playful end-of-book practice scene in ${world}: the hero child, one friendly cat, one happy hen, a red map marker, and a simple picture map arranged as clear spot illustrations, with generous empty space and no written text.`,
    },
  };
}

type PhonicsGroupConfig = (typeof PHONICS_GROUPS)[number];
type LaterTemplate = {
  titleEn: string;
  titleTh: string;
  keywords: RegExp;
  lines: readonly string[];
  thai: readonly string[];
  scenes: readonly string[];
  world: string;
};

function buildLaterGroupPlan(
  config: PhonicsGroupConfig,
  templates: readonly LaterTemplate[],
  childName: string,
  interestValue: unknown,
  costume: string,
  practiceScene: string,
): PhonicsStoryPlan {
  const interest = cleanInterest(interestValue);
  const template = selectLaterTemplate(templates, interest);
  const heroName = String(childName || 'My Hero').trim().slice(0, 50) || 'My Hero';
  const visualInterest = interest
    ? ` Gently include this parent-selected visual interest without adding written words: ${interest}.`
    : '';

  return {
    title_en: `${heroName} ${template.titleEn}`,
    title_th: `${heroName} ${template.titleTh}`,
    costume,
    world: template.world,
    pages: template.lines.map((text_en, index) => ({
      text_en,
      text_th: `${heroName}${template.thai[index]}`,
      image_prompt: `${template.scenes[index]}, in ${template.world}.${visualInterest}`,
    })),
    practice: {
      text_en: config.practiceWords.join(' · '),
      text_th: `ฝึกผสมเสียง: ${config.practiceWords.join(' · ')}`,
      image_prompt: `${practiceScene}, in ${template.world}, arranged as clear friendly spot illustrations with generous empty space and no written text.`,
    },
  };
}

export function buildGroup3PhonicsPlan(childName: string, interestValue?: unknown): PhonicsStoryPlan {
  return buildLaterGroupPlan(
    PHONICS_GROUP_3,
    GROUP_3_TEMPLATES,
    childName,
    interestValue,
    'a sunny yellow field jacket over a cream shirt, olive shorts, brown boots, and a small green satchel',
    'A playful end-of-book practice scene with the hero child, one friendly bug, a little pot, a soft rug, a log and a joyful sun motif',
  );
}

export function buildGroup4PhonicsPlan(childName: string, interestValue?: unknown): PhonicsStoryPlan {
  return buildLaterGroupPlan(
    PHONICS_GROUP_4,
    GROUP_4_TEMPLATES,
    childName,
    interestValue,
    'a sky-blue rain jacket over a cream shirt, rust-red shorts, yellow boots, and a small canvas bag',
    'A playful end-of-book practice scene with the hero child, gentle rain, a small boat, one pie, two happy feet and a friendly goat horn motif',
  );
}

export function buildGroup5PhonicsPlan(childName: string, interestValue?: unknown): PhonicsStoryPlan {
  return buildLaterGroupPlan(
    PHONICS_GROUP_5,
    GROUP_5_TEMPLATES,
    childName,
    interestValue,
    'a bright pink vest over a white shirt, denim shorts, striped socks, and white sneakers',
    'A playful end-of-book practice scene with the hero child, a kind king, a pink vest, a picture book on wood and a glowing moon',
  );
}

export function buildGroup6PhonicsPlan(childName: string, interestValue?: unknown): PhonicsStoryPlan {
  return buildLaterGroupPlan(
    PHONICS_GROUP_6,
    GROUP_6_TEMPLATES,
    childName,
    interestValue,
    'a violet explorer tunic over a cream shirt, tan shorts, sturdy boots, and a cheerful yellow scarf',
    'A playful end-of-book practice scene with the hero child, a fluffy yak, a plain box, one crisp chip, a tiny shop and a friendly moth',
  );
}

export function buildGroup7PhonicsPlan(childName: string, interestValue?: unknown): PhonicsStoryPlan {
  return buildLaterGroupPlan(
    PHONICS_GROUP_7,
    GROUP_7_TEMPLATES,
    childName,
    interestValue,
    'a teal story explorer coat over a cream shirt, navy shorts, red boots, and a small golden shoulder bag',
    'A playful end-of-book practice scene with the hero child, one shiny coin, a blue ribbon, a red barn, a listening ear motif and a wooden chair',
  );
}

export function getPhonicsGroup(group: unknown) {
  const id = Number(group || 1);
  return PHONICS_GROUPS.find((config) => config.id === id) || null;
}

export function buildPhonicsPlan(group: SupportedPhonicsGroup, childName: string, interestValue?: unknown): PhonicsStoryPlan {
  switch (group) {
    case 2: return buildGroup2PhonicsPlan(childName, interestValue);
    case 3: return buildGroup3PhonicsPlan(childName, interestValue);
    case 4: return buildGroup4PhonicsPlan(childName, interestValue);
    case 5: return buildGroup5PhonicsPlan(childName, interestValue);
    case 6: return buildGroup6PhonicsPlan(childName, interestValue);
    case 7: return buildGroup7PhonicsPlan(childName, interestValue);
    default: return buildGroup1PhonicsPlan(childName, interestValue);
  }
}

function validateEnglishWithWords(
  lines: string[],
  allowedWords: ReadonlySet<string>,
  expectedPages?: number,
): PhonicsValidation {
  const invalidWords = new Set<string>();
  const issues: string[] = [];
  if (expectedPages !== undefined && lines.length !== expectedPages) {
    issues.push(`Expected ${expectedPages} pages, received ${lines.length}`);
  }
  lines.forEach((line, index) => {
    if (!String(line || '').trim()) issues.push(`Page ${index + 1} is empty`);
    const words = String(line || '').toLowerCase().match(/[a-z]+/g) || [];
    if (words.length > 8) issues.push(`Page ${index + 1} has more than 8 words`);
    for (const word of words) if (!allowedWords.has(word)) invalidWords.add(word);
  });
  if (invalidWords.size) issues.push(`Out-of-level words: ${[...invalidWords].join(', ')}`);
  return { valid: issues.length === 0, invalidWords: [...invalidWords], issues };
}

export function validateGroup1English(lines: string[], expectedPages?: number): PhonicsValidation {
  return validateEnglishWithWords(lines, GROUP_1_WORDS, expectedPages);
}

export function validateGroup2English(lines: string[], expectedPages?: number): PhonicsValidation {
  return validateEnglishWithWords(lines, GROUP_2_WORDS, expectedPages);
}

export function validateGroup3English(lines: string[], expectedPages?: number): PhonicsValidation {
  return validateEnglishWithWords(lines, GROUP_3_WORDS, expectedPages);
}

export function validateGroup4English(lines: string[], expectedPages?: number): PhonicsValidation {
  return validateEnglishWithWords(lines, GROUP_4_WORDS, expectedPages);
}

export function validateGroup5English(lines: string[], expectedPages?: number): PhonicsValidation {
  return validateEnglishWithWords(lines, GROUP_5_WORDS, expectedPages);
}

export function validateGroup6English(lines: string[], expectedPages?: number): PhonicsValidation {
  return validateEnglishWithWords(lines, GROUP_6_WORDS, expectedPages);
}

export function validateGroup7English(lines: string[], expectedPages?: number): PhonicsValidation {
  return validateEnglishWithWords(lines, GROUP_7_WORDS, expectedPages);
}

export function validatePhonicsEnglish(group: SupportedPhonicsGroup, lines: string[], expectedPages?: number): PhonicsValidation {
  const allowedWords: Record<SupportedPhonicsGroup, ReadonlySet<string>> = {
    1: GROUP_1_WORDS,
    2: GROUP_2_WORDS,
    3: GROUP_3_WORDS,
    4: GROUP_4_WORDS,
    5: GROUP_5_WORDS,
    6: GROUP_6_WORDS,
    7: GROUP_7_WORDS,
  };
  return validateEnglishWithWords(lines, allowedWords[group], expectedPages);
}

export function phonicsTargetSegments(group: unknown, text: string): { text: string; target: boolean }[] {
  const sounds = [...(getPhonicsGroup(group)?.graphemes || PHONICS_GROUP_1.graphemes)]
    .sort((a, b) => b.length - a.length)
    .map((sound) => sound.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const exactTarget = new RegExp(`^(?:${sounds.join('|')})$`, 'i');
  return String(text || '')
    .split(new RegExp(`(${sounds.join('|')})`, 'gi'))
    .filter((chunk) => chunk.length > 0)
    .map((chunk) => ({ text: chunk, target: exactTarget.test(chunk) }));
}

export function isGroup1PracticePage(text: string): boolean {
  return String(text || '').trim().toLowerCase() === PHONICS_GROUP_1.practiceWords.join(' · ');
}

export function isGroup2PracticePage(text: string): boolean {
  return String(text || '').trim().toLowerCase() === PHONICS_GROUP_2.practiceWords.join(' · ');
}

export function isPhonicsPracticePage(group: SupportedPhonicsGroup, text: string): boolean {
  const config = getPhonicsGroup(group);
  return Boolean(config && String(text || '').trim().toLowerCase() === config.practiceWords.join(' · '));
}
