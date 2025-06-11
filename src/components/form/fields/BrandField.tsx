import { useState, useEffect } from "react";
import Input from "../input/InputField";
import { supabase } from "../../../lib/supabase";
import Button from "../../ui/button/Button";

interface BrandFieldProps {
  value: any;
  onChange: (value: any) => void;
  error?: string;
  onErrorClear?: () => void;
}

export default function BrandField({
  value,
  onChange,
  error,
  onErrorClear
}: BrandFieldProps) {
  const [brandName, setBrandName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  // Parse value from string if needed
  useEffect(() => {
    try {
      let parsedValue: { name?: string; logo?: string } = {};
      try {
        parsedValue =
          typeof value === "string" ? JSON.parse(value || "{}") : value || {};
      } catch (parseError) {
        console.log(
          "Failed to parse JSON in BrandField, using empty object:",
          value
        );
        parsedValue = {};
      }
      setBrandName(parsedValue.name || "");
      setLogoUrl(parsedValue.logo || "");

      // Generate preview URL if logo exists
      if (parsedValue.logo) {
        generatePreviewUrl(parsedValue.logo);
      }
    } catch (err) {
      console.error("Error parsing brand value:", err);
      setBrandName("");
      setLogoUrl("");
    }
  }, [value]);

  // Generate preview URL for stored logo
  const generatePreviewUrl = async (logoPath: string) => {
    if (!logoPath) return;

    try {
      const { data } = supabase.storage
        .from("brand_logos")
        .getPublicUrl(logoPath);

      if (data?.publicUrl) {
        setPreviewUrl(data.publicUrl);
      }
    } catch (err) {
      console.error("Error generating preview URL:", err);
    }
  };

  // Handle brand name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setBrandName(newName);
    updateValue(newName, logoUrl);

    if (error && onErrorClear) {
      onErrorClear();
    }
  };

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (
      !file.type.startsWith("image/png") &&
      !file.type.startsWith("image/jpeg")
    ) {
      setUploadError("O arquivo deve ser uma imagem PNG ou JPG");
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("A imagem deve ter menos de 2MB");
      return;
    }

    // Create image object to check dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      // Check if image is square and max 512x512
      if (img.width !== img.height) {
        setUploadError("A imagem deve ser quadrada (mesma largura e altura)");
        URL.revokeObjectURL(objectUrl);
        return;
      }

      if (img.width > 512 || img.height > 512) {
        setUploadError("A imagem deve ter no máximo 512x512 pixels");
        URL.revokeObjectURL(objectUrl);
        return;
      }

      // Valid image
      setLogoFile(file);
      setPreviewUrl(objectUrl);
      setUploadError("");

      if (error && onErrorClear) {
        onErrorClear();
      }
    };

    img.onerror = () => {
      setUploadError("Erro ao carregar a imagem");
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  };

  // Upload logo to storage
  const handleUpload = async () => {
    if (!logoFile) return;

    try {
      setUploading(true);
      setUploadError("");

      // Generate unique filename
      const fileExt = logoFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("brand_logos")
        .upload(filePath, logoFile);

      if (uploadError) throw uploadError;

      // Update value with new logo path
      setLogoUrl(filePath);
      updateValue(brandName, filePath);
    } catch (err: any) {
      console.error("Error uploading logo:", err);
      setUploadError(err.message || "Erro ao fazer upload do logo");
    } finally {
      setUploading(false);
    }
  };

  // Update the combined value
  const updateValue = (name: string, logo: string) => {
    const newValue = {
      name,
      logo
    };
    onChange(JSON.stringify(newValue));
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Logo Upload */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleLogoChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:text-gray-400"
          />

          <div className="text-xs text-gray-500 dark:text-gray-400">
            PNG ou JPG, máximo 512x512px, 2MB
          </div>

          {logoFile && (
            <Button onClick={handleUpload} disabled={uploading} size="sm">
              {uploading ? "Enviando..." : "Enviar Logo"}
            </Button>
          )}
        </div>

        {previewUrl && (
          <div className="flex items-center justify-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <img
              src={previewUrl}
              alt="Logo Preview"
              className="max-w-[80px] max-h-[80px] object-contain"
            />
          </div>
        )}

        {uploadError && <p className="text-sm text-error-500">{uploadError}</p>}
      </div>

      {/* Brand Name Input */}
      <div>
        <Input
          type="text"
          value={brandName}
          onChange={handleNameChange}
          placeholder="Digite o nome da marca"
        />
      </div>

      {error && (
        <div className="col-span-2">
          <p className="text-sm text-error-500">{error}</p>
        </div>
      )}
    </div>
  );
}
