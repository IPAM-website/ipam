import { component$, useSignal, useVisibleTask$, $ } from "@builder.io/qwik";

export default component$(() => {
    const logs = useSignal<string>("");
    const loading = useSignal(true);
    const copied = useSignal(false);

    useVisibleTask$(async () => {
        try {
            const response = await fetch("/api/logs");
            logs.value = await response.text();
        } catch (error) {
            logs.value = "Errore nel caricamento dei log";
        }
        loading.value = false;
    });

    // Preview: ultime 30 righe
    const getPreview = $(() => {
        if (!logs.value) return "";
        const lines = logs.value.split("\n");
        return lines.slice(-30).join("\n");
    });

    const copyLogs = $(async () => {
        navigator.clipboard.writeText(await getPreview());
        copied.value = true;
        setTimeout(() => (copied.value = false), 1200);
    });

    const downloadLogs = $(() => {
        const blob = new Blob([logs.value], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "postgresql.log";
        a.click();
        URL.revokeObjectURL(url);
    });

    return (
        <div class="w-full mt-5 h-2/3 flex flex-col">
            {/* Header */}
            <div class="flex items-center justify-between rounded-t-lg border border-b-0 border-gray-300 bg-white px-6 py-3">
                <div class="flex items-center gap-2">
                    <svg class="h-6 w-6 text-black" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <path d="M8 2v4M16 2v4" />
                    </svg>
                    <span class="text-black font-semibold text-base">Anteprima Log PostgreSQL</span>
                </div>
                <div class="flex gap-2">
                    <button
                        onClick$={copyLogs}
                        class="flex items-center gap-1 rounded px-3 py-1.5 bg-white text-gray-600 font-medium border border-gray-200 hover:bg-gray-50 transition"
                        title="Copia anteprima"
                    >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <rect x="9" y="9" width="13" height="13" rx="2" />
                            <rect x="3" y="3" width="13" height="13" rx="2" />
                        </svg>
                        <span class="hidden sm:inline">Copia</span>
                    </button>
                    <button
                        onClick$={downloadLogs}
                        class="flex items-center gap-1 rounded px-3 py-1.5 bg-gray-800 text-white font-medium border border-gray-700 hover:bg-gray-700 transition"
                        title="Scarica log completo"
                    >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M12 16v-8m0 8l-4-4m4 4l4-4" />
                            <rect x="4" y="20" width="16" height="2" rx="1" />
                        </svg>
                        <span class="hidden sm:inline">Scarica</span>
                    </button>
                </div>
            </div>
            {/* Corpo log */}
            <div class="flex-grow bg-gray-50 rounded-b-lg border border-t-0 border-gray-300 p-0 relative">
                {loading.value ? (
                    <div class="text-gray-400 py-8 text-center">Caricamento log...</div>
                ) : (
                    <pre
                        class="
              w-full h-full max-h-full font-mono text-xs text-gray-800
              bg-gray-100 rounded-b-lg p-4 overflow-auto
              border-0
              scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200
            "
                        style={{
                            minHeight: "100%",
                            maxHeight: "100%",
                            boxSizing: "border-box",
                        }}
                    >
                        {getPreview()}
                    </pre>
                )}
                {copied.value && (
                    <div class="absolute top-4 right-8 rounded bg-gray-900 text-white px-3 py-1 text-sm shadow transition">
                        Copiato!
                    </div>
                )}
                {!loading.value && (
                    <div class="text-right text-xs text-gray-400 mt-2 px-4 pb-2">
                        Mostrando le ultime 30 righe del log
                    </div>
                )}
            </div>
        </div>
    );
});
