"use client";

import * as React from "react";
import { SERVICES, type ServiceContent } from "@/data/services";

/**
 * Server pages fetch the DB-merged catalog and feed it through this
 * provider so client components (header dropdowns, footer, contact form,
 * homepage grid) render admin-managed services — including newly created ones.
 */
const ServicesContext = React.createContext<ServiceContent[] | undefined>(
  undefined
);

export function ServicesProvider({
  services,
  children,
}: {
  services: ServiceContent[];
  children: React.ReactNode;
}) {
  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices(): ServiceContent[] {
  const services = React.useContext(ServicesContext);
  return services && services.length > 0 ? services : SERVICES;
}