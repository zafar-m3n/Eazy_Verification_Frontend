import Icon from "@/components/ui/Icon";

function Pagination({ currentPage, totalPages, onPageChange, className = "", text = false }) {
  function getPageNumbers() {
    const pages = [];

    for (let page = 1; page <= totalPages; page += 1) {
      pages.push(page);
    }

    if (pages.length <= 10) {
      return pages;
    }

    return [1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  function handleClick(page) {
    if (page !== "..." && page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  }

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => handleClick(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-medium transition ${
          currentPage === 1
            ? "cursor-not-allowed border-border bg-background text-text/40"
            : text
              ? "border-border bg-card text-text hover:border-accent-1 hover:bg-background"
              : "border-accent-1 bg-accent-1 text-card hover:bg-accent-2"
        }`}
      >
        {text ? "Previous" : <Icon icon="heroicons:chevron-left" className="size-4" />}
      </button>

      {pageNumbers.map((page, index) => (
        <button
          type="button"
          key={`${page}-${index}`}
          onClick={() => handleClick(page)}
          disabled={page === "..."}
          className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-medium transition ${
            page === "..."
              ? "cursor-not-allowed text-text/40"
              : page === currentPage
                ? "bg-accent-1 text-card"
                : "text-text hover:bg-background"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        onClick={() => handleClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-medium transition ${
          currentPage === totalPages
            ? "cursor-not-allowed border-border bg-background text-text/40"
            : text
              ? "border-border bg-card text-text hover:border-accent-1 hover:bg-background"
              : "border-accent-1 bg-accent-1 text-card hover:bg-accent-2"
        }`}
      >
        {text ? "Next" : <Icon icon="heroicons:chevron-right" className="size-4" />}
      </button>
    </div>
  );
}

export default Pagination;
