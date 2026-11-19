// Простые линейные иллюстрации вместо фотографий блюд (в демо фото нет).
const P = {
  fill: 'none',
  stroke: '#3D4743',
  strokeWidth: 2.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const ART = {
  plov: (
    <>
      <path d="M8 30h48c0 13-11 22-24 22S8 43 8 30z" />
      <path d="M14 30c2-8 10-12 18-12s16 4 18 12" />
      <path d="M24 22l1 2M32 20v2M40 22l-1 2M28 26h.01M36 26h.01" />
      <path d="M20 56h24" />
    </>
  ),
  kurutob: (
    <>
      <ellipse cx="32" cy="38" rx="26" ry="12" />
      <path d="M14 36c6-6 30-6 36 0" />
      <path d="M22 30l4-6M32 28v-7M42 30l-4-6" />
      <circle cx="26" cy="38" r="2" />
      <circle cx="38" cy="37" r="2" />
    </>
  ),
  shashlik: (
    <>
      <path d="M6 50L58 14" />
      <rect x="16" y="34" width="10" height="10" rx="3" transform="rotate(-34 21 39)" />
      <rect x="28" y="26" width="10" height="10" rx="3" transform="rotate(-34 33 31)" />
      <rect x="40" y="18" width="10" height="10" rx="3" transform="rotate(-34 45 23)" />
    </>
  ),
  soup: (
    <>
      <path d="M8 30h48c0 13-11 22-24 22S8 43 8 30z" />
      <path d="M24 22c0-4 4-4 4-8M34 22c0-4 4-4 4-8" />
      <path d="M44 30l12-16" />
      <path d="M20 56h24" />
    </>
  ),
  salad: (
    <>
      <path d="M8 32h48c0 12-11 20-24 20S8 44 8 32z" />
      <circle cx="22" cy="26" r="5" />
      <circle cx="36" cy="24" r="6" />
      <path d="M44 28c2-6 8-8 10-6M14 28c-2-4 0-8 4-8" />
    </>
  ),
  drinks: (
    <>
      <path d="M14 26h30v8a15 15 0 0 1-30 0z" />
      <path d="M44 28h4a5 5 0 0 1 0 10h-5" />
      <path d="M22 18c0-3 3-3 3-6M32 18c0-3 3-3 3-6" />
      <path d="M12 54h34" />
    </>
  ),
};

export default function DishArt({ cat, size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" {...P}>
      {ART[cat] || ART.plov}
    </svg>
  );
}
