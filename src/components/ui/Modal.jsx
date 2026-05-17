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
  };

  function handleClose() {
    if (!disableEscapeClose) {
      onClose();
    }
  }

  function handleOverlayClick() {
    if (closeOnOverlayClick) {
      onClose();
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 font-figtree" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={`fixed inset-0 bg-text/60 ${overlayClass}`} onClick={handleOverlayClick} />
        </Transition.Child>

        <div className={`fixed inset-0 flex justify-center px-4 ${centered ? "items-center" : "items-start pt-16"}`}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel
              className={`relative w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xl ${sizeClasses[size]} ${modalClass}`}
            >
              {(title || closeButton) && (
                <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
                  {title ? <Dialog.Title className="text-lg font-semibold text-text">{title}</Dialog.Title> : <div />}

                  {closeButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex size-9 shrink-0 items-center justify-center rounded-xl text-text/70 transition hover:bg-background hover:text-text focus:outline-none"
                    >
                      <span className="sr-only">Close</span>
                      <Icon icon="mdi:close" className="size-5" />
                    </button>
                  )}
                </div>
              )}

              <div className="px-6 py-5 text-text">{children}</div>

              {footer && <div className="border-t border-border px-6 py-4 text-text">{footer}</div>}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

export default Modal;
