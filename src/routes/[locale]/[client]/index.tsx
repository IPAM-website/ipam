import { $, component$, getLocale, useSignal, useStore, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import { Form, routeAction$, server$, useLocation, z, zod$ } from "@builder.io/qwik-city";
import sql from "~/../db";
import Title from "~/components/layout/Title";
import TextboxForm from "~/components/forms/formsComponents/TextboxForm";
import { CittaModel, ClienteModel, PaeseModel, ReteModel, SiteModel } from "~/dbModels";
import Accordion from "~/components/layout/Accordion/Accordion";
import PopupModal from "~/components/ui/PopupModal";
import SelectTextboxForm from "~/components/forms/formsComponents/SelectTextboxForm";
import CHKForms from "~/components/forms/formsComponents/CHKForms";
import SelectForm from "~/components/forms/formsComponents/SelectForm";
import ConfirmDialog from "~/components/ui/confirmDialog";
import { isUserClient } from "~/fnUtils";


type Notification = {
    message: string;
    type: 'success' | 'error';
};

export const getCitiesOfClients = server$(async function (idcliente: number) {
    try {
        const query = await sql`SELECT DISTINCT citta.* FROM citta INNER JOIN siti ON citta.idcitta=siti.idcitta WHERE siti.idcliente=${idcliente}`;
        return query as unknown as CittaModel[];
    } catch (e) {
        console.log(e);
    }

    return [];
})

export const getClient = server$(async function (idclient: number) {
    let client: ClienteModel = { idcliente: -1, nomecliente: '', telefonocliente: '' };
    try {
        const query = await sql`SELECT * FROM clienti WHERE clienti.idcliente=${idclient}`
        client = query[0] as ClienteModel;
    }
    catch (e) {
        console.log(e);
    }

    return client;
})

export const getCitiesHints = server$(async function () {
    try {
        const data = await sql`SELECT * FROM citta`;
        return data.map(x => ({ text: x.nomecitta, value: x.idcitta }));
    } catch (e) {
        console.log(e);
        return [];
    }
})

export const deleteSite = server$(async function (idsito: number) {
    try {
        const data = await sql`DELETE FROM siti WHERE idsito=${idsito}`;
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
})


export const getAllCountries = server$(async () => {
    try {
        const data = await sql`SELECT * FROM paesi ORDER BY nomepaese`;
        return data as unknown as PaeseModel[];
    } catch (e) {
        console.log(e);
        return [];
    }
})

export const getClientCountries = server$(async (idcliente: number) => {
    try {
        const data = await sql`SELECT DISTINCT paesi.* FROM paesi INNER JOIN citta ON paesi.idpaese=citta.idpaese INNER JOIN siti ON citta.idcitta=siti.idcitta WHERE siti.idcliente=${idcliente} ORDER BY nomepaese`;
        return data as unknown as PaeseModel[];
    } catch (e) {
        console.log(e);
        return [];
    }
})

export const getSitesByCity = server$(async (idcitta: string, idcliente: number) => {
    try {
        const data = await sql`SELECT * FROM siti WHERE idcitta = ${idcitta} AND idcliente = ${idcliente}`;
        // console.log(idcitta);
        return data as unknown as SiteModel[];
    } catch (e) {
        console.log(e);
        return [];
    }

})

export const getCityCountry = server$(async (idcitta: number) => {
    try {
        const data = await sql`SELECT * FROM citta INNER JOIN paesi ON citta.idpaese=paesi.idpaese WHERE idcitta = ${idcitta}`;
        // console.log(idcitta);
        return data as unknown as (CittaModel & PaeseModel)[];
    } catch (e) {
        return [];
    }
})

export const cleanCities = server$(async () => {
    try {
        await sql`DELETE FROM citta WHERE citta.idcitta NOT IN (SELECT siti.idcitta FROM siti)`;
    } catch (e) {
        console.log(e);
    }
})

export const useCreateSite = routeAction$(async (data) => {
    try {
        if (data.idcitta == '') {
            const rows = await sql`SELECT idcitta FROM citta WHERE nomecitta=${data.nomecitta} AND idpaese=${data.idpaese}`;
            if (rows.length > 0) {
                data.idcitta = rows[0].idcitta;
            }
            else {
                await sql`INSERT INTO citta(nomecitta,idpaese) VALUES (${data.nomecitta.toLowerCase()},${data.idpaese})`;
                data.idcitta = (await sql`SELECT idcitta FROM citta ORDER BY idcitta DESC LIMIT 1`)[0].idcitta;
            }
        }

        await sql`INSERT INTO siti(nomesito,idcitta,datacenter,tipologia,idcliente) VALUES (${data.nomesito},${parseInt(data.idcitta)},${data.datacenter == "on"},
                    ${data.tipologia},${parseInt(data.idcliente)})`;
        return { success: true, site: data };
    } catch (e) {
        console.log(e);
        return { success: false, site: {} };
    }
},
    zod$({
        nomesito: z.string().min(2),
        idcitta: z.string(),
        datacenter: z.string().optional(),
        tipologia: z.string(),
        idcliente: z.string().min(1),
        nomecitta: z.string().min(2),
        idpaese: z.string()
    }))

export const useUpdateSite = routeAction$(async (data) => {
    try {
        if (data.idcitta == '') {
            if (data.nomecitta.toLowerCase() != '') {
                await sql`INSERT INTO citta(nomecitta,idpaese) VALUES (${data.nomecitta.toLowerCase()},${data.idpaese})`;
                data.idcitta = (await sql`SELECT idcitta FROM citta ORDER BY idcitta DESC LIMIT 1`)[0].idcitta;
            }
            else {
                throw new Error("Nome citta non valido");
            }
        }
        else {
            const results = await sql`SELECT * FROM citta WHERE citta.idcitta=${data.idcitta}`;

            if (results.length > 0 && results[0].idpaese != data.idpaese) {
                await sql`INSERT INTO citta(nomecitta,idpaese) VALUES (${results[0].nomecitta.toLowerCase()},${data.idpaese})`
            }
            data.idcitta = (await sql`SELECT idcitta FROM citta WHERE citta.nomecitta=${results[0].nomecitta.toLowerCase()} AND citta.idpaese=${data.idpaese}`)[0].idcitta
        }

        await sql`UPDATE siti SET nomesito=${data.nomesito}, idcitta=${data.idcitta}, datacenter=${data.datacenter == "on"}, tipologia=${data.tipologia} WHERE idsito=${parseInt(data.idsito)}`;
        cleanCities();
        return { success: true, site: data };
    } catch (e) {
        console.log(e);
        return { success: false, site: {} };
    }
},
    zod$({
        idsito: z.string(),
        nomesito: z.string().min(2),
        idcitta: z.string(),
        datacenter: z.string().optional(),
        tipologia: z.string(),
        idcliente: z.string().min(1),
        nomecitta: z.string().min(2),
        idpaese: z.string()
    }))


export default component$(() => {

    const createSite = useCreateSite();
    const updateSite = useUpdateSite();
    const loc = useLocation();
    const lang = getLocale("en");

    const sites = useSignal<SiteModel[]>([]);
    const selected = useSignal<number>(-1);
    const client = useSignal<ClienteModel>();
    const countries = useSignal<PaeseModel[]>();
    const clientCountries = useSignal<PaeseModel[]>();
    const selectedCountry = useSignal<string>("");
    const cities = useSignal<CittaModel[]>();
    const citiesHints = useSignal<{ text: string, value: any }[]>();
    const updateTable = useSignal<boolean>(false);

    const siteUpdateMode = useSignal<boolean>(false);
    const siteAddMode = useSignal<number>(0);

    type fmData = SiteModel & { nomecitta: string, nomepaese: string };

    const selectedSite = useStore<fmData>({
        datacenter: false,
        idcitta: 0,
        idsito: 0,
        nomesito: '',
        tipologia: '',
        nomecitta: '',
        nomepaese: ''
    });

    const isDatacenter = useSignal(false);
    const notifications = useSignal<Notification[]>([]);
    const showDialog = useSignal(false);

    const isClient = useSignal(false);
    const cityName = useSignal('');

    const isSearching = useSignal(false);

    useTask$(async () => {
        countries.value = await getAllCountries();
        client.value = await getClient(parseInt(loc.params.client));
        isClient.value = await isUserClient();
    })

    useVisibleTask$(async({track,cleanup})=>{
        track(() => updateTable.value);
        let tm = setTimeout(()=>{
            document.getElementById("btn"+selected.value)?.focus();
        },300);

        cleanup(()=>tm);
    })

    useTask$(async ({ track }) => {
        track(() => updateTable.value);
        cities.value = await getCitiesOfClients(parseInt(loc.params.client));
        citiesHints.value = await getCitiesHints();
        clientCountries.value = await getClientCountries(parseInt(loc.params.client));
    })

    useTask$(async ({ track }) => {
        track(() => updateTable.value);
        track(() => selected.value)
        sites.value = await getSitesByCity(selected.value.toString(),parseInt(loc.params.client));
    })

    const handleSiteClick = $(() => {
        if (siteUpdateMode.value) {
            siteUpdateMode.value = false;
            siteAddMode.value = 0;
        }
        else
            siteUpdateMode.value = true;
    })

    const addNotification = $((message: string, type: 'success' | 'error') => {
        notifications.value = [...notifications.value, { message, type }];
        // Rimuovi la notifica dopo 3 secondi
        setTimeout(() => {
            notifications.value = notifications.value.filter(n => n.message !== message);
        }, 3000);
    });

    const handleSubmit = $(async () => {
        if (siteAddMode.value == 1) {
            if (createSite.value?.failed) {
                return;
            }
            if (createSite.value?.success){
                addNotification(lang == "en" ? "Creation successful" : "Creazione avvenuta con successo", 'success');
                selected.value = (createSite.value.site as fmData).idcitta;
                cityName.value = (createSite.value.site as fmData).nomecitta;
            }else
                addNotification(lang == "en" ? "Error during creation" : "Errore durante la creazione", 'error');
        } else {
            if (updateSite.value?.failed) {
                return;
            }
            if (updateSite.value?.success){
                addNotification(lang == "en" ? "Update successful" : "Modifica avvenuta con successo", 'success');
                selected.value = (updateSite.value.site as fmData).idcitta;
                cityName.value = (updateSite.value.site as fmData).nomecitta;
            }else
                addNotification(lang == "en" ? "Error during update" : "Errore durante la modifica", 'error');
        }

        siteAddMode.value = 0;
        clientCountries.value = []; // force reload
        
        cities.value = [];
        updateTable.value = !updateTable.value;
    })

    const confirmDelete = $(async () => {
        if (await deleteSite(selectedSite.idsito))
            addNotification(lang == "en" ? "Deleted successful" : "Eliminazione avvenuta con successo", 'success');
        else
            addNotification(lang == "en" ? "Error during deletion" : "Errore durante l'eliminazione", 'error');
        showDialog.value = false;
        selected.value = -1;
        cleanCities().then(()=>{
            window.location.reload()
        });
    });

    const cancelDelete = $(() => {
        showDialog.value = false;
    });



    return (
        <>
            <div class="fixed top-4 right-4 z-50 space-y-2">
                {notifications.value.map((notification, index) => (
                    <div
                        key={index}
                        class={`p-4 rounded-md shadow-lg ${notification.type === 'success'
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                            }`}
                    >
                        {notification.message}
                    </div>
                ))}
            </div>
            <Title haveReturn={!isClient.value} url={loc.url.origin}>{client.value?.nomecliente}</Title>
            <br />
            {/* VISUALIZZAZIONE DELLE CITTA E PAESI */}
            <div class="flex flex-col gap-2 md:flex-row">
                <div class="md:w-1/4 mx-auto md:h-[60vh] flex flex-col shadow p-2 md:p-3 rounded-md border border-gray-200">
                    <p class="font-medium flex justify-between text-sm py-2">
                        {$localize`Location`}
                        <button onClick$={() => siteAddMode.value = 1} class="active:bg-gray-100 p-0.5 rounded-lg has-tooltip hover:bg-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 cursor-pointer">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            <span class="tooltip">
                                {$localize`Aggiungi sito`}
                            </span>
                        </button>
                    </p>
                    <hr class="text-gray-300 mb-2" />
                    <div class="space-y-1 overflow-y-auto">
                        {
                            cities.value && clientCountries.value && cities.value?.length > 0 ? clientCountries.value.map((x: PaeseModel) => {

                                const filterCity = cities.value?.filter(j => x.idpaese == j.idpaese);
                                if (filterCity?.length == 0)
                                    return;
                                return (<Accordion title={x.nomepaese} isVisible={filterCity?.find(x=>x.idcitta==selected.value)!=undefined}>
                                    {filterCity?.map(j => <button id={"btn"+j.idcitta} class="w-full py-0.5 px-3 outline-0 rounded-md cursor-pointer text-start hover:bg-gray-50 focus:bg-gray-100" onClick$={() => { selected.value = j.idcitta; cityName.value = j.nomecitta }} key={j.idcitta}>{j.nomecitta[0].toUpperCase() + j.nomecitta.slice(1).toLowerCase()}</button>)}
                                </Accordion>)
                            })
                                :
                                <div class="h-full text-sm text-gray-400 text-center">
                                    {$localize`Non ci sono paesi con almeno un sito`}
                                </div>
                        }
                    </div>
                </div>
                <div class="md:w-3/4 md:h-[60vh] mx-5 flex flex-col shadow p-3 rounded-md border border-gray-200">
                    <p class="font-medium flex justify-between text-sm py-2">
                        {$localize`All Sites`}{selected.value !== -1 ? ": " + sites.value.length : ""}
                        {!isClient.value && selected.value!==-1 && <button onClick$={handleSiteClick} class="has-tooltip hover:bg-gray-200 rounded-[50%] cursor-pointer p-1" style={{ backgroundColor: siteUpdateMode.value ? "#ddd" : "" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                            <span class="tooltip">
                                {$localize`Edit`}
                            </span>
                        </button>}
                    </p>
                    <hr class="border-gray-200 mb-2" />
                    {selected.value !== -1 ? (
                        <div class="space-y-1 h-full">
                            <span class="text-sm text-gray-400 ms-1">
                                {cityName.value[0].toUpperCase() + cityName.value.slice(1).toLowerCase()}
                            </span>
                            <br />
                            {sites.value.length > 0 ? sites.value.map((x: SiteModel) => (
                                <div class="flex items-center ms-2 justify-between">

                                    <a
                                        href={`${x.idsito}/`}
                                        class="block text-sm text-blue-600 hover:underline"
                                    >
                                        {x.nomesito}
                                    </a>
                                    <div>
                                        {siteUpdateMode.value &&
                                            <>
                                                <button class="bg-amber-500 w-8 h-8 rounded-md inline-flex items-center justify-center cursor-pointer hover:bg-amber-600 transition-colors has-tooltip"
                                                    onClick$={async () => {
                                                        Object.assign(selectedSite, x);
                                                        const cityCountry = (await getCityCountry(x.idcitta))[0];
                                                        selectedSite.idcitta = cityCountry.idcitta;
                                                        selectedSite.nomecitta = cityCountry.nomecitta;
                                                        selectedCountry.value = cityCountry.idpaese.toString();
                                                        isDatacenter.value = x.datacenter;
                                                        siteAddMode.value = 2;
                                                    }}>
                                                    <span class="tooltip">{$localize`Modifica`}</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" class="w-5 h-5">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                    </svg>
                                                </button>
                                                <button class={`relative w-8 h-8 rounded-md ml-2 inline-flex items-center justify-center has-tooltip bg-red-500 hover:bg-red-600 cursor-pointer transition-colors`}
                                                    onClick$={() => { showDialog.value = true; selectedSite.idsito = x.idsito }}>
                                                    <span class="tooltip">{$localize`Elimina`}</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" class="w-5 h-5">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </>
                                        }
                                    </div>
                                </div>
                            ))
                                :
                                (<div class="w-full flex flex-col justify-center items-center h-full text-gray-400 mb-5">
                                    <p>
                                        {$localize`Non sono presenti siti.`}
                                    </p>
                                    <p>
                                        {$localize`Utilizza il pulsante modifica per aggiungerne.`}
                                    </p>
                                </div>)}
                        </div>
                    ) :
                        (!siteUpdateMode.value && <div class="w-full flex justify-center items-center h-full text-gray-400 mb-5">
                            {$localize`Seleziona una città nel menù a sinistra`}
                        </div>)}
                    {/* {
                        siteUpdateMode.value &&
                        (
                            <div class="w-full mt-2 flex justify-center">
                                <button onClick$={() => siteAddMode.value = 1} class="bg-black hover:bg-gray-900 active:bg-gray-700 text-white cursor-pointer p-2 px-4 rounded-sm text-sm">Aggiungi sito</button>
                            </div>
                        )
                    } */}
                </div>
            </div>

            {/* Dialog di conferma eliminazione */}
            <ConfirmDialog
                isOpen={showDialog.value}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                title={$localize`Conferma`}
                message={$localize`Sei sicuro di voler procedere?`}
                confirmText={$localize`Elimina`}
                cancelText={$localize`Annulla`}
            />

            <PopupModal visible={siteAddMode.value > 0} onClosing$={() => siteAddMode.value = 0} title={siteAddMode.value == 1 ? "Aggiungi sito" : "Modifica sito"}>
                <Form action={siteAddMode.value == 1 ? createSite : updateSite} onSubmit$={handleSubmit}>

                    <TextboxForm id="txtNomeSito" nameT="nomesito" value={selectedSite.nomesito} placeholder="Nome del sito" title="Nome sito:" />
                    {siteAddMode.value == 1 ? createSite.value?.failed && createSite.value?.fieldErrors?.nomesito && (
                        <div class="text-sm text-red-600 ms-2">
                            {createSite.value?.fieldErrors?.nomesito}
                        </div>
                    ) : updateSite.value?.failed && updateSite.value?.fieldErrors?.nomesito && (
                        <div class="text-sm text-red-600 ms-2">
                            {updateSite.value?.fieldErrors?.nomesito}
                        </div>
                    )}
                    <input type="hidden" name="idsito" value={selectedSite.idsito} required />
                    <input type="hidden" name="idcitta" value={selectedSite.idcitta} required />
                    <input type="hidden" name="idpaese" value="-1" required />
                    <input type="hidden" name="nomecitta" value={selectedSite.nomecitta} />
                    <div class="flex md:flex-row flex-col ">
                        <SelectTextboxForm id="txtCitta" title="Città:" value={selectedSite.nomecitta} OnSelectedValue$={async (e) => {
                            const input = document.getElementsByName("idcitta")[0] as HTMLInputElement;
                            input.value = e.value;
                            console.log(e.value)
                            const input2 = document.getElementsByName("nomecitta")[0] as HTMLInputElement;
                            input2.value = e.text;
                            if (e.value != "") {
                                if (isSearching.value) {
                                    isSearching.value = true;
                                    setTimeout(async () => {
                                        selectedCountry.value = await server$(async () => {
                                            return (await sql`SELECT idpaese FROM citta WHERE idcitta = ${e.value}`)[0].idpaese.toString();
                                        })()
                                        isSearching.value = false;
                                    }, 1000);
                                }
                            }
                        }} OnInput$={(e) => {
                            const input = document.getElementsByName("nomecitta")[0] as HTMLInputElement;
                            input.value = e.target.value;
                            const input1 = document.getElementsByName("idcitta")[0] as HTMLInputElement;
                            input1.value = "";
                        }} name="nomecitta" values={citiesHints.value} />
                        {createSite.value?.failed && createSite.value?.fieldErrors?.nomecitta && (
                            <div class="text-sm text-red-600 ms-2">
                                {createSite.value?.fieldErrors?.nomecitta}
                            </div>
                        )}
                        {updateSite.value?.failed && updateSite.value?.fieldErrors?.nomecitta && (
                            <div class="text-sm text-red-600 ms-2">
                                {updateSite.value?.fieldErrors?.nomecitta}
                            </div>
                        )}
                        <SelectForm id="cmbPaese" title="Paese: " value={selectedCountry.value} name="nomepaese" OnClick$={(e) => { (document.getElementsByName("idpaese")[0] as HTMLInputElement).value = (e.target as HTMLOptionElement).value }} >
                            {countries.value?.map(x => {
                                const renderedText = x.nomepaese.length > 16 ? x.nomepaese.substring(0, 17) + "..." : x.nomepaese;
                                return <option value={x.idpaese}>{renderedText}</option>
                            })}
                        </SelectForm>
                    </div>

                    <CHKForms name="datacenter" id="Datacenter" nameCHK="Datacenter: " setValue={isDatacenter} value={selectedSite.datacenter} />
                    <input type="text" class="hidden" name="tipologia" />
                    <SelectForm id="cmbTipo" name="" value={isDatacenter.value ? "active" : "none"} title="Tipologia: " OnClick$={(e) => { (document.getElementsByName("tipologia")[0] as HTMLInputElement).value = (e.target as HTMLOptionElement).value }}>
                        {isDatacenter.value ? (
                            <>
                                <option value="active">Attivo</option>
                                <option value="standby">Standby</option>
                                <option value="disaster_recovery">Disaster Recovery</option>
                            </>
                        ) : (
                            <>
                                <option value="none">-</option>
                                <option value="filiale">Filiale</option>
                            </>
                        )}
                    </SelectForm>
                    <input type="number" class="hidden" name="idcliente" value={loc.params.client} />
                    <button class="bg-black disabled:bg-gray-700 disabled:text-gray-100 p-2 px-4 me-4 cursor-pointer text-white hover:bg-gray-900 active:bg-gray-800 rounded-sm">{siteAddMode.value == 1 ? "Aggiungi" : "Modifica"}</button>
                </Form>
            </PopupModal>
        </>
    )
})