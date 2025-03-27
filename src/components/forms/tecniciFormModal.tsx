import { component$, useStyles$, $, useSignal } from '@builder.io/qwik';
import { Form } from '@builder.io/qwik-city';
import dialogStyles from './modalForm.css?inline';
import TextBoxForm from './TextBoxForm';

interface ConfirmDialogProps {
    title?: string;
    confirmText?: string;
    cancelText?: string;
    isOpen: boolean;
    onConfirm: (nome: string, cognome: string, ruolo:string, mail:string, telefono:string, password:string) => void;
    onCancel: () => void;
}

export default component$<ConfirmDialogProps>(({ 
    title = 'Conferma',
    confirmText = 'Conferma',
    cancelText = 'Annulla',
    isOpen,
    onConfirm,
    onCancel
}) => {
    useStyles$(dialogStyles);
    const nome = useSignal('');
    const cognome = useSignal('');
    const ruolo = useSignal('');
    const mail = useSignal('');
    const telefono = useSignal('');
    const password = useSignal('');

    const conferma = $(async (event: Event) => {
        event.preventDefault();
        await onConfirm(nome.value, cognome.value, ruolo.value, mail.value, telefono.value, password.value);
    });

    return (
        <div class={`dialog-overlay ${isOpen ? 'open' : ''}`}>
            <Form onSubmit$={conferma} class="dialog-content">
                <h3 class="dialog-title">{title}</h3>
                <div class="dialog-message">
                        <h4 class="ml-5 mt-4 mb-2 font-semibold">{$localize`Inserimento tecnico`}</h4>
                        <hr class="text-neutral-200 mb-4 w-11/12" />
                        <div class="w-11/12">
                            <TextBoxForm id="NomeT" placeholder={$localize`Inserire il nome del tecnico`} name={$localize`Nome`} value={nome.value} OnInput$={(e) => nome.value = (e.target as HTMLInputElement).value}></TextBoxForm>
                            <TextBoxForm id="CognomeT" placeholder={$localize`Inserire il cognome del tecnico`} name={$localize`Cognome`} value={cognome.value} OnInput$={(e) => cognome.value = (e.target as HTMLInputElement).value}></TextBoxForm>
                            <TextBoxForm id="RuoloT" placeholder={$localize`Inserire il ruolo del tecnico`} name={$localize`Ruolo`} value={ruolo.value} OnInput$={(e) => ruolo.value = (e.target as HTMLInputElement).value}></TextBoxForm>
                            <TextBoxForm id="EmailT" placeholder={$localize`Inserire la mail del tecnico`} name={$localize`Email`} value={mail.value} OnInput$={(e) => mail.value = (e.target as HTMLInputElement).value}></TextBoxForm>
                            <TextBoxForm id="TelefonoT" placeholder={$localize`Inserire il telefono del tecnico`} name={$localize`Telefono`} value={telefono.value} OnInput$={(e) => telefono.value = (e.target as HTMLInputElement).value}></TextBoxForm>
                            <TextBoxForm id="PwdT" placeholder={$localize`Inserire la password del tecnico`} name={$localize`Password`} value={password.value} OnInput$={(e) => password.value = (e.target as HTMLInputElement).value}></TextBoxForm>
                        </div>
                </div>
                <div class="dialog-actions">
                    <button 
                        onClick$={onCancel}
                        class="dialog-button cancel"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick$={() => onConfirm(nome.value, cognome.value, ruolo.value, mail.value, telefono.value, password.value)}
                        class="dialog-button bg-green-500 hover:bg-green-600 text-white"
                    >
                        {confirmText}
                    </button>
                </div>
            </Form>
        </div>
    );
});