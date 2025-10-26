import { component$, Slot } from "@builder.io/qwik";

export default component$(() => {
  return (
    <div
      data-theme="pastel"
      class="min-h-screen bg-base-300 text-base-content"
    >
      <div class="container mx-auto px-4">
        <Slot />
      </div>
    </div>
  );
});
