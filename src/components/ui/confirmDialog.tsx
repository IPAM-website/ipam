/* eslint-disable qwik/valid-lexical-scope */
import {
  component$,
  useStyles$
} from "@builder.io/qwik";
import dialogStyles from "./confirmDialog.css?inline";

interface ConfirmDialogProps {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default component$<ConfirmDialogProps>(
  ({
    title = "Conferma",
    message = "Sei sicuro di voler procedere?",
    confirmText = "Conferma",
    cancelText = "Annulla",
    isOpen,
    onConfirm,
    onCancel,
  }) => {
    useStyles$(dialogStyles);


    return (
      <div
        class={`fixed inset-0 z-[9999] flex items-center justify-center
    transition-all duration-300 ease-out
    ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
    bg-black/30 backdrop-blur-sm dark:bg-black/40 dark:backdrop-blur-md
  `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick$={(e) => {
          if (e.target === e.currentTarget) onCancel();
        }}
      >
        <div
          class="relative rounded-xl p-6 w-[90%] max-w-md transform transition-all
      bg-white/95 text-gray-800 dark:bg-[#1a202c]/95 dark:text-gray-100
      border border-gray-200 dark:border-gray-700
      shadow-xl backdrop-blur-sm
      ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'}
    "
          onClick$={(e) => e.stopPropagation()}
          tabIndex={-1}
        >
          {/* X button (top-right) */}
          <button
            onClick$={onCancel}
            class="absolute top-3 right-3 p-2 rounded-full 
        bg-gray-100 hover:bg-gray-200 text-gray-500 
        dark:bg-[#2d3748] dark:text-gray-400 dark:hover:bg-[#374151]
        transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Close dialog"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <h3 id="modal-title" class="text-xl font-bold mb-3 dark:text-white tracking-tight">{title}</h3>
          <p class="mb-6 text-gray-700 dark:text-gray-300">{message}</p>

          {/* Action buttons */}
          <div class="flex justify-end gap-3">
            <button
              onClick$={onCancel}
              class="px-4 py-2 rounded-lg font-medium 
          bg-gray-100 text-gray-700 hover:bg-gray-200 
          dark:bg-[#2d3748] dark:text-gray-300 dark:hover:bg-[#374151] 
          transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              {cancelText}
            </button>
            <button
              onClick$={onConfirm}
              class="px-4 py-2 rounded-lg font-medium 
          bg-red-500 text-white hover:bg-red-600 
          dark:bg-red-600 dark:hover:bg-red-700 
          transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

    );
  },
);
