import { component$, useSignal } from "@builder.io/qwik";
import { Form, routeAction$ } from "@builder.io/qwik-city";
import TextBoxForm from "./TextBoxForm";

const Modifica = routeAction$(() => {

})

export default component$(() => {
    const conferma =  Modifica()
    const testoNome = useSignal("")

    return (
        <>
            <Form action={conferma} class="border-1 border-neutral-200 mt-5 rounded-md w-1/2">
                <h4 class="ml-5 mt-4 mb-2">{$localize`Inserimento tecnico`}</h4>
                <hr class="text-neutral-200 mb-4 w-11/12" />
                <TextBoxForm id="NomeT" placeholder={$localize`Inserire il nome del tecnico`} name={$localize`Nome`}></TextBoxForm>
            </Form>
        </>
    )
})