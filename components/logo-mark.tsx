type LogoMarkProps = {
  className?: string;
};

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 14h15c4.6 0 8.7 1.6 12 4.8V53c-3.2-3-7.2-4.5-12-4.5H8V14Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <path
        d="M56 14H41c-4.6 0-8.7 1.6-12 4.8V53c3.2-3 7.2-4.5 12-4.5h15V14Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <path
        d="M19 38V26h5.5c3.6 0 6.5 2.6 6.5 6s-2.9 6-6.5 6H19Z"
        fill="currentColor"
      />
      <path
        d="M38 38l5-12 5 12m-8.4-4h6.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
    </svg>
  );
}

