// Comprehensive TikTok Gift Coin Mapping (case-insensitive keys)
const GIFT_COIN_VALUES: Record<string, number> = {
  // 1 xu
  "rose": 1,
  "hoa hồng": 1,
  "ice cube": 1,
  "dalgona": 1,
  "heart me": 1,
  // 5 xu
  "panda": 5,
  "finger heart": 5,
  "tim (finger heart)": 5,
  // 10 xu
  "fire": 10,
  // 20 xu
  "heart": 20,
  "perfume": 20,
  "nước hoa": 20,
  // 25 xu
  "love bang": 25,
  // 49 xu
  "i love you": 49,
  // 50 xu
  "star": 50,
  "ngôi sao": 50,
  "kem chống nắng": 50,
  "sunscreen": 50,
  // 100 xu
  "confetti": 100,
  "guitar": 100,
  "rainbow puke": 100,
  // 199 xu
  "sunglasses": 199,
  "kính râm": 199,
  // 500 xu
  "money rain": 500,
  "crown": 500,
  "vương miện": 500,
  "concert": 500,
  // 699 xu
  "dance together": 699,
  "goose": 699,
  "swan": 699,
  // 899 xu
  "train": 899,
  "tàu hỏa": 899,
  // 1000 xu
  "dinosaur": 1000,
  "khủng long": 1000,
  "galaxy": 1000,
  "disco ball": 1000,
  "dragon": 1000,
  "rồng": 1000,
  "i'm very rich": 1000,
  // 1088 xu
  "diamond tree": 1088,
  // 1200 xu
  "gaming chair": 1200,
  // 2500 xu
  "spaceship": 2500,
  "phi thuyền": 2500,
  // 2988 xu
  "mermaid": 2988,
  "người cá": 2988,
  // 5000 xu
  "unicorn": 5000,
  "kỳ lân": 5000,
  "drama queen": 5000,
  // 6000 xu
  "airplane": 6000,
  "máy bay": 6000,
  // 7000 xu
  "racing car": 7000,
  "xe đua": 7000,
  // 10000 xu
  "sunset": 10000,
  "interstellar": 10000,
  "golden crown": 10000,
  // 15000 xu
  "planet": 15000,
  "castle": 15000,
  "pirate ship": 15000,
  "peacock": 15000,
  // 18000 xu
  "diamond flight": 18000,
  // 19999 xu
  "party boat": 19999,
  // 20000 xu
  "rocket": 20000,
  "tên lửa": 20000,
  // 25000 xu
  "phoenix": 25000,
  // 25999 xu
  "griffin": 25999,
  // 29999 xu
  "lion": 29999,
  "sư tử": 29999,
  // 34999 xu
  "universe": 34999,
  "vũ trụ": 34999,
  // 39999 xu
  "tiktok stars": 39999,
  // 44999 xu
  "tiktok universe": 44999,
};

export function getCoinValue(giftName: string): number | undefined {
  return GIFT_COIN_VALUES[giftName.toLowerCase()];
}
