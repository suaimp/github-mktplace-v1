import { supabase } from "../../lib/supabase";

export interface ArticleDocument {
  id: string;
  name: string;
  bucket_id: string;
  owner: string;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  metadata: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
  };
}

export class ArticleDocumentsService {
  private static bucketName = "article_documents";

  /**
   * Fazer upload de um arquivo para o bucket
   */
  static async uploadFile(
    filePath: string,
    file: File
  ): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Fazer download de um arquivo do bucket
   */
  static async downloadFile(
    filePath: string
  ): Promise<{ data: Blob | null; error: any }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .download(filePath);

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Obter URL pública temporária para download
   */
  static async getSignedUrl(
    filePath: string,
    expiresIn: number = 3600
  ): Promise<{ data: { signedUrl: string } | null; error: any }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, expiresIn);

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Verificar se um arquivo existe
   */
  static async fileExists(filePath: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list("", {
          limit: 1,
          search: filePath
        });

      if (error) return false;

      return data && data.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Listar arquivos do bucket
   */
  static async listFiles(
    path: string = ""
  ): Promise<{ data: ArticleDocument[] | null; error: any }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(path);

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Deletar um arquivo
   */
  static async deleteFile(
    filePath: string
  ): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Obter informações de um arquivo
   */
  static async getFileInfo(
    filePath: string
  ): Promise<{ data: ArticleDocument | null; error: any }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list("", {
          limit: 1,
          search: filePath
        });

      if (error) return { data: null, error };

      const fileInfo = data && data.length > 0 ? data[0] : null;
      return { data: fileInfo as ArticleDocument, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}
