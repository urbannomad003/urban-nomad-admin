import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
}

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  private readonly http = inject(HttpClient);
  private readonly cloudName = 'dzj5bdaje';
  private readonly uploadPreset = 'heart_beauty_upload';

  async uploadImage(file: File): Promise<string> {
    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    try {
      const response = await firstValueFrom(
        this.http.post<CloudinaryUploadResponse>(url, formData),
      );

      if (!response?.secure_url) {
        throw new Error('Cloudinary response did not include a secure_url.');
      }

      return response.secure_url;
    } catch (error) {
      console.error('[CloudinaryService] Upload failed:', error);
      throw error;
    }
  }

  async deleteImage(imageUrlOrPublicId: string): Promise<void> {
    // Keep API Key and API Secret strictly on a backend endpoint rather than in Angular.
    console.warn(
      `[CloudinaryService] Skipping client-side delete for "${imageUrlOrPublicId}". Wire this to a backend endpoint using your server-side Cloudinary credentials.`,
    );
  }
}