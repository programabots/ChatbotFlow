// WhatsApp Business API utilities
export interface WhatsAppMessage {
  from: string;
  text?: {
    body: string;
  };
  type: 'text' | 'image' | 'audio' | 'video' | 'document';
  timestamp: string;
}

export interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: WhatsAppMessage[];
        statuses?: Array<{
          id: string;
          status: 'sent' | 'delivered' | 'read' | 'failed';
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

export class WhatsAppAPI {
  private accessToken: string;
  private phoneNumberId: string;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  }

  async sendMessage(to: string, message: string): Promise<void> {
    if (!this.accessToken || !this.phoneNumberId) {
      console.error('WhatsApp API credentials not configured');
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: {
            preview_url: false,
            body: message
          }
        })
      });

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.status}`);
      }

      console.log('Message sent successfully to', to);
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      throw error;
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    if (!this.accessToken || !this.phoneNumberId) {
      console.error('WhatsApp API credentials not configured');
      return;
    }

    try {
      await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        })
      });
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  }

  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'your_verify_token';
    
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('Webhook verified successfully');
      return challenge;
    }
    
    console.error('Webhook verification failed');
    return null;
  }
}

export const whatsappAPI = new WhatsAppAPI();
