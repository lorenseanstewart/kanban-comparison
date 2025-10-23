import { ErrorComponent } from "@tanstack/solid-router";
import type { ErrorComponentProps } from "@tanstack/solid-router";

export function UserErrorComponent(props: ErrorComponentProps) {
  return <ErrorComponent error={props.error} />;
}
