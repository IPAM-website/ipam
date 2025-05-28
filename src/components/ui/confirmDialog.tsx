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
      <div class={`dialog-overlay ${isOpen ? "open" : ""}`}>
        <div class="dialog-content black:bg-gray-800 black:text-white">
          <h3 class="dialog-title text-black dark:text-white">{title}</h3>
          <p class="dialog-message text-gray-700 dark:text-gray-400">{message}</p>
          <div class="dialog-actions">
            <button onClick$={onCancel} class="dialog-button cancel">
              {cancelText}
            </button>
            <button onClick$={onConfirm} class="dialog-button confirm">
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  },
);
