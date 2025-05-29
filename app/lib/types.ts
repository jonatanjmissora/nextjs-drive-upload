export interface UploadedFile {
  id: string
  name: string
  size: number
  preview: string
  status: "pending" | "uploading" | "success" | "error"
  progress: number
  driveId?: string
  error?: string
}

export interface UserInfo {
  email: string
  name: string
  avatar: string
}

export interface DriveItem {
  id: string
  name: string
  type: "file" | "folder"
  mimeType?: string
  size?: number
  modifiedTime?: string
  iconUrl?: string
}

export interface DriveFolder {
  id: string
  name: string
  items: DriveItem[]
}
