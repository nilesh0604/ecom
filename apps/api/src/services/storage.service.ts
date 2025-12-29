import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import config from '../config';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

interface UploadOptions {
  folder?: string;
  contentType?: string;
  metadata?: Record<string, string>;
  isPublic?: boolean;
}

interface UploadResult {
  key: string;
  url: string;
  bucket: string;
  size?: number;
  contentType?: string;
}

class StorageService {
  private s3Client: S3Client | null = null;
  private bucket: string;
  private region: string;
  private isConfigured: boolean = false;
  private localStoragePath: string;

  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET || '';
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.localStoragePath = config.upload.dir;

    // Initialize S3 client if credentials are provided
    if (
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      this.bucket
    ) {
      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
      this.isConfigured = true;
      logger.info('S3 storage service initialized');
    } else {
      logger.info('S3 not configured, using local file storage');
    }

    // Ensure local storage directory exists
    if (!fs.existsSync(this.localStoragePath)) {
      fs.mkdirSync(this.localStoragePath, { recursive: true });
    }
  }

  /**
   * Check if S3 is configured
   */
  isS3Configured(): boolean {
    return this.isConfigured;
  }

  /**
   * Generate a unique file key
   */
  private generateFileKey(originalName: string, folder?: string): string {
    const ext = path.extname(originalName).toLowerCase();
    const hash = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const key = `${timestamp}-${hash}${ext}`;
    return folder ? `${folder}/${key}` : key;
  }

  /**
   * Upload file to S3 or local storage
   */
  async uploadFile(
    file: Express.Multer.File,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const { folder = 'uploads', contentType, metadata, isPublic = true } = options;
    const key = this.generateFileKey(file.originalname, folder);

    if (this.isConfigured && this.s3Client) {
      return this.uploadToS3(file, key, {
        contentType: contentType || file.mimetype,
        metadata,
        isPublic,
      });
    } else {
      return this.uploadToLocal(file, key);
    }
  }

  /**
   * Upload file to S3
   */
  private async uploadToS3(
    file: Express.Multer.File,
    key: string,
    options: { contentType?: string; metadata?: Record<string, string>; isPublic?: boolean }
  ): Promise<UploadResult> {
    if (!this.s3Client) {
      throw new AppError('S3 client not initialized', 500, 'STORAGE_ERROR');
    }

    const fileContent = file.buffer || fs.readFileSync(file.path);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: fileContent,
      ContentType: options.contentType,
      Metadata: options.metadata,
      ACL: options.isPublic ? 'public-read' : 'private',
    });

    try {
      await this.s3Client.send(command);

      const url = options.isPublic
        ? `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`
        : await this.getSignedUrl(key);

      logger.info(`File uploaded to S3: ${key}`);

      // Clean up local temp file if exists
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        key,
        url,
        bucket: this.bucket,
        size: file.size,
        contentType: options.contentType,
      };
    } catch (error) {
      logger.error('S3 upload error:', error);
      throw new AppError('Failed to upload file to S3', 500, 'UPLOAD_ERROR');
    }
  }

  /**
   * Upload file to local storage
   */
  private async uploadToLocal(
    file: Express.Multer.File,
    key: string
  ): Promise<UploadResult> {
    const filePath = path.join(this.localStoragePath, key);
    const directory = path.dirname(filePath);

    // Ensure directory exists
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // If file was uploaded via multer diskStorage, it's already saved
    if (file.path && fs.existsSync(file.path)) {
      // Move file to final destination
      fs.renameSync(file.path, filePath);
    } else if (file.buffer) {
      // Write buffer to file
      fs.writeFileSync(filePath, file.buffer);
    }

    const url = `/uploads/${key}`;

    logger.info(`File uploaded locally: ${key}`);

    return {
      key,
      url,
      bucket: 'local',
      size: file.size,
      contentType: file.mimetype,
    };
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Express.Multer.File[],
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    return Promise.all(files.map((file) => this.uploadFile(file, options)));
  }

  /**
   * Delete file from S3 or local storage
   */
  async deleteFile(key: string): Promise<void> {
    if (this.isConfigured && this.s3Client) {
      await this.deleteFromS3(key);
    } else {
      await this.deleteFromLocal(key);
    }
  }

  /**
   * Delete file from S3
   */
  private async deleteFromS3(key: string): Promise<void> {
    if (!this.s3Client) {
      throw new AppError('S3 client not initialized', 500, 'STORAGE_ERROR');
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
      logger.info(`File deleted from S3: ${key}`);
    } catch (error) {
      logger.error('S3 delete error:', error);
      throw new AppError('Failed to delete file from S3', 500, 'DELETE_ERROR');
    }
  }

  /**
   * Delete file from local storage
   */
  private async deleteFromLocal(key: string): Promise<void> {
    const filePath = path.join(this.localStoragePath, key);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`File deleted locally: ${key}`);
    }
  }

  /**
   * Get a signed URL for private file access
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.isConfigured || !this.s3Client) {
      // Return local URL for non-S3 storage
      return `/uploads/${key}`;
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      logger.error('Error generating signed URL:', error);
      throw new AppError('Failed to generate signed URL', 500, 'URL_ERROR');
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    if (this.isConfigured && this.s3Client) {
      try {
        const command = new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        });
        await this.s3Client.send(command);
        return true;
      } catch {
        return false;
      }
    } else {
      const filePath = path.join(this.localStoragePath, key);
      return fs.existsSync(filePath);
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(prefix: string = ''): Promise<string[]> {
    if (this.isConfigured && this.s3Client) {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
      });

      try {
        const response = await this.s3Client.send(command);
        return response.Contents?.map((item) => item.Key || '') || [];
      } catch (error) {
        logger.error('S3 list error:', error);
        throw new AppError('Failed to list files', 500, 'LIST_ERROR');
      }
    } else {
      const dirPath = path.join(this.localStoragePath, prefix);
      if (!fs.existsSync(dirPath)) return [];

      const files: string[] = [];
      const items = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const item of items) {
        if (item.isFile()) {
          files.push(path.join(prefix, item.name));
        }
      }

      return files;
    }
  }

  /**
   * Get file URL (public or signed)
   */
  getFileUrl(key: string, isPublic: boolean = true): string {
    if (this.isConfigured) {
      if (isPublic) {
        return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
      }
      // For private files, caller should use getSignedUrl
      return key;
    }
    return `/uploads/${key}`;
  }

  /**
   * Upload from URL (download and upload to storage)
   */
  async uploadFromUrl(
    url: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new AppError('Failed to fetch file from URL', 400, 'FETCH_ERROR');
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const urlPath = new URL(url).pathname;
    const filename = path.basename(urlPath) || 'file';

    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: filename,
      encoding: '7bit',
      mimetype: contentType,
      buffer,
      size: buffer.length,
      stream: null as any,
      destination: '',
      filename: '',
      path: '',
    };

    return this.uploadFile(file, { ...options, contentType });
  }
}

// Export singleton instance
export const storageService = new StorageService();
export { StorageService };
export type { UploadOptions, UploadResult };

