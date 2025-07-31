import { useState, useEffect } from 'react';
import Input from '../../../components/form/input/InputField';
import Label from '../../../components/form/Label';
import Button from '../../../components/ui/button/Button';
import { SiteMetaFormProps, SiteMetaFormData } from '../types';

export default function SiteMetaForm({ 
  initialData,
  onSubmit, 
  onChange,
  loading = false, 
  hideSubmitButton = false 
}: SiteMetaFormProps) {
  const [formData, setFormData] = useState<SiteMetaFormData>({
    site_title: '',
    site_description: ''
  });

  // Atualizar formData quando initialData mudar
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (field: keyof SiteMetaFormData, value: string) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    setFormData(newFormData);
    
    // Notifica o componente pai sobre as mudanças
    if (onChange) {
      onChange(newFormData);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      await onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label>Título do Site</Label>
        <Input
          type="text"
          value={formData.site_title}
          onChange={(e) => handleInputChange('site_title', e.target.value)}
          placeholder="Ex: Sua Imprensa Marketplace"
          maxLength={100}
          required
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Este título aparecerá na aba do navegador e nos resultados de busca
        </p>
      </div>

      <div>
        <Label>Descrição do Site</Label>
        <Input
          type="text"
          value={formData.site_description}
          onChange={(e) => handleInputChange('site_description', e.target.value)}
          placeholder="Ex: Marketplace de compra e venda de Backlinks"
          maxLength={300}
          required
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Esta descrição aparecerá nos resultados de busca e redes sociais
        </p>
      </div>

      {!hideSubmitButton && (
        <div className="flex justify-end pt-4">
          <Button disabled={loading}>
            {loading ? "Salvando..." : "Salvar Metadados"}
          </Button>
        </div>
      )}
    </form>
  );
}
