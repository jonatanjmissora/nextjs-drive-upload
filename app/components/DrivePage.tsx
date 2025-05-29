"use client"

import { GoogleDriveUploader } from "./google-drive/google-drive-uploader"

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Google Drive Image Uploader</h1>
        <p className="text-muted-foreground">Upload your images directly to Google Drive with drag & drop support</p>
      </div>
      <GoogleDriveUploader />
    </div>
  )
}