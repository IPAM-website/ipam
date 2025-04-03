import { component$, useSignal, useTask$, $, useStore, PropFunction, getLocale } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { server$, useNavigate } from '@builder.io/qwik-city'

import sql from "../../../db"


interface LoginData {
    userP?: string,
    onValueChange$?: PropFunction<(value: string) => void>;
}

export const getQR = server$(async () => {
    try {
        const secret = speakeasy.generateSecret({ length: 20 });

        if (!secret.otpauth_url) {
            throw new Error("Errore nella generazione dell'OTP Auth URL");
        }

        const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

        return {
            secret: secret.base32,
            qrCode: qrCodeDataUrl,
            error: ""
        }
    } catch (error) {
        console.error("Errore API 2FA:", error);
        return {
            secret: null,
            qrCode: null,
            error: "Errore durante la generazione del 2FA"
        }
    }
});

export const QRverify = server$(async ({ tokenP, secret }) => {
    const token = String(tokenP).trim();
    try {

        const verified = speakeasy.totp.verify({
            secret,
            encoding: "base32",
            token
        });

        return verified ? { success: true, error: "OTP Verificato!" } : { success: false, error: "Verifica dell'OTP non andata a buon fine" };
    } catch (error) {
        console.error("Errore nella verifica OTP:", error);
        return { success: false, error: "Errore durante la verifica OTP" }
    }
});

export const QRupdateDB = server$(async ({ userP, secret }) => {
    const user = JSON.parse(userP);
    try {
        const response = await sql`UPDATE tecnici SET fa=${secret} WHERE idtecnico=${user.idtecnico}`;
        return ({ success: true });
    }
    catch (e) {
        return ({ success: false });
    }
});

export default component$<LoginData>((props) => {
    const nav = useNavigate();
    const qrCode = useSignal<string | null>(null);
    const secret = useSignal<string | null>(null);
    const showModal = useSignal<boolean>(false);
    const otpCode = useSignal("");
    const utente = useSignal(props.userP);
    const error = useSignal(false);
    const firstTime = useSignal(false);
    const verifiedClicked = useSignal(false);
    const cookie = useStore({
        mail: "",
        admin: false,
        expire: "",
        id : 0
    })


    useTask$(async () => {
        if (utente.value) {
            const user = JSON.parse(utente.value);
            // console.log(user);
            cookie.mail = user.emailtecnico;
            cookie.admin = user.admin;
            cookie.id = user.idtecnico;
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
    });

    const verifyOTP = $(async () => {
        verifiedClicked.value = true;
        // console.log(otpCode.value + " " + secret.value);
        const verifica = await QRverify({ "tokenP": otpCode.value, "secret": secret.value });
        // console.log(verifica);


        error.value = false;
        if (verifica.success) {
            if (firstTime.value) {
                const update = await QRupdateDB({ "userP": utente.value, "secret": secret.value });
                
            }

            await fetch("/api/cookie", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(cookie)
            })
            nav("/"+getLocale("en")+"/dashboard");

        } else {
            console.log("Errore nella verifica dell'OTP");
            error.value = true;
        }
    });

    return (
        <>
        <img src="/images/datacenter1.png" alt="" class="absolute -z-10 size-full" />
            <div class="fixed inset-0 flex items-center justify-center bg-opacity-50 ">
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
                
                <div class="fixed inset-0 flex items-center justify-center bg-opacity-50">
                    <img src="/images/datacenter1.png" alt="" class="absolute -z-10 size-full" />
                    <div class="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 class="text-xl font-semibold text-gray-800 mb-4">Verifica OTP</h2>
                        <p class="text-gray-600 mb-4">Inserisci il codice generato dall'app di autenticazione.</p>
                        <input
                            type="text"
                            class="w-full rounded-md border-neutral-300 border p-2 focus:border-gray-800 focus:outline-none transition-all duration-500 mb-4"
                            placeholder="Inserisci codice OTP"
                            bind:value={otpCode}
                        />
                        <div class="flex justify-between">
                            <button
                                class="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition cursor-pointer"
                                onClick$={verifyOTP}
                            >
                                Verifica
                            </button>
                            <button
                                class="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition cursor-pointer"
                                onClick$={() => props.onValueChange$?.("back")}
                            >
                                Annulla
                            </button>
                        </div>
                        {verifiedClicked.value && error.value && <div class="text-red-600 z-10 mt-4">Errore nella verifica dell'OTP</div>}
                    </div>
                </div>
                
            )}

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
