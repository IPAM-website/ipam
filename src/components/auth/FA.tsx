import { component$, useSignal, useTask$, $, useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { server$, useNavigate } from '@builder.io/qwik-city'

import sql from "../../../db"


interface LoginData {
    userP?: string;
}

export const getQR = server$(async () => {
    try {
        const secret = speakeasy.generateSecret({ length: 20 });

        if (!secret.otpauth_url) {
            throw new Error("Errore nella generazione dell'OTP Auth URL");
        }

        const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

        /*json(200, {
          secret: secret.base32,
          qrCode: qrCodeDataUrl,
        });*/
        //console.log("🔑 Secret utilizzato per la verifica:", secret);
        return {
            secret: secret.base32,
            qrCode: qrCodeDataUrl,
            error: ""
        }
    } catch (error) {
        console.error("Errore API 2FA:", error);
        // json(500, { error: "Errore durante la generazione del 2FA" });
        return {
            secret: null,
            qrCode: null,
            error: "Errore durante la generazione del 2FA"
        }
    }
});

export const QRverify = server$(async ({ tokenP, secret }) => {
    //console.log("👉 Token ricevuto:", tokenP);
    //console.log("👉 Secret ricevuto:", secret);
    //console.log("🕒 Ora server:", new Date().toISOString());
    const token = String(tokenP).trim();
    try {

        const verified = speakeasy.totp.verify({
            secret,
            encoding: "base32",
            token
        });
        //console.log("👉 Verificato:", verified);

        return verified ? { success: true, error: "OTP Verificato!" } : { success: false, error: "Verifica dell'OTP non andata a buon fine" };
        //json(verified ? 200 : 400, { success: verified });
    } catch (error) {
        console.error("Errore nella verifica OTP:", error);
        //json(500, { error: "Errore durante la verifica OTP" });
        return { success: false, error: "Errore durante la verifica OTP" }
    }
});

export const QRupdateDB = server$(async ({ userP, secret }) => {
    const user = JSON.parse(userP);
    // console.log(user);
    // console.log(secret);
    try {

        const response = await sql`UPDATE tecnici SET fa=${secret}`
        return ({ success: true });
    }
    catch (e) {
        return ({ success: false });
    }
});

export default component$<LoginData>((props) => {
    //console.log("👉 Props:", props.userP);
    const nav = useNavigate();
    const qrCode = useSignal<string | null>(null);
    const secret = useSignal<string | null>(null);
    const showModal = useSignal<boolean>(false);
    const otpCode = useSignal("");
    const utente = useSignal(props.userP);
    const error = useSignal(false);
    const firstTime = useSignal(false);
    const cookie = useStore({
        mail: "",
        expire: ""
    })


    useTask$(async () => {
        //console.log("👉 Utente:", utente.value);
        if (utente.value) {
            const user = JSON.parse(utente.value);
            console.log(user);
            cookie.mail = user.emailtecnico;
            const expires = new Date();
            expires.setTime(expires.getTime() + (24 * 60 * 60 * 1000));
            cookie.expire = expires.toUTCString();

            if (!user.fa) {
                const faResult = await getQR();
                qrCode.value = faResult.qrCode;
                secret.value = faResult.secret;
                firstTime.value = true;
            }
            else {
                secret.value = user.fa;
                showModal.value = true;
            }
        }

        //console.log(faResult);
    });


    const verifyOTP = $(async () => {
        const verifica = await QRverify({ "tokenP": otpCode.value, "secret": secret.value });

        if (verifica.success) {
            if (firstTime.value) {
                const update = await QRupdateDB({ "userP": utente.value, "secret": secret.value });
                if (update.success)
                    console.log("DB Aggiornato!");
                else
                    console.log("Errore nell'aggiornamento del DB!");
            }

            await fetch("/api/cookie",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(cookie)
            })
            nav("/dashboard");

        } else {
            error.value = true;
        }
    });

    return (
        <>
            <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div class="bg-white p-6 rounded-lg shadow-lg w-96">
                    <h2 class="text-xl font-semibold text-gray-800 mb-4">Abilita 2FA</h2>
                    <p class="text-gray-600 mb-4">Scansiona questo codice QR con Google Authenticator o Authy.</p>
                    <img src={qrCode.value || ''} width="200" height="200" alt="QR Code" class="mx-auto h-10/12 w-10/12" />
                    <p class="text-gray-500 text-sm mt-2">Oppure usa il codice: {secret.value}</p>
                    <button
                        class="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                        onClick$={() => showModal.value = true}
                    >
                        Verifica OTP
                    </button>
                </div>
            </div>

            {/* Modal di verifica OTP */}
            {showModal.value && (
                <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div class="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 class="text-xl font-semibold text-gray-800 mb-4">Verifica OTP</h2>
                        <p class="text-gray-600 mb-4">Inserisci il codice generato dall'app di autenticazione.</p>
                        <input
                            type="text"
                            class="w-full border p-2 rounded mb-4"
                            placeholder="Inserisci codice OTP"
                            bind:value={otpCode}
                        />
                        <div class="flex justify-between">
                            <button
                                class="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition"
                                onClick$={verifyOTP}
                            >
                                Verifica
                            </button>
                            <button
                                class="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
                                onClick$={() => showModal.value = false}
                            >
                                Annulla
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {error && <div>Errore nella verifica dell'OTP</div>}
        </>
    );
});

export const head: DocumentHead = {
    title: "2FA",
    meta: [
        {
            name: "2 Factor Authentication",
            content: "Pagina di autenticazione",
        },
    ],
};
