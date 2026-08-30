// Custom-story building blocks: worlds (settings), sidekick friends, and
// kid-friendly villains. Each has a visual descriptor (`prompt`) that gets woven
// into the writer prompt AND embedded verbatim in page image_prompts so the
// character/setting stays visually consistent across every page.
// English names double as vocabulary words for Thai kids learning English.

export interface StoryElement {
  id: string;
  nameTh: string;
  nameEn: string;
  /** Emoji fallback shown until the preview image exists */
  emoji: string;
  /** Visual descriptor used in writer + image prompts for cross-page consistency */
  prompt: string;
  /** Preview thumbnail shown in the picker */
  preview: string;
}

export const WORLDS: StoryElement[] = [
  {
    id: 'chocolate',
    nameTh: 'โลกช็อกโกแลต',
    nameEn: 'Chocolate World',
    prompt: 'a magical chocolate world with a flowing milk-chocolate river, a candy bridge, lollipop trees, gumdrop hills and cotton-candy clouds',
    emoji: '🍫',
    preview: '/legacy/8d21039e-2ebb-4847-93de-0ff2badfb3fb-storyhero-el-world-chocolate.png',
  },
  {
    id: 'dinosaur',
    nameTh: 'ดินแดนไดโนเสาร์',
    nameEn: 'Dinosaur Land',
    prompt: 'a lush prehistoric dinosaur valley with giant ferns, a gentle puffing volcano in the distance, huge dinosaur footprints and a sparkling waterfall',
    emoji: '🦕',
    preview: '/legacy/888905aa-61c4-4e46-b938-5faf663ca9c4-storyhero-el-world-dinosaur.png',
  },
  {
    id: 'future-city',
    nameTh: 'เมืองแห่งอนาคต',
    nameEn: 'Future City',
    prompt: 'a bright futuristic city with shiny rounded skyscrapers, flying bubble cars on light trails, friendly holograms and floating gardens',
    emoji: '🌆',
    preview: '/legacy/aec72810-7463-4979-8a9c-7f5462fa74cb-storyhero-el-world-future-city.png',
  },
  {
    id: 'underwater',
    nameTh: 'อาณาจักรใต้ทะเล',
    nameEn: 'Underwater Kingdom',
    prompt: 'a glowing underwater kingdom with a pearl-and-coral castle, colorful tropical fish, swaying sea-plants and sunbeams through turquoise water',
    emoji: '🐠',
    preview: '/legacy/61009921-38bb-4145-9aa3-86d2a255f825-storyhero-el-world-underwater.png',
  },
  {
    id: 'space',
    nameTh: 'อวกาศสุดหรรษา',
    nameEn: 'Outer Space',
    prompt: 'friendly outer space with a cute ringed purple planet, colorful asteroids, twinkling stars, a soft glowing nebula and a smiling crescent moon',
    emoji: '🪐',
    preview: '/legacy/e6f7e9dd-4a5b-4080-bbec-9edca467e4bc-storyhero-el-world-space.png',
  },
  {
    id: 'enchanted-forest',
    nameTh: 'ป่ามหัศจรรย์',
    nameEn: 'Enchanted Forest',
    prompt: 'an enchanted fairytale forest with giant glowing mushrooms, fireflies, mossy winding paths and tiny doors in big oak trees',
    emoji: '🍄',
    preview: '/legacy/c54bd8cf-b152-4b4c-ac9f-9d488aac8f86-storyhero-el-world-enchanted-forest.png',
  },
  {
    id: 'pirate-island',
    nameTh: 'เกาะโจรสลัด',
    nameEn: 'Pirate Island',
    prompt: 'a fun pirate treasure island with a golden beach, half-buried treasure chests, palm trees and a friendly pirate ship with colorful sails in the bay',
    emoji: '🏴‍☠️',
    preview: '/legacy/b51a92b3-0bae-4a84-b398-b9019d332bf0-storyhero-el-world-pirate-island.png',
  },
  {
    id: 'ice-kingdom',
    nameTh: 'อาณาจักรน้ำแข็ง',
    nameEn: 'Ice Kingdom',
    prompt: 'a sparkling ice kingdom with a crystal ice palace, glowing turquoise towers, snowy hills, northern lights and gentle falling snowflakes',
    emoji: '❄️',
    preview: '/legacy/a87c6ff2-a797-46be-b09e-2d7c41fa97ae-storyhero-el-world-ice-kingdom.png',
  },
];

