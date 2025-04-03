import { component$, Signal, useSignal, useTask$ } from "@builder.io/qwik";
import { routeLoader$, server$, useLocation, useNavigate } from "@builder.io/qwik-city";
import sql from "~/../db"
import AddressModel from "./addressModel";
import Table from "~/components/table/Table";

export const useAddresses = server$(async function (idRete: number) {
    let networkList: AddressModel[] = [];
    try {
        const query = await sql`SELECT * FROM indirizzi  WHERE idrete = ${idRete}`
        networkList = query as unknown as AddressModel[];
    }
    catch (e) {
        console.log(e);
    }

    return networkList;
})

export default component$(({ searchId }: { searchId: number }) => {
    const addressList = useSignal<AddressModel[] | null>(null);
    

    useTask$(async () => {
        addressList.value = await useAddresses(searchId) as any;
    });

    return (
        <>
            <Table dati={addressList.value} nomeImport={$localize`indirizzi`} title={$localize`Lista indirizzi IP`} nomePulsante={$localize`Aggiungi indirizzo`} nomeTabella="indirizzi" />
        </>);
})