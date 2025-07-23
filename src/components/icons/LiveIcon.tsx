function LiveIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-pulse size-6"
    >
      <circle cx="12" cy="12" r="4" fill="#EF4444" className="animate-pulse" />
      <circle cx="12" cy="12" r="7" stroke="#EF4444" strokeWidth="2" />
    </svg>
  );
}
export default LiveIcon;
