export interface SiteMetaFormData {
  site_title: string;
  site_description: string;
}

export interface SiteMetaFormProps {
  initialData?: SiteMetaFormData;
  onSubmit?: (data: SiteMetaFormData) => Promise<void>;
  onChange?: (data: SiteMetaFormData) => void;
  loading?: boolean;
  hideSubmitButton?: boolean;
}

export interface UseSiteMetaReturn {
  metaData: SiteMetaFormData;
  loading: boolean;
  error: string | null;
  success: boolean;
  updateMetaData: (data: SiteMetaFormData) => Promise<void>;
  resetStatus: () => void;
}
