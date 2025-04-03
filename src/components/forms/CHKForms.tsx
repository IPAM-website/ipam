import { component$ } from "@builder.io/qwik";

interface TextBoxFormProps { id: string, value?: boolean, name: string, nameCHK: string }

export default component$<TextBoxFormProps>(({ id, value, name, nameCHK }) => {
    return (
        <>
            <div class="flex items-center ml-5 mt-5">
                    <label for={"chk"+id} class="select-none text-black font-semibold">
                        {nameCHK}
                    </label>
                <input type="checkbox" id={"chk"+id} class="ml-4" checked={value} name={name}  />
            </div>
        </>
    )
})