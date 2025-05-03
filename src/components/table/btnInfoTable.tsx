import { component$ } from "@builder.io/qwik";


interface InfoTableProps {
    showPreviewInfo: () => void;
}

export default component$<InfoTableProps>(({ showPreviewInfo }) => {

    return (
        <>
            <button
                type="button"
                class="flex has-tooltip items-center justify-center w-7 h-7 rounded-full bg-black hover:bg-gray-800 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
                onClick$={() => { showPreviewInfo() }}
                tabIndex={0}
            >
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                </svg>
                <span class="tooltip" >
                    {$localize`Info tabella`}
                </span>
            </button>

        </>
    )
})