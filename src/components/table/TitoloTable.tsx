import { $, component$ } from "@builder.io/qwik";

interface TitoloTableProps {
  nomeTitolo?: string;
}

export default component$<TitoloTableProps>(({ nomeTitolo }) => {
  return (
    <div class="m-5 font-['Inter'] text-base leading-normal font-semibold text-black">
      {nomeTitolo}
    </div>
  );
});
