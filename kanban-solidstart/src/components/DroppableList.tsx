import { createDroppable } from "@thisbeyond/solid-dnd";
import { type JSX, Show, createSignal, onMount } from "solid-js";

export function DroppableList(props: {
  listId: string;
  children: JSX.Element;
}) {
  const [mounted, setMounted] = createSignal(false);

  onMount(() => {
    setMounted(true);
  });

  return (
    <Show when={mounted()} fallback={props.children}>
      <DroppableContent listId={props.listId}>
        {props.children}
      </DroppableContent>
    </Show>
  );
}

function DroppableContent(props: {
  listId: string;
  children: JSX.Element;
}) {
  const droppable = createDroppable(`list-${props.listId}`);

  return (
    <div class="relative w-full min-h-[800px]">
      {/* Visual indicator - sits behind content */}
      <div
        class="absolute inset-0 rounded-lg transition-all duration-200 pointer-events-none"
        classList={{
          "ring-4 ring-primary ring-offset-2 bg-primary/5 scale-[1.02]": droppable.isActiveDroppable,
        }}
      />
      {/* Droppable detection layer - sits on top to catch all hover events */}
      <div
        ref={droppable.ref}
        class="absolute inset-0 pointer-events-auto"
      />
      {/* Content */}
      <div class="relative">
        {props.children}
      </div>
    </div>
  );
}