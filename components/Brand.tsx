/* eslint-disable @next/next/no-img-element */
// Official Bank Mandiri logo badge (white wordmark + gold wave on navy).

export function BankLogo({
  className = "",
  height = 32,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <img
      src="/mandiri-logo.png"
      alt="Bank Mandiri"
      height={height}
      style={{ height }}
      className={"w-auto rounded-md " + className}
    />
  );
}

/** Decorative gold wave (echoes the Mandiri mark) for navy surfaces. */
export function BrandWave({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" className={className} aria-hidden="true" fill="none">
      <path
        d="M4 24c10 0 14-16 26-16s16 16 28 12 16-16 24-16"
        stroke="#F5B301"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M8 32c10 0 14-12 26-12s16 12 28 9"
        stroke="#FBC538"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}
