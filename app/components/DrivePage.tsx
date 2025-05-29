"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Upload,
  ImageIcon,
  CheckCircle,
  AlertCircle,
  X,
  FolderOpen,
  Folder,
  File,
  MoreVertical,
  Plus,
  Trash2,
  RefreshCw,
  Home,
} from "lucide-react"

interface UploadedFile {
  id: string
  name: string
  size: number
  preview: string
  status: "pending" | "uploading" | "success" | "error"
  progress: number
  driveId?: string
  error?: string
}

interface UserInfo {
  email: string
  name: string
  avatar: string
}

interface DriveItem {
  id: string
  name: string
  type: "file" | "folder"
  mimeType?: string
  size?: number
  modifiedTime?: string
  iconUrl?: string
}

interface DriveFolder {
  id: string
  name: string
  items: DriveItem[]
}

// Mock Google Drive data
const mockDriveData: Record<string, DriveFolder> = {
  root: {
    id: "root",
    name: "My Drive",
    items: [
      { id: "folder1", name: "Documents", type: "folder" },
      { id: "folder2", name: "Images", type: "folder" },
      { id: "file1", name: "Report.pdf", type: "file", mimeType: "application/pdf", size: 2500000 },
      {
        id: "file2",
        name: "Presentation.pptx",
        type: "file",
        mimeType: "application/vnd.ms-powerpoint",
        size: 5000000,
      },
    ],
  },
  folder1: {
    id: "folder1",
    name: "Documents",
    items: [
      { id: "folder3", name: "Work", type: "folder" },
      { id: "file3", name: "Resume.docx", type: "file", mimeType: "application/msword", size: 350000 },
      { id: "file4", name: "Notes.txt", type: "file", mimeType: "text/plain", size: 5000 },
    ],
  },
  folder2: {
    id: "folder2",
    name: "Images",
    items: [
      { id: "file5", name: "Vacation.jpg", type: "file", mimeType: "image/jpeg", size: 3500000 },
      { id: "file6", name: "Profile.png", type: "file", mimeType: "image/png", size: 1200000 },
    ],
  },
  folder3: {
    id: "folder3",
    name: "Work",
    items: [
      { id: "file7", name: "Project.docx", type: "file", mimeType: "application/msword", size: 450000 },
      { id: "file8", name: "Budget.xlsx", type: "file", mimeType: "application/vnd.ms-excel", size: 250000 },
    ],
  },
}

