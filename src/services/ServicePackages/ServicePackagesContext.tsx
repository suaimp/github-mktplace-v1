import { createContext, useContext } from "react";

interface ServicePackagesContextProps {
  fetchServices: () => void;
}

export const ServicePackagesContext =
  createContext<ServicePackagesContextProps>({
    fetchServices: () => {}
  });

export const useServicePackages = () => useContext(ServicePackagesContext);
