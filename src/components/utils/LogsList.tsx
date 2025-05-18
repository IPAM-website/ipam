import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';

export default component$(() => {
<<<<<<< HEAD
    const logs = useSignal<string[]>([]);
    const status = useSignal<'loading' | 'ok' | 'error'>('loading');
    const lastUpdate = useSignal<string>(new Date().toLocaleTimeString());

    useVisibleTask$(({ cleanup }) => {
        let timer: NodeJS.Timeout;
        const controller = new AbortController();

        const fetchLogs = async () => {
            try {
                const res = await fetch('/api/logs?_=' + Date.now(), {
                    signal: controller.signal,
                    cache: 'no-cache'
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();

                if (!data?.success || !Array.isArray(data.logs)) {
                    throw new Error('Formato risposta non valido');
                }

                logs.value = data.logs;
                status.value = 'ok';
                lastUpdate.value = new Date().toLocaleTimeString();

            } catch (err) {
                status.value = 'error';
                logs.value = [`[${new Date().toLocaleTimeString()}] Errore: ${err as string}`];
            }
        };

        fetchLogs();
        timer = setInterval(fetchLogs, 3000);

        cleanup(() => {
            clearInterval(timer);
            controller.abort();
        });
    });

    // Funzione per scaricare i log come file txt
    const downloadLogs = $(async () => {
        try {
            const response = await fetch('/api/logs/download');
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `logs_completi_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            alert('Errore durante il download: ' + err as string);
        }
    });

    return (
        <div class="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h2 class="text-xl font-bold text-gray-800">Log del Sistema</h2>
                    <p class="text-sm text-gray-500">
                        Ultimo aggiornamento: {lastUpdate.value}
                    </p>
                </div>
                <div class={`w-3 h-3 rounded-full ${status.value === 'ok' ? 'bg-green-500' :
                        status.value === 'loading' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                    }`}></div>
            </div>

            <div class="h-96 overflow-y-auto">
                {logs.value.length === 0 ? (
                    <div class="text-center p-4 text-gray-500">
                        {status.value === 'loading'
                            ? 'Caricamento in corso...'
                            : 'Nessun log disponibile'}
                    </div>
                ) : (
                    logs.value.map((log, idx) => {
                        const logParts = log.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} UTC) \[.*?\] (\w+):\s+(.*)/);
                        return (
                            <div key={idx} class="p-3 hover:bg-gray-50 even:bg-gray-50">
                                <div class="flex items-start gap-2 text-sm">
                                    <div class="w-[6px] h-[6px] mt-2 rounded-full bg-gray-400"></div>
                                    <div class="flex-1">
                                        {logParts && (
                                            <>
                                                <div class="flex gap-2 items-baseline">
                                                    <span class="text-gray-500">{logParts[1]}</span>
                                                    <span class={`px-2 py-1 rounded text-xs font-medium ${logParts[2] === 'ERROR' ? 'bg-red-100 text-red-800' :
                                                            logParts[2] === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {logParts[2]}
                                                    </span>
                                                </div>
                                                <div class="mt-1 font-mono text-gray-700">
                                                    {logParts[3]}
                                                </div>
                                            </>
                                        )}
                                        {!logParts && (
                                            <div class="text-gray-700">{log}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div class="mt-4 flex gap-2 justify-end">
                <button
                    onClick$={() => location.reload()}
                    class="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 cursor-pointer transition-colors"
                >
                    <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                    <span>Aggiorna ora</span>
                </button>
                <button
                    onClick$={downloadLogs}
                    class="cursor-pointer flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
                        />
                    </svg>
                    <span>Scarica log</span>
                </button>
            </div>
        </div>
    );
=======
  return <></>;
>>>>>>> master
});
