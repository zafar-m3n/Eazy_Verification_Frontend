function Spinner({ message = "", size = "md" }) {
  const sizeClasses = {
    sm: "size-6 border-2",
    md: "size-8 border-4",
    lg: "size-12 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-accent-1 border-t-transparent`} />

      {message && <p className="text-sm font-medium text-text/70">{message}</p>}
    </div>
  );
}

export default Spinner;
