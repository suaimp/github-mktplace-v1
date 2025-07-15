import React from "react";
import { InstallmentOption } from "./types";
import Select from "../../../form/Select";

interface InstallmentsOptionsProps {
  options: InstallmentOption[];
  selected: number;
  onSelect: (installments: number) => void;
}

const InstallmentsOptions: React.FC<InstallmentsOptionsProps> = ({ options, selected, onSelect }) => {
  // Monta as opções no formato esperado pelo Select customizado
  const selectOptions = options.map(opt => ({
    value: String(opt.installments),
    label: `${opt.installments}x de ${opt.formatted_amount} ${opt.interest ? "(com juros)" : "(sem juros)"}`
  }));

  return (
    <div className="mb-4">
      <label className="block font-medium mb-2">Parcelamento</label>
      <Select
        options={selectOptions}
        placeholder="Selecione o número de parcelas"
        value={selected ? String(selected) : ""}
        onChange={val => onSelect(Number(val))}
        className="z-20"
      />
    </div>
  );
};

export default InstallmentsOptions; 