"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, CheckCircle, AlertCircle, X } from "lucide-react"
import type { UploadedFile } from "@/app/lib/types"
import { formatFileSize } from "@/app/lib/utils"

interface UploadQueueProps {
  files: UploadedFile[]
  onUploadFile: (fileId: string) => Promise<void>
  onRemoveFile: (fileId: string) => void
  isAuthenticated: boolean
  onAuthenticate: () => Promise<boolean>
}

export function UploadQueue({ files, onUploadFile, onRemoveFile, isAuthenticated, onAuthenticate }: UploadQueueProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Queue</CardTitle>
        <CardDescription>
          {files.length} file{files.length !== 1 ? "s" : ""} ready for upload
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {files.map((file) => (
          <div key={file.id} className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="relative w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
              <img src={file.preview || "/placeholder.svg"} alt={file.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{file.name}</p>
                <Badge variant="secondary" className="text-xs">
                  {formatFileSize(file.size)}
                </Badge>
                <Badge
                  variant={
                    file.status === "success"
                      ? "default"
                      : file.status === "error"
                        ? "destructive"
                        : file.status === "uploading"
                          ? "secondary"
                          : "outline"
                  }
                >
                  {file.status === "pending" && "Ready"}
                  {file.status === "uploading" && "Uploading"}
                  {file.status === "success" && "Uploaded"}
                  {file.status === "error" && "Failed"}
                </Badge>
              </div>

              {file.status === "uploading" && (
                <div className="space-y-1">
                  <Progress value={file.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">{Math.round(file.progress)}% uploaded</p>
                </div>
              )}

              {file.status === "error" && file.error && <p className="text-xs text-destructive">{file.error}</p>}

              {file.status === "success" && file.driveId && (
                <p className="text-xs text-muted-foreground">Drive ID: {file.driveId}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {file.status === "pending" && (
                <Button size="sm" onClick={() => onUploadFile(file.id)} disabled={!isAuthenticated}>
                  <Upload className="h-4 w-4 mr-1" />
                  Upload
                </Button>
              )}

              {file.status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}

              {file.status === "error" && <AlertCircle className="h-5 w-5 text-destructive" />}

              <Button size="sm" variant="ghost" onClick={() => onRemoveFile(file.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <div className="flex gap-2 pt-4">
          <Button
            onClick={async () => {
              if (!isAuthenticated) {
                await onAuthenticate()
              }
              files.filter((f) => f.status === "pending").forEach((f) => onUploadFile(f.id))
            }}
            disabled={files.filter((f) => f.status === "pending").length === 0}
          >
            Upload All Pending
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              files.forEach((f) => URL.revokeObjectURL(f.preview))
              onRemoveFile("all")
            }}
          >
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
