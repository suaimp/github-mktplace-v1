import { useState, useEffect } from "react";
import Select from "../Select";
import MultiSelect from "../MultiSelect";

interface BrazilianStatesFieldProps {
  field: any;
  settings: any;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  onErrorClear?: () => void;
}

interface State {
  id: number;
  sigla: string;
  nome: string;
  regiao: {
    id: number;
    sigla: string;
    nome: string;
  };
}

interface City {
  id: number;
  nome: string;
}

export default function BrazilianStatesField({
  value,
  onChange,
  error,
  onErrorClear,
  settings // garantir que settings está presente nos parâmetros
}: BrazilianStatesFieldProps) {
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);

  // Parse value from string if needed
  const parsedValue =
    typeof value === "string" ? JSON.parse(value || "{}") : value || {};
  const multiSelect = settings?.max_selections !== 1;

  useEffect(() => {
    loadStates();
  }, []);

  useEffect(() => {
    if (parsedValue.state) {
      loadCities(parsedValue.state);
    }
  }, [parsedValue.state]);

  async function loadStates() {
    try {
      setLoading(true);
      const response = await fetch("https://brasilapi.com.br/api/ibge/uf/v1");
      if (!response.ok) {
        throw new Error(`Failed to fetch states: ${response.status}`);
      }
      const data = await response.json();
      setStates(
        data.sort((a: State, b: State) => a.nome.localeCompare(b.nome))
      );
    } catch (err) {
      console.error("Error loading states:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadCities(stateCode: string) {
    if (!stateCode) return;

    try {
      setLoading(true);
      const response = await fetch(
        `https://brasilapi.com.br/api/ibge/municipios/v1/${stateCode}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch cities: ${response.status}`);
      }
      const data = await response.json();
      setCities(data.sort((a: City, b: City) => a.nome.localeCompare(b.nome)));
    } catch (err) {
      console.error("Error loading cities:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleStateChange = (stateCode: string) => {
    const state = states.find((s) => s.sigla === stateCode);
    const newValue = {
      ...parsedValue,
      state: stateCode,
      state_name: state?.nome || "",
      cities: [], // Reset cities when state changes
      city_names: [] // Reset city names when state changes
    };

    onChange(newValue);

    if (error && onErrorClear) {
      onErrorClear();
    }
  };

  const handleCityChange = (selectedCities: string[]) => {
    const newValue = {
      ...parsedValue,
      cities: selectedCities,
      city_names: selectedCities
    };

    onChange(newValue);

    if (error && onErrorClear) {
      onErrorClear();
    }
  };

  if (loading && states.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400">
        Carregando estados...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Select
          options={states.map((state) => ({
            value: state.sigla,
            label: `${state.nome} (${state.sigla})`
          }))}
          value={parsedValue.state || ""}
          onChange={handleStateChange}
          placeholder="Selecione o estado"
        />
      </div>

      {parsedValue.state && (
        <div>
          {loading && cities.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400">
              Carregando cidades...
            </div>
          ) : multiSelect ? (
            <MultiSelect
              options={cities.map((city) => ({
                value: city.nome,
                text: city.nome
              }))}
              defaultSelected={parsedValue.cities || []}
              onChange={handleCityChange}
              maxSelections={settings?.max_selections}
            />
          ) : (
            <Select
              options={cities.map((city) => ({
                value: city.nome,
                label: city.nome
              }))}
              value={parsedValue.cities?.[0] || ""}
              onChange={(cityName) => handleCityChange([cityName])}
              placeholder="Selecione a cidade"
            />
          )}
        </div>
      )}

      {error && <p className="text-sm text-error-500">{error}</p>}
    </div>
  );
}