export const FRIENDS: StoryElement[] = [
  {
    id: 'baby-dragon',
    nameTh: 'มังกรน้อย',
    nameEn: 'Baby Dragon',
    prompt: 'a tiny round baby dragon with mint-green scales, small flappy wings, big golden eyes and a happy toothy smile',
    emoji: '🐉',
    preview: '/legacy/d397fcc5-4fd4-4b30-a580-c9323f02565e-storyhero-el-friend-baby-dragon.png',
  },
  {
    id: 'robot-buddy',
    nameTh: 'หุ่นยนต์จอมเปิ่น',
    nameEn: 'Silly Robot',
    prompt: 'a silly friendly little robot with a round boxy orange-and-white body, one wobbly antenna with a glowing bulb and big curious blue LED eyes',
    emoji: '🤖',
    preview: '/legacy/ec7dd82b-10a2-4679-961d-b97952ab1d01-storyhero-el-friend-robot-buddy.png',
  },
  {
    id: 'talking-puppy',
    nameTh: 'ลูกหมาพูดได้',
    nameEn: 'Talking Puppy',
    prompt: 'an adorable fluffy golden puppy with floppy ears, huge sparkling brown eyes and a tiny red bandana',
    emoji: '🐶',
    preview: '/legacy/22cca276-57f9-46a8-b236-f17f4d2a7e5b-storyhero-el-friend-talking-puppy.png',
  },
  {
    id: 'unicorn',
    nameTh: 'ยูนิคอร์นวิเศษ',
    nameEn: 'Magical Unicorn',
    prompt: 'a small magical unicorn foal with a pearly white coat, pastel rainbow mane and tail, and a sparkling golden spiral horn',
    emoji: '🦄',
    preview: '/legacy/07bdadee-d70f-4e78-857c-7087a2b01f5d-storyhero-el-friend-unicorn.png',
  },
  {
    id: 'wise-owl',
    nameTh: 'นกฮูกนักปราชญ์',
    nameEn: 'Wise Owl',
    prompt: 'a wise round owl with fluffy brown-and-cream feathers, big amber eyes behind tiny round glasses, carrying a tiny book under one wing',
    emoji: '🦉',
    preview: '/legacy/553a289f-f82d-4f56-91fa-8ae4c59524a2-storyhero-el-friend-wise-owl.png',
  },
  {
    id: 'cheeky-monkey',
    nameTh: 'ลิงจอมซน',
    nameEn: 'Cheeky Monkey',
    prompt: 'a cheeky little brown monkey with a big mischievous grin and a long curly tail, often carrying a banana',
    emoji: '🐵',
    preview: '/legacy/c0f43898-76e0-4307-a11b-d9912f44c228-storyhero-el-friend-cheeky-monkey.png',
  },
  {
    id: 'tiny-fairy',
    nameTh: 'นางฟ้าตัวจิ๋ว',
    nameEn: 'Tiny Fairy',
    prompt: 'a tiny glowing fairy with shimmering dragonfly wings, a dress made of flower petals and a little star wand trailing golden sparkle dust',
    emoji: '🧚',
    preview: '/legacy/c844d9fe-f081-4992-8f11-77b09918a391-storyhero-el-friend-tiny-fairy.png',
  },
  {
    id: 'brave-teddy',
    nameTh: 'หมีเท็ดดี้ผู้กล้า',
    nameEn: 'Brave Teddy',
    prompt: 'a brave plush teddy bear with honey-colored fur, a tiny knight helmet, a wooden toy sword and a stitched smile',
    emoji: '🧸',
    preview: '/legacy/b4295271-5edf-47aa-853a-699edd20c31a-storyhero-el-friend-brave-teddy.png',
  },
];

