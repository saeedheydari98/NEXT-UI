export function scrollToFirstInvalidField(root: ParentNode | null = document) {
  if (typeof document === "undefined") return;

  const field = root?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]');
  field?.scrollIntoView({ behavior: "smooth", block: "center" });
  if (typeof field?.focus === "function") {
    window.setTimeout(() => field.focus(), 200);
  }
}
