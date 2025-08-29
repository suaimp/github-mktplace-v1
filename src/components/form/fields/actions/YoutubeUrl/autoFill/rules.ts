// Regras para auto preenchimento de campos do formulário com dados do YouTube
import { AutoFillRule } from './types';

export const autoFillRules: AutoFillRule[] = [
  {
    fieldType: 'brand',
    apply: ({ channelInfo, formFields, updateFormValue }) => {
  // Preenche o primeiro campo do tipo 'brand' com o título do canal
  const brandField = formFields.find(f => f.field_type === 'brand');
      if (brandField && channelInfo?.snippet?.title) {
        updateFormValue(
          brandField.id,
          JSON.stringify({ name: channelInfo.snippet.title, logo: '' })
        );
      }
    }
  },
  // Preencher campo de inscritos (subscriber_count)
  {
    fieldType: 'subscriber_count',
    apply: ({ channelInfo, formFields, updateFormValue }) => {
      const subField = formFields.find(f => f.field_type === 'subscriber_count');
      if (subField && channelInfo?.statistics?.subscriberCount) {
        const subs = Number(channelInfo.statistics.subscriberCount);
        console.log('[autofill] Inscritos extraídos:', subs, 'para o campo', subField);
        updateFormValue(subField.id, subs);
      }
    }
  },
  // Preencher campo de engajamento (porcentagem: média de views por vídeo sobre inscritos)
  // Preencher campo de nome do canal (channel_name)
  {
    fieldType: 'channel_name',
    apply: ({ channelInfo, formFields, updateFormValue }) => {
      const nameField = formFields.find(f => f.field_type === 'channel_name');
      if (nameField && channelInfo?.snippet?.title) {
        updateFormValue(nameField.id, channelInfo.snippet.title);
      }
    }
  },
  // Preencher campo de logo do canal (channel_logo)
  {
    fieldType: 'channel_logo',
    apply: ({ channelInfo, formFields, updateFormValue }) => {
      const logoField = formFields.find(f => f.field_type === 'channel_logo');
  // Pegar a thumbnail 'default' conforme preferência (usado como logo)
  const thumbnails = channelInfo?.snippet?.thumbnails;
  const logoUrl = thumbnails?.default?.url || '';
      if (logoField && logoUrl) {
        updateFormValue(logoField.id, logoUrl);
      }
    }
  },
  {
    fieldType: 'engagement',
    apply: ({ channelInfo, formFields, updateFormValue }) => {
      const engagementField = formFields.find(f => f.field_type === 'engagement');
      const views = Number(channelInfo?.statistics?.viewCount) || 0;
      const videos = Number(channelInfo?.statistics?.videoCount) || 0;
      const subs = Number(channelInfo?.statistics?.subscriberCount) || 0;
      if (engagementField && views > 0 && videos > 0 && subs > 0) {
        // Engajamento (%) = (média de views por vídeo / inscritos) * 100
        const avgViews = views / videos;
        const engagementPercent = Math.round((avgViews / subs) * 100);
        updateFormValue(engagementField.id, engagementPercent);
      }
    }
  },
];
