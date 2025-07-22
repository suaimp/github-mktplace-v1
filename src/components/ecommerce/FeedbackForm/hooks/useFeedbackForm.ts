import { useState, useEffect } from "react";
import { FeedbackFormState } from "../types/user";
import useUserData from "./useUserData";

/**
 * Hook para gerenciar o estado do formulário de feedback
 */
export default function useFeedbackForm() {
  const { profile, isLoading: isLoadingUser, error: userError } = useUserData();
  
  const [formData, setFormData] = useState<FeedbackFormState>({
    name: "",
    email: "",
    phone: "",
    category: 0,
    subject: "",
    message: ""
  });

  // Preencher dados do usuário quando carregados
  useEffect(() => {
    if (profile) {
      const fullName = `${profile.first_name} ${profile.last_name}`.trim();
      
      setFormData(prev => ({
        ...prev,
        name: fullName,
        email: profile.email,
        phone: profile.phone || ""
      }));
    }
  }, [profile]);

  const updateFormData = (field: keyof FeedbackFormState, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    if (profile) {
      const fullName = `${profile.first_name} ${profile.last_name}`.trim();
      
      setFormData({
        name: fullName,
        email: profile.email,
        phone: profile.phone || "",
        category: 0,
        subject: "",
        message: ""
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        category: 0,
        subject: "",
        message: ""
      });
    }
  };

  return {
    formData,
    updateFormData,
    resetForm,
    isLoadingUser,
    userError,
    profile
  };
}
