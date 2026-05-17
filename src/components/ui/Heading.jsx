function Heading({ children, className = "", accented = false, as = "h1" }) {
  const Tag = as;

  return (
    <Tag className={`font-figtree text-2xl font-bold ${accented ? "text-accent-2" : "text-text"} ${className}`}>
      {children}
    </Tag>
  );
}

export default Heading;