export default function GoogleDriveUploader() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [currentFolderId, setCurrentFolderId] = useState<string>("root")
  const [currentFolder, setCurrentFolder] = useState<DriveFolder | null>(null)
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([{ id: "root", name: "My Drive" }])
  const [isLoading, setIsLoading] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<DriveItem | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Mock Google Drive authentication
  const authenticateGoogleDrive = useCallback(async () => {
    // In a real implementation, this would use Google OAuth
    // For demo purposes, we'll simulate authentication
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        // Simulate getting user info from Google
        setUser({
          email: "user@example.com",
          name: "Demo User",
          avatar: "", // Empty string will use the UI avatars fallback
        })
        setIsAuthenticated(true)
        resolve(true)
      }, 1000)
    })
  }, [])

  const handleSignOut = useCallback(() => {
    setIsAuthenticated(false)
    setUser(null)
    setCurrentFolderId("root")
    setFolderPath([{ id: "root", name: "My Drive" }])
  }, [])

  // Mock Google Drive folder operations
  const fetchFolderContents = useCallback(async (folderId: string) => {
    setIsLoading(true)
    // Simulate API delay
    return new Promise<DriveFolder>((resolve) => {
      setTimeout(() => {
        setIsLoading(false)
        resolve(mockDriveData[folderId] || { id: folderId, name: "Unknown Folder", items: [] })
      }, 800)
    })
  }, [])

  const createFolder = useCallback(async (parentFolderId: string, folderName: string) => {
    setIsLoading(true)
    // Simulate API delay
    return new Promise<DriveItem>((resolve) => {
      setTimeout(() => {
        const newFolderId = `folder${Date.now()}`
        const newFolder: DriveItem = {
          id: newFolderId,
          name: folderName,
          type: "folder",
        }

        // Update mock data
        mockDriveData[parentFolderId] = {
          ...mockDriveData[parentFolderId],
          items: [...mockDriveData[parentFolderId].items, newFolder],
        }

        // Create empty folder in mock data
        mockDriveData[newFolderId] = {
          id: newFolderId,
          name: folderName,
          items: [],
        }

        setIsLoading(false)
        resolve(newFolder)
      }, 800)
    })
  }, [])

  const deleteItem = useCallback(async (parentFolderId: string, itemId: string) => {
    setIsLoading(true)
    // Simulate API delay
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Update mock data
        mockDriveData[parentFolderId] = {
          ...mockDriveData[parentFolderId],
          items: mockDriveData[parentFolderId].items.filter((item) => item.id !== itemId),
        }

        // If it's a folder, also delete its contents
        if (mockDriveData[itemId]) {
          delete mockDriveData[itemId]
        }

        setIsLoading(false)
        resolve()
      }, 800)
    })
  }, [])

  // Mock Google Drive upload
  const uploadToGoogleDrive = useCallback(
    async (file: File, folderId: string, onProgress: (progress: number) => void) => {
      // Simulate upload progress
      return new Promise<string>((resolve, reject) => {
        let progress = 0
        const interval = setInterval(() => {
          progress += Math.random() * 20
          onProgress(Math.min(progress, 100))

          if (progress >= 100) {
            clearInterval(interval)
            // Simulate success/failure
            if (Math.random() > 0.1) {
              // 90% success rate
              const fileId = `file${Date.now()}`

              // Add file to mock data
              mockDriveData[folderId] = {
                ...mockDriveData[folderId],
                items: [
                  ...mockDriveData[folderId].items,
                  {
                    id: fileId,
                    name: file.name,
                    type: "file",
                    mimeType: file.type,
                    size: file.size,
                  },
                ],
              }

              resolve(fileId)
            } else {
              reject(new Error("Upload failed"))
            }
          }
        }, 200)
      })
    },
    [],
  )

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const imageFiles = Array.from(selectedFiles).filter((file) => file.type.startsWith("image/"))

    const newFiles: UploadedFile[] = imageFiles.map((file) => ({
      id: `${file.name}_${Date.now()}_${Math.random()}`,
      name: file.name,
      size: file.size,
      preview: URL.createObjectURL(file),
      status: "pending",
      progress: 0,
    }))

    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect],
  )

  const uploadFile = useCallback(
    async (fileId: string) => {
      if (!isAuthenticated) {
        await authenticateGoogleDrive()
      }

      const fileIndex = files.findIndex((f) => f.id === fileId)
      if (fileIndex === -1) return

      // Update status to uploading
      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "uploading", progress: 0 } : f)))

      try {
        // Get the actual file (in real implementation, you'd store the File object)
        const response = await fetch(files[fileIndex].preview)
        const blob = await response.blob()
        const file = new File([blob], files[fileIndex].name, { type: blob.type })

        const driveId = await uploadToGoogleDrive(file, currentFolderId, (progress) => {
          setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress } : f)))
        })

        setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "success", driveId, progress: 100 } : f)))

        // Refresh folder contents after upload
        refreshCurrentFolder()
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                ...f,
                status: "error",
                error: error instanceof Error ? error.message : "Upload failed",
              }
              : f,
          ),
        )
      }
    },
    [files, isAuthenticated, authenticateGoogleDrive, uploadToGoogleDrive, currentFolderId],
  )

  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === fileId)
      if (file) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter((f) => f.id !== fileId)
    })
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const navigateToFolder = useCallback(
    async (folderId: string, folderName: string, isPathClick = false) => {
      const folder = await fetchFolderContents(folderId)
      setCurrentFolder(folder)
      setCurrentFolderId(folderId)

      if (isPathClick) {
        // Find the index of the clicked folder in the path
        const index = folderPath.findIndex((item) => item.id === folderId)
        if (index !== -1) {
          // Truncate the path up to the clicked folder
          setFolderPath(folderPath.slice(0, index + 1))
        }
      } else {
        // Add to path when navigating forward
        setFolderPath((prev) => [...prev, { id: folderId, name: folderName }])
      }
    },
    [fetchFolderContents, folderPath],
  )

  const handleCreateFolder = useCallback(async () => {
    if (!newFolderName.trim()) return

    try {
      await createFolder(currentFolderId, newFolderName.trim())
      setNewFolderName("")
      setIsCreateFolderDialogOpen(false)
      refreshCurrentFolder()
    } catch (error) {
      console.error("Failed to create folder:", error)
    }
  }, [createFolder, currentFolderId, newFolderName])

  const handleDeleteItem = useCallback(async () => {
    if (!selectedItem) return

    try {
      await deleteItem(currentFolderId, selectedItem.id)
      setSelectedItem(null)
      setIsDeleteDialogOpen(false)
      refreshCurrentFolder()
    } catch (error) {
      console.error("Failed to delete item:", error)
    }
  }, [deleteItem, currentFolderId, selectedItem])

  const refreshCurrentFolder = useCallback(async () => {
    const folder = await fetchFolderContents(currentFolderId)
    setCurrentFolder(folder)
  }, [fetchFolderContents, currentFolderId])

  const navigateToRoot = useCallback(async () => {
    const folder = await fetchFolderContents("root")
    setCurrentFolder(folder)
    setCurrentFolderId("root")
    setFolderPath([{ id: "root", name: "My Drive" }])
  }, [fetchFolderContents])

  // Load initial folder on authentication
  useEffect(() => {
    if (isAuthenticated) {
      fetchFolderContents(currentFolderId).then(setCurrentFolder)
    }
  }, [isAuthenticated, fetchFolderContents, currentFolderId])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Google Drive Image Uploader</h1>
        <p className="text-muted-foreground">Upload your images directly to Google Drive with drag & drop support</p>
      </div>

      {!isAuthenticated ? (
        <Card className="bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-4 rounded-full bg-background p-3">
              <FolderOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-medium">Sign in to Google Drive</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Connect your Google Drive account to start uploading images
            </p>
            <Button onClick={authenticateGoogleDrive}>
              <FolderOpen className="mr-2 h-4 w-4" />
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-primary/10">
                <img
                  src={
                    user?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || "")}&background=random`
                  }
                  alt="User avatar"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </CardContent>
        </Card>
      )}

      {isAuthenticated && currentFolder && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Drive Files</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={refreshCurrentFolder}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
                <Dialog open={isCreateFolderDialogOpen} onOpenChange={setIsCreateFolderDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      New Folder
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Folder</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <Input
                        placeholder="Folder name"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateFolderDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateFolder}>Create</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="pt-2">
              <Breadcrumb className="py-2">
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={navigateToRoot}>
                    <Home className="h-4 w-4 mr-1" />
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {folderPath.map((folder, index) => (
                  <BreadcrumbItem key={folder.id}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbLink
                      onClick={() => navigateToFolder(folder.id, folder.name, true)}
                      className={index === folderPath.length - 1 ? "font-medium" : ""}
                    >
                      {folder.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                ))}
              </Breadcrumb>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin">
                  <RefreshCw className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            ) : currentFolder.items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>This folder is empty</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {currentFolder.items.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div
                      className={`p-4 flex items-center ${item.type === "folder" ? "cursor-pointer hover:bg-muted/50" : ""
                        }`}
                      onClick={() => {
                        if (item.type === "folder") {
                          navigateToFolder(item.id, item.name)
                        }
                      }}
                    >
                      <div className="mr-3 p-2 rounded-md bg-muted">
                        {item.type === "folder" ? (
                          <Folder className="h-6 w-6 text-blue-500" />
                        ) : item.mimeType?.startsWith("image/") ? (
                          <ImageIcon className="h-6 w-6 text-green-500" />
                        ) : (
                          <File className="h-6 w-6 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        {item.type === "file" && item.size && (
                          <p className="text-xs text-muted-foreground">{formatFileSize(item.size)}</p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedItem(item)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Upload Images</CardTitle>
          <CardDescription>
            Choose image files to upload to your Google Drive. Supports JPG, PNG, GIF, and WebP formats.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-muted rounded-full">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">Drag & drop images here, or click to select</p>
                <p className="text-sm text-muted-foreground">Supports: JPG, PNG, GIF, WebP</p>
              </div>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                <ImageIcon className="h-4 w-4 mr-2" />
                Choose Images
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
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
                  <img
                    src={file.preview || "/placeholder.svg"}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
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
                    <Button size="sm" onClick={() => uploadFile(file.id)} disabled={!isAuthenticated}>
                      <Upload className="h-4 w-4 mr-1" />
                      Upload
                    </Button>
                  )}

                  {file.status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}

                  {file.status === "error" && <AlertCircle className="h-5 w-5 text-destructive" />}

                  <Button size="sm" variant="ghost" onClick={() => removeFile(file.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={async () => {
                  if (!isAuthenticated) {
                    await authenticateGoogleDrive()
                  }
                  files.filter((f) => f.status === "pending").forEach((f) => uploadFile(f.id))
                }}
                disabled={files.filter((f) => f.status === "pending").length === 0}
              >
                Upload All Pending
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  files.forEach((f) => URL.revokeObjectURL(f.preview))
                  setFiles([])
                }}
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedItem?.type === "folder" ? "Folder" : "File"}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete <span className="font-medium">{selectedItem?.name}</span>?
              {selectedItem?.type === "folder" && (
                <span className="block text-destructive mt-2">
                  This will also delete all files and folders inside it.
                </span>
              )}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
