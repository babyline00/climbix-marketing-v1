"use client";

import * as React from "react";

/** Injects admin-provided custom HTML into <head> / end of <body>.
 *  Uses insertAdjacentHTML so arbitrary isolated tags render correctly. */
export function CustomCodeInjector({
  head,
  footer,
}: {
  head: string;
  footer: string;
}) {
  React.useEffect(() => {
    if (head) {
      document.head.insertAdjacentHTML("beforeend", head);
    }
  }, [head]);

  React.useEffect(() => {
    if (footer) {
      document.body.insertAdjacentHTML("beforeend", footer);
    }
  }, [footer]);

  return null;
}