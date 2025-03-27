import { component$, Slot, useSignal, useStyles$, JSXOutput } from '@builder.io/qwik';
import dialogStyles from './ConfirmDialog.css?inline';

interface ConfirmDialogProps {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default component$<ConfirmDialogProps>(({ 
    title = 'Conferma',
    message = 'Sei sicuro di voler procedere?',
    confirmText = 'Conferma',
    cancelText = 'Annulla',
    isOpen,
    onConfirm,
    onCancel
}) => {
    useStyles$(dialogStyles);

    return (
        <div class={`dialog-overlay ${isOpen ? 'open' : ''}`}>
            <div class="dialog-content">
                <h3 class="dialog-title">{title}</h3>
                <p class="dialog-message">{message}</p>
                <div class="dialog-actions">
                    <button 
                        onClick$={onCancel}
                        class="dialog-button cancel"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick$={onConfirm}
                        class="dialog-button confirm"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
});