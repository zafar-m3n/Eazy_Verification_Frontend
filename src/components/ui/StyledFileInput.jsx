import { useRef } from "react";
import Icon from "@/components/ui/Icon";

function StyledFileInput({ label, file, filePath, onChange, onRemove, preferredSize = "", accept = "image/*" }) {
  const fileInputRef = useRef(null);

  function handleChooseFile() {
    fileInputRef.current?.click();
  }

  function handleRemove() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onRemove();
  }

  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-text">
          {label} {preferredSize && <span className="font-normal text-text/50">({preferredSize})</span>}
        </label>
      )}

      <div className="flex overflow-hidden rounded-xl border border-border bg-card transition focus-within:border-accent-1 focus-within:ring-2 focus-within:ring-accent-1/20">
        <button
          type="button"
          onClick={handleChooseFile}
          className="shrink-0 border-r border-border bg-background px-4 py-3 text-sm font-medium text-text transition hover:bg-accent-1 hover:text-card"
        >
          Choose File
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-3 bg-card px-4 py-3">
          {!file && !filePath ? (
            <span className="truncate text-sm text-text/50">No file chosen</span>
          ) : file ? (
            <>
              <span className="min-w-0 flex-1 truncate text-sm text-text">{file.name}</span>

              <button
                type="button"
                onClick={handleRemove}
                className="flex size-7 shrink-0 items-center justify-center rounded-lg text-text/60 transition hover:bg-background hover:text-text"
              >
                <Icon icon="mdi:close" className="size-4" />
              </button>
            </>
          ) : (
            <div className="relative">
              <img src={filePath} alt="Preview" className="size-12 rounded-lg border border-border object-cover" />

              <button
                type="button"
                onClick={handleRemove}
                className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border border-border bg-card text-text transition hover:bg-background"
              >
                <Icon icon="mdi:close" className="size-4" />
              </button>
            </div>
          )}
        </div>

        <input type="file" accept={accept} ref={fileInputRef} onChange={onChange} className="hidden" />
      </div>
    </div>
  );
}

export default StyledFileInput;
