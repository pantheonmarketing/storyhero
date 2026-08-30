// Classic public-domain stories catalog. Shared between worker (generation) and frontend (picker).

export interface Story {
  id: string;
  cover: string; // real illustrated cover art (generated, not an emoji)
  titleTh: string;
  titleEn: string;
  taglineTh: string;
  taglineEn: string;
  moralTh: string;
  moralEn: string;
  // English synopsis used to steer the AI writer
  synopsis: string;
  // Visual world hints for the illustrator prompts
  world: string;
  // Suggested hero costume, kept identical on every page for consistency
  costume: string;
}

export const PAGE_COUNT = 10; // story pages, plus a cover (index 0)

export const STORIES: Story[] = [
  {
    id: 'cinderella',
    cover: '/legacy/046432ab-9714-4157-960f-c4066d7fd9de-storyhero-cover2-cinderella.png',
    titleTh: 'ซินเดอเรลล่า',
    titleEn: 'Cinderella',
    taglineTh: 'จากเถ้าถ่านสู่งานเต้นรำในวัง',
    taglineEn: 'From cinders to the royal ball',
    moralTh: 'ความดีและใจที่งดงามจะได้รับสิ่งดีตอบแทนเสมอ',
    moralEn: 'Kindness and a good heart are always rewarded',
    synopsis:
      'The classic Cinderella tale: a kind child treated unfairly at home, a magical helper, a grand royal ball, a lost slipper at midnight, and a happy ending where kindness is recognized and rewarded.',
    world: 'a fairytale kingdom with a grand castle, pumpkin carriage, sparkling ballroom, starry night sky',
    costume: 'a sparkling royal-blue ball outfit with tiny glass slippers',
  },
  {
    id: 'red-riding-hood',
    cover: '/legacy/cb183693-b094-4b42-88c2-8e8c051d93ce-storyhero-cover2-red-riding-hood.png',
    titleTh: 'หนูน้อยหมวกแดง',
    titleEn: 'Little Red Riding Hood',
    taglineTh: 'การผจญภัยในป่าใหญ่สู่บ้านคุณยาย',
    taglineEn: 'Through the woods to Grandma\'s house',
    moralTh: 'ฟังคำเตือนของผู้ใหญ่ และระวังคนแปลกหน้า',
    moralEn: 'Listen to your elders and be careful with strangers',
    synopsis:
      'Little Red Riding Hood: a child carries a basket of treats through the forest to visit Grandma, meets a sly wolf, discovers the wolf in disguise, and is saved by a brave woodcutter. Gentle, non-scary version for young children.',
    world: 'a sunny European forest with wildflowers, a cozy cottage, friendly forest animals',
    costume: 'a bright red hooded cape over a cream outfit, carrying a wicker basket',
  },
  {
    id: 'three-pigs',
    cover: '/legacy/cd6bb33a-5a50-46a0-9821-205e79085dce-storyhero-cover2-three-pigs.png',
    titleTh: 'ลูกหมูสามตัว',
    titleEn: 'The Three Little Pigs',
    taglineTh: 'สร้างบ้านให้แข็งแรงไว้สู้หมาป่า',
    taglineEn: 'Build it strong against the wolf',
    moralTh: 'ความขยันและรอบคอบทำให้เราปลอดภัย',
    moralEn: 'Hard work and planning keep us safe',
    synopsis:
      'The Three Little Pigs, where the hero child helps the three pigs: houses of straw, sticks and bricks, a huffing-puffing wolf, and the lesson that careful hard work wins. The hero is the clever builder friend of the pigs.',
    world: 'rolling green countryside, three little houses of straw, sticks and brick, blue skies',
    costume: 'cute denim overalls with a little builder\'s hat',
  },
  {
    id: 'tortoise-hare',
    cover: '/legacy/d9d7184e-b0f4-44bd-b532-cd4f9be2467b-storyhero-cover2-tortoise-hare.png',
    titleTh: 'กระต่ายกับเต่า',
    titleEn: 'The Tortoise and the Hare',
    taglineTh: 'ช้าแต่ชัวร์ ชนะใจทั้งป่า',
    taglineEn: 'Slow and steady wins the race',
    moralTh: 'ความพยายามสม่ำเสมอชนะความประมาท',
    moralEn: 'Steady effort beats careless talent',
    synopsis:
      'Aesop\'s Tortoise and the Hare: the hero child referees and joins the famous race between a boastful hare and a patient tortoise, learning that steady effort wins. The hero cheers the tortoise and celebrates with all the animals.',
    world: 'a bright forest racetrack with cheering woodland animals, banners and a finish line',
    costume: 'a sporty outfit with a race-day sash and a tiny whistle',
  },
  {
    id: 'jack-beanstalk',
    cover: '/legacy/9e91563d-a8de-4ca6-bcce-a8050cef90a1-storyhero-cover2-jack-beanstalk.png',
    titleTh: 'ต้นถั่ววิเศษ',
    titleEn: 'Jack and the Beanstalk',
    taglineTh: 'ปีนต้นถั่วยักษ์สู่ปราสาทบนก้อนเมฆ',
    taglineEn: 'Climb the beanstalk to the castle in the clouds',
    moralTh: 'ความกล้าหาญและไหวพริบช่วยแก้ปัญหาได้',
    moralEn: 'Courage and cleverness solve big problems',
    synopsis:
      'Jack and the Beanstalk with the hero child as Jack: magic beans, a giant beanstalk to the clouds, a castle with a giant, a golden goose, a clever escape, and helping their family. Friendly, adventurous tone; the giant ends up learning to share.',
    world: 'a giant green beanstalk rising through fluffy clouds to a golden castle in the sky',
    costume: 'an adventurer\'s green tunic with a small satchel of magic beans',
  },
  {
    id: 'ugly-duckling',
    cover: '/legacy/222e89c0-5e1a-4b9e-acf7-fd6c7d2a5ab2-storyhero-cover2-ugly-duckling.png',
    titleTh: 'ลูกเป็ดขี้เหร่',
    titleEn: 'The Ugly Duckling',
    taglineTh: 'ทุกคนมีความงามในแบบของตัวเอง',
    taglineEn: 'Everyone is beautiful in their own way',
    moralTh: 'จงภูมิใจในตัวเอง เพราะทุกคนพิเศษในแบบของตัวเอง',
    moralEn: 'Be proud of who you are — everyone is special',
    synopsis:
      'The Ugly Duckling with the hero child as the duckling\'s best friend: a little duckling who looks different, feels left out, and the hero stands by them through seasons until the duckling becomes a beautiful swan. About kindness, self-worth and friendship.',
    world: 'a peaceful farm pond through the seasons, golden reeds, gentle lake with swans',
    costume: 'a soft yellow raincoat and little boots',
  },
  {
    id: 'sang-thong',
    cover: '/legacy/25e696ea-610b-4e79-a73c-42097fa78be3-storyhero-cover2-sang-thong.png',
    titleTh: 'สังข์ทอง',
    titleEn: 'Sang Thong (The Golden Conch)',
    taglineTh: 'วรรณคดีไทยคลาสสิก เจ้าชายในหอยสังข์',
    taglineEn: 'The Thai classic of the prince in the conch shell',
    moralTh: 'อย่าตัดสินใครจากภายนอก คุณค่าแท้อยู่ที่ใจ',
    moralEn: 'Never judge by appearances — true worth is within',
    synopsis:
      'The beloved Thai folk tale Sang Thong: the hero child is born inside a golden conch shell, hides a golden radiant form under a humble disguise (Chao Ngo), proves their goodness through trials, wins the heart of Princess Rodjana, and is finally revealed in golden splendor. Thai royal fairy-tale setting.',
    world: 'a Thai kingdom with golden temples, traditional Thai palaces, lotus ponds, glowing golden light',
    costume: 'traditional Thai golden royal attire (chut thai) with a golden conch shell motif',
  },
  {
    id: 'pla-boo-thong',
    cover: '/legacy/3f24427a-b4b7-4eba-831e-49460e05cd12-storyhero-cover2-pla-boo-thong.png',
    titleTh: 'ปลาบู่ทอง',
    titleEn: 'Pla Boo Thong (The Golden Goby)',
    taglineTh: 'นิทานพื้นบ้านไทย ความกตัญญูและใจดี',
    taglineEn: 'The Thai folk tale of the golden fish',
    moralTh: 'ความกตัญญูและความดีจะคุ้มครองเราเสมอ',
    moralEn: 'Gratitude and goodness always protect us',
    synopsis:
      'The Thai folk tale Pla Boo Thong (Thai Cinderella): the kind hero child Euay whose mother\'s spirit lives on in a golden goby fish, then a bodhi tree; treated unfairly at home but protected by love and goodness, until the truth shines and the hero is honored at the royal palace. Gentle version for young children.',
    world: 'a Thai riverside village, golden fish in a clear pond, bodhi tree with heart-shaped leaves, Thai palace',
    costume: 'traditional Thai village dress in warm gold and cream tones',
  },
  {
    id: 'snow-white',
    cover: '/legacy/f47e39f0-90fe-426b-9245-6bc1220faa4f-storyhero-cover2-snow-white.png',
    titleTh: 'สโนว์ไวท์กับคนแคระทั้งเจ็ด',
    titleEn: 'Snow White and the Seven Dwarfs',
    taglineTh: 'มิตรภาพในกระท่อมกลางป่ากับคนแคระทั้งเจ็ด',
    taglineEn: 'Friendship in the forest with seven little friends',
    moralTh: 'ใจดีต่อผู้อื่น แล้วมิตรแท้จะอยู่เคียงข้างเราเสมอ',
    moralEn: 'Be kind, and true friends will always stand by you',
    synopsis:
      'The classic Snow White folk tale, gently retold: the kind hero child must leave the palace, finds a cozy cottage of seven friendly dwarfs, wins their hearts by helping and caring, faces the jealous queen\'s trick with a magic apple, and is awakened by the love of true friends. Gentle non-scary version where kindness and friendship save the day.',
    world: 'a deep friendly forest with a cozy seven-bed cottage, woodland animals, a distant castle',
    costume: 'a forest-green and cream dress with a red hair ribbon',
  },
  {
    id: 'sleeping-beauty',
    cover: '/legacy/48d7629d-ad89-460a-bb1d-1295d54b42d8-storyhero-cover2-sleeping-beauty.png',
    titleTh: 'เจ้าหญิงนิทรา',
    titleEn: 'Sleeping Beauty',
    taglineTh: 'คำอวยพรของเหล่านางฟ้ากับปราสาทกุหลาบ',
    taglineEn: 'Fairy blessings and the castle of roses',
    moralTh: 'ความรักและความกล้าหาญปลุกทุกสิ่งให้ตื่นได้',
    moralEn: 'Love and courage can awaken anything',
    synopsis:
      'The Sleeping Beauty folk tale with the hero child at its heart: fairy blessings at a royal celebration, a forgotten fairy\'s spell, a hundred-year sleep behind walls of roses, and the brave, kind-hearted hero whose courage breaks the spell and wakes the whole castle with joy. Gentle version for young children.',
    world: 'an enchanted castle wrapped in blooming rose vines, sparkling fairy light, a golden dawn',
    costume: 'a rose-pink gown with a tiny golden tiara',
  },
  {
    id: 'rapunzel',
    cover: '/legacy/60c30e19-29dd-4cde-ac76-8d9ae7973ae7-storyhero-cover2-rapunzel.png',
    titleTh: 'ราพันเซล',
    titleEn: 'Rapunzel',
    taglineTh: 'ผมทองยาวสุดสายตากับหอคอยสูงเสียดฟ้า',
    taglineEn: 'The longest golden hair and the tallest tower',
    moralTh: 'ไม่มีหอคอยใดสูงเกินกว่าความหวังและความกล้า',
    moralEn: 'No tower is taller than hope and courage',
    synopsis:
      'The Rapunzel folk tale gently retold: the hero child with wonderfully long golden hair lives in a tall tower, dreams of the world outside, makes a brave plan, befriends visitors who climb the golden braid, and finally steps into the wide bright world where family and freedom are waiting. Hopeful, gentle version.',
    world: 'a tall stone tower in a flower valley, floating lanterns at twilight, a bright kingdom beyond',
    costume: 'a lavender dress with an impossibly long golden braid woven with flowers',
  },
  {
    id: 'hansel-gretel',
    cover: '/legacy/0b71dead-4d21-46fd-9793-ef27bff53232-storyhero-cover2-hansel-gretel.png',
    titleTh: 'ฮันเซลกับเกรเทล',
    titleEn: 'Hansel and Gretel',
    taglineTh: 'บ้านขนมหวานกลางป่ากับไหวพริบของพี่น้อง',
    taglineEn: 'The candy cottage and two clever siblings',
    moralTh: 'สติและความรักของพี่น้องพาเรากลับบ้านได้เสมอ',
    moralEn: 'Clever thinking and family love always lead us home',
    synopsis:
      'The Hansel and Gretel folk tale, gently retold: the hero child and their sibling find a wonderful cottage made of gingerbread and candy in the forest, discover its grumpy owner\'s tricky plan, use clever thinking and teamwork to escape safely, and follow a trail of pebbles home to a warm family hug. Non-scary version focused on cleverness and sibling love.',
    world: 'a sunlit forest with a gingerbread cottage of candy canes and frosting, pebble paths, friendly birds',
    costume: 'cozy forest clothes with a little satchel of pebbles and breadcrumbs',
  },
  {
    id: 'little-mermaid',
    cover: '/legacy/013bdcb8-39d3-4b6e-8d76-50106a28a461-storyhero-cover2-little-mermaid.png',
    titleTh: 'เงือกน้อย',
    titleEn: 'The Little Mermaid',
    taglineTh: 'โลกใต้ทะเลสีครามกับความฝันบนฝั่ง',
    taglineEn: 'A turquoise sea world and a dream on land',
    moralTh: 'จงกล้าตามความฝัน แต่อย่าลืมว่าเราเป็นใคร',
    moralEn: 'Chase your dreams, but never forget who you are',
    synopsis:
      'Andersen\'s little mermaid tale, gently and happily retold: the hero child is a young mermaid who dreams of the world above the waves, explores it bravely, learns that home and family under the sea love them just as they are, and finds a way to belong to both worlds. Warm ending version for young children.',
    world: 'a glowing coral kingdom under a turquoise sea, friendly dolphins and fish, a sunny shore above',
    costume: 'a shimmering teal mermaid tail with a seashell necklace',
  },
  {
    id: 'pinocchio',
    cover: '/legacy/702891f7-0661-4d70-ae9e-9131f7b37a0d-storyhero-cover2-pinocchio.png',
    titleTh: 'พิน็อกคิโอ',
    titleEn: 'Pinocchio',
    taglineTh: 'หุ่นไม้ที่อยากเป็นเด็กจริง ๆ',
    taglineEn: 'The wooden puppet who dreamed of being real',
    moralTh: 'ความซื่อสัตย์ทำให้เราเป็น "ตัวจริง" ในทุกเรื่อง',
    moralEn: 'Honesty is what makes us truly real',
    synopsis:
      'Collodi\'s Pinocchio gently retold: the hero child is a wooden puppet carved by a kind toymaker, whose nose grows with every fib, journeys through tempting adventures with a wise cricket friend, learns to choose honesty and courage, and earns the greatest wish — becoming a real child. Focus on honesty, gentle version.',
    world: 'a warm Italian toymaker workshop, a puppet theatre, a big blue sea adventure',
    costume: 'a cheerful puppet outfit with a red hat and blue bow tie',
  },
  {
    id: 'goldilocks',
    cover: '/legacy/473ba54c-f19f-4fed-be6e-dc6ed30c22a0-storyhero-cover2-goldilocks.png',
    titleTh: 'โกลดิล็อกส์กับหมีสามตัว',
    titleEn: 'Goldilocks and the Three Bears',
    taglineTh: 'ข้าวโอ๊ตสามชาม เก้าอี้สามตัว เตียงสามหลัง',
    taglineEn: 'Three bowls, three chairs, three beds',
    moralTh: 'เคารพของของผู้อื่น และกล้าขอโทษเมื่อทำผิด',
    moralEn: 'Respect others\' things — and be brave enough to say sorry',
    synopsis:
      'The Goldilocks folk tale gently retold: the curious hero child wanders into a cozy cottage in the woods, tries the porridge, chairs and beds of a bear family, is discovered fast asleep, apologizes sincerely, helps fix what was broken, and becomes the bear family\'s dearest friend. Friendly, funny, non-scary version about respect and saying sorry.',
    world: 'a cozy bear-family cottage in a sunny wood, steaming porridge bowls, comfy chairs and beds',
    costume: 'a simple country dress with golden curls and a small basket',
  },
  {
    id: 'puss-in-boots',
    cover: '/legacy/31fa9ae9-2441-4275-b08c-0c37b5b5eb11-storyhero-cover2-puss-in-boots.png',
    titleTh: 'แมวเหมียวรองเท้าบู๊ต',
    titleEn: 'Puss in Boots',
    taglineTh: 'เจ้าเหมียวเจ้าปัญญากับรองเท้าบู๊ตสีแดง',
    taglineEn: 'The cleverest cat in little red boots',
    moralTh: 'ไหวพริบและความภักดีมีค่ากว่าทรัพย์สมบัติ',
    moralEn: 'Wit and loyalty are worth more than any treasure',
    synopsis:
      'The Puss in Boots folk tale: the hero child inherits nothing but a clever talking cat, who dons fine boots and uses brilliant tricks and bold charm to win fields, a castle and the king\'s friendship for the child — proving a loyal clever friend is the greatest inheritance of all. Playful, witty version.',
    world: 'rolling French countryside, wheat fields, a grand castle, a royal carriage on a country road',
    costume: 'simple miller\'s clothes upgraded scene by scene to fine noble dress',
  },
  {
    id: 'gingerbread-man',
    cover: '/legacy/732d07e6-7e4d-4fc0-b974-6b84352aa6ab-storyhero-cover2-gingerbread-man.png',
    titleTh: 'ขนมปังขิงจอมซน',
    titleEn: 'The Gingerbread Man',
    taglineTh: 'วิ่งให้ทันเจ้าคุกกี้จอมซนถ้าทำได้!',
    taglineEn: 'Run, run, as fast as you can!',
    moralTh: 'ความมั่นใจเป็นสิ่งดี แต่อย่าประมาทและหลงตัวเอง',
    moralEn: 'Confidence is great — overconfidence is not',
    synopsis:
      'The Gingerbread Man folk tale, gently and funnily retold: the hero child bakes a gingerbread cookie that leaps up and runs away, leads the whole farm on a hilarious chase, nearly gets tricked by a sly fox, and is saved by the quick-thinking hero — then everyone shares warm cookies together. Funny chase story with a happy ending.',
    world: 'a warm country bakery and sunny farm lanes, chasing farm animals, a river with a sly fox',
    costume: 'a baker\'s apron dusted with flour and a whisk in the pocket',
  },
  {
    id: 'thumbelina',
    cover: '/legacy/16c40a32-c62e-47f0-9999-c15b404dcfd7-storyhero-cover2-thumbelina.png',
    titleTh: 'ธัมเบลิน่า เด็กน้อยจิ๋ว',
    titleEn: 'Thumbelina',
    taglineTh: 'การผจญภัยของเด็กน้อยตัวเท่านิ้วโป้ง',
    taglineEn: 'A thumb-sized child in a giant world',
    moralTh: 'ตัวเล็กแค่ไหนก็มีหัวใจที่ยิ่งใหญ่ได้',
    moralEn: 'Even the smallest person can have the biggest heart',
    synopsis:
      'Andersen\'s Thumbelina gently retold: the hero child, born tiny as a thumb from a magic flower, rides lily pads, escapes comic toads and beetles, warms a frozen swallow back to life through a long winter, and is carried by the grateful bird to a sunny kingdom of flower-fairies where they truly belong. About kindness and finding your place.',
    world: 'a giant garden world of tulips, lily-pad rivers, cozy mouse burrows, and a flower-fairy kingdom',
    costume: 'a petal dress with a walnut-shell bed and a dandelion umbrella',
  },
  {
    id: 'emperors-clothes',
    cover: '/legacy/f310ef51-2779-4554-8a8f-647d2c1caada-storyhero-cover2-emperors-clothes.png',
    titleTh: 'ฉลองพระองค์ใหม่ของพระราชา',
    titleEn: 'The Emperor\'s New Clothes',
    taglineTh: 'เด็กคนเดียวที่กล้าพูดความจริง',
    taglineEn: 'The one child brave enough to tell the truth',
    moralTh: 'กล้าพูดความจริง แม้จะเป็นคนเดียวที่พูด',
    moralEn: 'Dare to speak the truth, even if you\'re the only one',
    synopsis:
      'Andersen\'s tale of the emperor\'s new clothes: two tricksters convince a fashion-loving emperor they\'ve woven a magical suit invisible to fools, the whole city pretends to admire it, and only the honest hero child speaks the simple truth at the parade — teaching the emperor and the town to laugh at themselves and value honesty. Funny, gentle version.',
    world: 'a colorful royal city with tailor shops, a grand palace, a festive parade square with flags',
    costume: 'simple bright town clothes that stand out in the fancy crowd',
  },
  {
    id: 'wizard-of-oz',
    cover: '/legacy/173e1a48-7b9a-42ea-a9a7-017c7fedcc86-storyhero-cover2-wizard-of-oz.png',
    titleTh: 'พ่อมดมหัศจรรย์แห่งออซ',
    titleEn: 'The Wonderful Wizard of Oz',
    taglineTh: 'ถนนอิฐสีเหลืองสู่นครมรกต',
    taglineEn: 'Follow the yellow brick road to the Emerald City',
    moralTh: 'สิ่งที่เราตามหา มักอยู่ในตัวเราตั้งแต่แรกแล้ว',
    moralEn: 'What we search for is often inside us all along',
    synopsis:
      'Baum\'s Oz story retold for young children: a cyclone carries the hero child and their little dog to the magical land of Oz; along the yellow brick road they befriend a scarecrow seeking brains, a tin man seeking a heart and a lion seeking courage, outsmart a grumpy witch with kindness, and learn each friend had their gift inside all along — and that home is the dearest magic. Gentle adventure version.',
    world: 'the yellow brick road through emerald fields, poppy meadows, and the glittering green Emerald City',
    costume: 'a blue gingham dress with sparkling silver shoes and a small dog companion',
  },
  {
    id: 'alice-wonderland',
    cover: '/legacy/f85ebf1b-0ffa-4b21-aef2-aa1ae2615abe-storyhero-cover2-alice-wonderland.png',
    titleTh: 'อลิซในแดนมหัศจรรย์',
    titleEn: 'Alice in Wonderland',
    taglineTh: 'ตามกระต่ายขาวลงโพรงสู่โลกมหัศจรรย์',
    taglineEn: 'Down the rabbit hole to a wonder world',
    moralTh: 'ความอยากรู้อยากเห็นคือประตูสู่การเรียนรู้ไม่รู้จบ',
    moralEn: 'Curiosity opens doors to endless discovery',
    synopsis:
      'Carroll\'s Wonderland retold gently: the hero child follows a hurrying white rabbit down a rabbit hole into a topsy-turvy land of talking flowers, a grinning cat, a mad tea party and a card-castle queen; with curiosity, good manners and clever thinking the hero turns every puzzle into a game and wakes from the marvelous dream braver than before. Whimsical, non-scary version.',
    world: 'a whimsical wonderland of giant mushrooms, floating teacups, rose gardens and playing-card guards',
    costume: 'a blue dress with a white pinafore apron',
  },
  {
    id: 'snow-queen',
    cover: '/legacy/a9a2f218-0bff-40c5-83a9-51073606398d-storyhero-cover2-snow-queen.png',
    titleTh: 'ราชินีหิมะ',
    titleEn: 'The Snow Queen',
    taglineTh: 'การเดินทางผ่านดินแดนน้ำแข็งเพื่อช่วยเพื่อนรัก',
    taglineEn: 'A journey across the ice to save a best friend',
    moralTh: 'ความรักที่อบอุ่นละลายน้ำแข็งที่เย็นที่สุดได้',
    moralEn: 'Warm love can melt the coldest ice',
    synopsis:
      'Andersen\'s Snow Queen retold gently: when a sliver of enchanted ice makes the hero child\'s best friend cold-hearted and the Snow Queen carries the friend to her crystal palace, the brave hero journeys north through seasons and kingdoms, helped by a talking reindeer and kind strangers, and melts the ice with the warmth of true friendship. About loyalty and the power of a warm heart.',
    world: 'a journey from a cozy village through flower gardens and northern lights to a sparkling ice palace',
    costume: 'a warm red winter coat with white fur trim and cozy mittens',
  },
  {
    id: 'aladdin',
    cover: '/legacy/411fe8c9-f4f7-451d-8340-fa0a480d8cb4-storyhero-cover2-aladdin.png',
    titleTh: 'อะลาดินกับตะเกียงวิเศษ',
    titleEn: 'Aladdin and the Magic Lamp',
    taglineTh: 'ตะเกียงวิเศษ ยักษ์จินนี่ และพรมเหาะ',
    taglineEn: 'A magic lamp, a genie, and a flying carpet',
    moralTh: 'ความดีในใจสำคัญกว่าพรวิเศษใด ๆ',
    moralEn: 'A good heart matters more than any magic wish',
    synopsis:
      'The Arabian Nights tale of Aladdin, gently retold: the clever, kind hero child finds a dusty lamp in a sparkling cave, befriends a jolly genie, uses wishes to help family and neighbors rather than just themselves, outsmarts a greedy sorcerer, and learns that their kind heart — not the lamp — is the real treasure. Adventurous, generous-hearted version.',
    world: 'a moonlit desert city of domes and bazaars, a glittering treasure cave, magic carpet flights over dunes',
    costume: 'Arabian adventurer clothes with a small vest and a sash',
  },
  {
    id: 'ant-grasshopper',
    cover: '/legacy/32ad580f-021b-4e9a-80de-d993e9388179-storyhero-cover2-ant-grasshopper.png',
    titleTh: 'มดกับตั๊กแตน',
    titleEn: 'The Ant and the Grasshopper',
    taglineTh: 'ฤดูร้อนของเสียงเพลง ฤดูหนาวของบทเรียน',
    taglineEn: 'A summer of songs, a winter of lessons',
    moralTh: 'ขยันวันนี้ สบายวันหน้า และแบ่งปันเสมอ',
    moralEn: 'Work hard today, rest easy tomorrow — and always share',
    synopsis:
      'Aesop\'s ant and grasshopper fable, warmly retold: the hero child helps the busy ants store food all summer while a cheerful grasshopper plays music; when winter comes, the hero convinces the ants to welcome the shivering musician in — and the grasshopper repays them with songs that make the long winter joyful. About diligence AND generosity.',
    world: 'a golden summer meadow shrinking into a cozy winter burrow full of seeds and lanterns',
    costume: 'denim overalls with a tiny harvest basket',
  },
  {
    id: 'lion-mouse',
    cover: '/legacy/c4ca3a97-0284-40f1-85bf-b542ad5f1942-storyhero-cover2-lion-mouse.png',
    titleTh: 'ราชสีห์กับหนูน้อย',
    titleEn: 'The Lion and the Mouse',
    taglineTh: 'ผู้ยิ่งใหญ่ก็ต้องการเพื่อนตัวเล็ก ๆ',
    taglineEn: 'Even the mighty need tiny friends',
    moralTh: 'น้ำใจเล็ก ๆ อาจยิ่งใหญ่ที่สุดในวันสำคัญ',
    moralEn: 'A small kindness can become the greatest rescue',
    synopsis:
      'Aesop\'s lion and mouse fable, warmly retold: the hero child witnesses a mighty lion spare a tiny mouse, and later helps the little mouse gnaw through a hunter\'s net to free the roaring king of the savanna — proving that no act of kindness is ever too small and every friend matters. Gentle version about kindness returned.',
    world: 'a golden savanna with acacia trees, tall grass, a sparkling waterhole at sunset',
    costume: 'safari explorer shorts and hat with a small satchel',
  },
  {
    id: 'boy-cried-wolf',
    cover: '/legacy/3022e28c-1ac5-4985-b926-4be23fb7caa0-storyhero-cover2-boy-cried-wolf.png',
    titleTh: 'เด็กเลี้ยงแกะ',
    titleEn: 'The Boy Who Cried Wolf',
    taglineTh: 'นิทานอมตะเรื่องความซื่อสัตย์',
    taglineEn: 'The timeless tale of telling the truth',
    moralTh: 'พูดจริงเสมอ แล้วคำพูดของเราจะมีค่าเสมอ',
    moralEn: 'Always tell the truth, and your words will always matter',
    synopsis:
      'Aesop\'s shepherd fable, gently retold: the hero child guards the village sheep on a beautiful hillside, plays the wolf-trick on the villagers once too often, then faces a real wolf alone — but instead of a sad ending, the hero bravely protects the flock, honestly owns up to the tricks, and earns back the village\'s trust twice over. About honesty and second chances.',
    world: 'green hills dotted with fluffy sheep, a little village below, big open skies',
    costume: 'a shepherd\'s tunic with a wooden staff and a small horn',
  },
  {
    id: 'golden-axe',
    cover: '/legacy/08f5b669-224d-4b85-a4b4-8be9e57f741e-storyhero-cover2-golden-axe.png',
    titleTh: 'ขวานทองของคนตัดไม้',
    titleEn: 'The Honest Woodcutter\'s Golden Axe',
    taglineTh: 'นิทานขวานทองที่เด็กไทยทุกคนรู้จัก',
    taglineEn: 'The golden axe tale every Thai child knows',
    moralTh: 'ซื่อกินไม่หมด คดกินไม่นาน',
    moralEn: 'Honesty rewards us far beyond gold',
    synopsis:
      'Aesop\'s honest woodcutter fable, beloved in Thai schoolbooks: the hardworking hero child drops their only axe into a deep forest pond; a shimmering water spirit rises offering a golden axe, then a silver one, and the hero honestly claims only the plain one — earning all three, while a greedy copycat neighbor learns why honesty is the true treasure. Classic honesty tale.',
    world: 'an emerald forest with a magical sparkling pond, mist and fireflies, a humble village at the edge',
    costume: 'simple woodcutter\'s work clothes with a trusty wooden-handled axe',
  },
  {
    id: 'momotaro',
    cover: '/legacy/d6eccd02-f0b5-4195-9319-9f172d94ab88-storyhero-cover2-momotaro.png',
    titleTh: 'โมโมทาโร่ เด็กชายลูกท้อ',
    titleEn: 'Momotaro the Peach Child',
    taglineTh: 'ตำนานญี่ปุ่น เด็กน้อยจากลูกท้อยักษ์',
    taglineEn: 'Japan\'s legend of the child born from a peach',
    moralTh: 'แบ่งปันและร่วมมือกัน ชนะได้ทุกอุปสรรค',
    moralEn: 'Sharing and teamwork overcome any challenge',
    synopsis:
      'The Japanese folk hero Momotaro, gently retold: the hero child emerges from a giant peach found floating down a river, grows brave and kind, sets off with millet dumplings to calm the troublesome ogres of a distant island, and wins by sharing the dumplings — recruiting a loyal dog, a clever monkey and a proud pheasant whose teamwork (and a generous peace with the ogres) saves the village. About sharing and teamwork.',
    world: 'a Japanese countryside of rivers and blossom trees, a sailing boat to a misty ogre island, Mount Fuji beyond',
    costume: 'a Japanese folk-hero outfit with a small victory banner and a pouch of dumplings',
  },
];

export function getStory(id: string): Story | undefined {
  return STORIES.find((s) => s.id === id);
}

// Shared art direction for every illustration in every book
export const ART_STYLE =
  "Soft dreamy watercolor children's picture-book illustration, warm pastel palette, gentle rounded shapes, cozy magical storybook atmosphere, delicate linework, high detail, professional kidlit quality. Square 1:1 image, full-bleed scene.";
