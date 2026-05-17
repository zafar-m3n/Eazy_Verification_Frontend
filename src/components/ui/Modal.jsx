import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

import Icon from "@/components/ui/Icon";

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  overlayClass = "",
  modalClass = "",
  bodyClass = "",
  closeButton = true,
  footer = null,
  disableEscapeClose = false,
  closeOnOverlayClick = true,
  centered = false,
}) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    full: "max-w-[calc(100vw-2rem)]",
  };

  function handleClose() {
    if (!disableEscapeClose) {
      onClose();
    }
  }

  function handleOverlayClick() {
    if (closeOnOverlayClick && !disableEscapeClose) {
      onClose();
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 font-figtree app-scrollbar" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={`fixed inset-0 bg-text/60 app-scrollbar ${overlayClass}`} onClick={handleOverlayClick} />
        </Transition.Child>

        <div
          className={[
            "fixed inset-0 overflow-y-auto px-4 py-4",
            centered
              ? "flex min-h-full items-center justify-center"
              : "flex min-h-full items-start justify-center sm:py-8",
          ].join(" ")}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 scale-95"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 translate-y-4 scale-95"
          >
            <Dialog.Panel
              className={[
                "relative flex w-full max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl",
                sizeClasses[size],
                modalClass,
              ].join(" ")}
            >
              {(title || closeButton) && (
                <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
                  {title ? (
                    <Dialog.Title className="min-w-0 truncate text-lg font-semibold text-text">{title}</Dialog.Title>
                  ) : (
                    <div />
                  )}

                  {closeButton && (
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex size-9 shrink-0 items-center justify-center rounded-xl text-text/70 transition hover:bg-background hover:text-text focus:outline-none"
                    >
                      <span className="sr-only">Close</span>
                      <Icon icon="mdi:close" className="size-5" />
                    </button>
                  )}
                </div>
              )}

              <div className={`min-h-0 flex-1 overflow-y-auto px-5 py-5 text-text sm:px-6 ${bodyClass}`}>
                {children}
              </div>

              {footer && <div className="shrink-0 border-t border-border px-5 py-4 text-text sm:px-6">{footer}</div>}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

export default Modal;
