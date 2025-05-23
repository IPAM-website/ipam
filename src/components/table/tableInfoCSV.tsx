import { component$ } from "@builder.io/qwik";
import { CSVInfoDBTableMaps } from "~/tableMaps";
import { inlineTranslate } from "qwik-speak";

interface TableInfoCSVProps {
  tableName: string;
}

export default component$<TableInfoCSVProps>(({ tableName }) => {
  const t = inlineTranslate();
  return (
    <>
      <div class="p-4">
        <div class="mb-3 flex items-center gap-2">
          <svg
            class="h-5 w-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 17v-2a4 4 0 014-4h2a4 4 0 014 4v2M7 17v-2a4 4 0 014-4h2a4 4 0 014 4v2"
            />
          </svg>
          <p class="text-sm text-gray-700">
            {t("runtime.tableInfoCSV.titlePt1")} <span class="font-semibold text-cyan-700">CSV</span> {t("runtime.tableInfoCSV.titlePt2")}
          </p>
        </div>
        <div class="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-md">
          <table class="min-w-full text-sm">
            <thead>
              <tr>
                {CSVInfoDBTableMaps[tableName].keys.map((col) => (
                  <th
                    key={col}
                    class="border-b border-gray-200 bg-cyan-50 px-3 py-2 font-semibold text-cyan-800"
                  >
                    {col}
                  </th>
                ))}
                {/*<th class="px-3 py-2 bg-cyan-50 text-cyan-800 font-semibold border-b border-gray-200">nomeucliente</th>
                                <th class="px-3 py-2 bg-cyan-50 text-cyan-800 font-semibold border-b border-gray-200">cognomeucliente</th>
                                <th class="px-3 py-2 bg-cyan-50 text-cyan-800 font-semibold border-b border-gray-200">emailucliente</th>
                                <th class="px-3 py-2 bg-cyan-50 text-cyan-800 font-semibold border-b border-gray-200">pwducliente</th>
                                <th class="px-3 py-2 bg-cyan-50 text-cyan-800 font-semibold border-b border-gray-200">idcliente</th>*/}
              </tr>
            </thead>
            <tbody class="text-center">
              <tr class="even:bg-gray-50">
                {CSVInfoDBTableMaps[tableName].example?.map((col) => (
                  <td key={col} class="border-b border-gray-100 px-3 py-2">
                    {col}
                  </td>
                ))}
              </tr>
              {/*<tr class="even:bg-gray-50">
                                <td class="px-3 py-2 border-b border-gray-100">Mario</td>
                                <td class="px-3 py-2 border-b border-gray-100">Rossi</td>
                                <td class="px-3 py-2 border-b border-gray-100">mario.rossi@email.com</td>
                                <td class="px-3 py-2 border-b border-gray-100">Password123</td>
                                <td class="px-3 py-2 border-b border-gray-100">1</td>
                            </tr>
                            <tr class="even:bg-gray-50">
                                <td class="px-3 py-2 border-b border-gray-100">Anna</td>
                                <td class="px-3 py-2 border-b border-gray-100">Bianchi</td>
                                <td class="px-3 py-2 border-b border-gray-100">anna.bianchi@email.com</td>
                                <td class="px-3 py-2 border-b border-gray-100">Qwerty456</td>
                                <td class="px-3 py-2 border-b border-gray-100">2</td>
                            </tr>*/}
            </tbody>
          </table>
        </div>
        <div class="mt-5 flex items-center gap-2 rounded border-l-4 border-cyan-400 bg-cyan-50 px-4 py-2">
          <svg
            class="h-5 w-5 text-cyan-600"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
            />
          </svg>
          <span class="text-sm text-cyan-800">
            {t("runtime.tableInfoCSV.warning")}
          </span>
        </div>
      </div>
    </>
  );
});