export const VILLAINS: StoryElement[] = [
  {
    id: 'grumpy-dragon',
    nameTh: 'มังกรขี้หงุดหงิด',
    nameEn: 'Grumpy Dragon',
    prompt: 'a big grumpy but harmless dragon with purple scales, comically oversized grumpy eyebrows, crossed arms and smoke rings from his nostrils',
    emoji: '🐲',
    preview: '/legacy/86474597-5b22-43f8-9d7b-b01028c997f6-storyhero-el-villain-grumpy-dragon.png',
  },
  {
    id: 'sneaky-pirate',
    nameTh: 'กัปตันโจรสลัดเจ้าเล่ห์',
    nameEn: 'Sneaky Pirate',
    prompt: 'a sneaky cartoon pirate captain with a huge feathered hat, a twirly curly mustache, striped socks and a tiny eye-rolling parrot on his shoulder',
    emoji: '🦜',
    preview: '/legacy/ef7e4bed-7034-4c45-859b-13d9d414878b-storyhero-el-villain-sneaky-pirate.png',
  },
  {
    id: 'silly-witch',
    nameTh: 'แม่มดจอมเปิ่น',
    nameEn: 'Silly Witch',
    prompt: 'a silly clumsy witch with a crooked purple hat far too big for her head, mismatched striped stockings and a wobbly broom she rides backwards',
    emoji: '🧙‍♀️',
    preview: '/legacy/2db392b8-c649-44c6-8b19-dd6b6ff25340-storyhero-el-villain-silly-witch.png',
  },
  {
    id: 'giant-troll',
    nameTh: 'โทรลล์ขี้บ่น',
    nameEn: 'Grumbly Troll',
    prompt: 'a big round grumbling troll with mossy green skin, a cute underbite and a tiny flower growing on his head that he does not know about',
    emoji: '🧌',
    preview: '/legacy/9931d9ed-72d5-4beb-b5da-76102659484d-storyhero-el-villain-giant-troll.png',
  },
  {
    id: 'naughty-robot',
    nameTh: 'หุ่นยนต์ตัวแสบ',
    nameEn: 'Naughty Robot',
    prompt: 'a naughty little robot with a dented tin body, one googly eye bigger than the other, a sparking antenna and a remote control with too many buttons',
    emoji: '⚙️',
    preview: '/legacy/573db314-e533-43a1-9e47-022eb34c2601-storyhero-el-villain-naughty-robot.png',
  },
  {
    id: 'greedy-king',
    nameTh: 'ราชาจอมงก',
    nameEn: 'Greedy King',
    prompt: 'a short round greedy king with a crown far too big sliding over his eyes, hugging a pile of gold coins and sweets with a pouty spoiled expression',
    emoji: '👑',
    preview: '/legacy/91a9d134-1d01-4729-a1d0-0824e21961c5-storyhero-el-villain-greedy-king.png',
  },
  {
    id: 'tricky-fox',
    nameTh: 'จิ้งจอกเจ้าเล่ห์',
    nameEn: 'Tricky Fox',
    prompt: 'a tricky elegant orange fox with a sly smile, a fancy purple vest, a monocle and one eyebrow permanently raised',
    emoji: '🦊',
    preview: '/legacy/2a738d55-ad88-4b7c-8686-dfc5f7cc6b28-storyhero-el-villain-tricky-fox.png',
  },
  {
    id: 'giggly-ghost',
    nameTh: 'ผีน้อยขี้เล่น',
    nameEn: 'Giggly Ghost',
    prompt: 'a tiny friendly ghost shaped like a soft round white blob, with rosy cheeks, always giggling behind its little hands, completely cute and not scary',
    emoji: '👻',
    preview: '/legacy/d1a7d40f-6ab3-4d4c-8aa4-03836c200f7d-storyhero-el-villain-giggly-ghost.png',
  },
];

export function getElement(list: StoryElement[], id: string | null | undefined): StoryElement | undefined {
  if (!id) return undefined;
  return list.find((e) => e.id === id);
}
