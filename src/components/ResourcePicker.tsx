import { For, JSX, Show, Suspense, createEffect, createResource, createSignal, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";

type ResourcePickerProps<T> = {
  title: string;
  value: T | null | undefined;

  placeholder?: string;
  disabled?: boolean;
  class?: string;

  loadItems: () => (Promise<T[]> | T[]);
  onSelect: (item: T) => void;

  renderValue: (item: T) => JSX.Element;
};

export function ResourcePicker<T>(props: ResourcePickerProps<T>) {
  const [open, setOpen] = createSignal(false);

  const [items] = createResource(open, async (isOpen) => {
    if (!isOpen) return [];
    return props.loadItems();
  });

  const close = () => setOpen(false);

  createEffect(() => {
    if (!open()) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    window.addEventListener("keydown", onKeyDown);
    onCleanup(() => window.removeEventListener("keydown", onKeyDown));
  });

  return (
    <button 
        class={`w-full text-left rounded-md border p-2 ${props.class ?? ""}`} 
        disabled={props.disabled} 
        onClick={() => setOpen(true)}
    >
        <Show
            when={props.value != null}
            fallback={<p class="italic text-sm">{props.placeholder ?? "Not set"}</p>}
        >
            {props.renderValue(props.value!)}
        </Show>

        <Show when={open()}>
            <Portal>
                <div
                    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    onClick={close}
                >
                    <div
                        class="w-full max-w-md rounded-lg border bg-gray-800 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div class="flex items-center justify-between border-b px-4 py-3">
                            <h3 class="font-semibold text-white">{props.title}</h3>
                            <button type="button" class="text-sm text-gray-300" onClick={close}>
                                Close
                            </button>
                        </div>

                        <div class="max-h-96 overflow-y-auto p-2">
                            <Suspense fallback={<div class="p-4 text-center text-white">Loading...</div>}>
                                <For each={items() ?? []}>
                                    {(item) => (
                                        <button
                                            type="button"
                                            class="flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-gray-700/50"
                                            onClick={() => {
                                                props.onSelect(item);
                                                close();
                                            }}
                                        >
                                            {props.renderValue(item)}
                                        </button>
                                    )}
                                </For>
                            </Suspense>
                        </div>
                    </div>
                </div>
            </Portal>
        </Show>
    </button>
  );
}