export const FALLBACK_QUOTES = {
  morning: [
    "Aaj ka din ek naya mauka hai, ise waste mat karo.",
    "Choti choti mehnat hi bade results laati hai.",
    "Suraj ki tarah chamakne ke liye pehle jalna seekho.",
    "Har subah ek nayi umeed lekar aati hai."
  ],
  evening: [
    "Din kaisa bhi tha, ab sukoon se so jao.",
    "Aaj jo kiya uspar garv karo, kal aur behtar karenge.",
    "Shanti hi sabse badi daulat hai.",
    "Din bhar ki thakan ke baad, thoda khud ke liye waqt nikalo."
  ]
};

export function getRandomFallback(type) {
  const quotes = FALLBACK_QUOTES[type];
  return quotes[Math.floor(Math.random() * quotes.length)];
}
