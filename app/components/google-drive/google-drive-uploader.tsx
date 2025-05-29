"use client"

import { useState, useCallback, useEffect } from "react"
import { AuthenticationCard } from "./authentication-card"
import { DriveExplorer } from "./drive-explorer"
import { FileUploader } from "./file-uploader"
import type { UserInfo, DriveFolder, UploadedFile } from "@/app/lib/types"
import { UploadQueue } from "./upload-queue"
import { mockDriveData } from "@/app/lib/mock-drive-data"

export function GoogleDriveUploader() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [currentFolderId, setCurrentFolderId] = useState<string>("root")
  const [currentFolder, setCurrentFolder] = useState<DriveFolder | null>(null)
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([{ id: "root", name: "My Drive" }])
  const [isLoading, setIsLoading] = useState(false)

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
    return new Promise((resolve) => {
      setTimeout(() => {
        const newFolderId = `folder${Date.now()}`
        const newFolder = {
          id: newFolderId,
          name: folderName,
          type: "folder" as const,
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

  // Load initial folder on authentication
  useEffect(() => {
    if (isAuthenticated) {
      fetchFolderContents(currentFolderId).then(setCurrentFolder)
    }
  }, [isAuthenticated, fetchFolderContents, currentFolderId])

  return (
    <>
      <AuthenticationCard
        isAuthenticated={isAuthenticated}
        user={user}
        onSignIn={authenticateGoogleDrive}
        onSignOut={handleSignOut}
      />

      {isAuthenticated && currentFolder && (
        <DriveExplorer
          currentFolder={currentFolder}
          folderPath={folderPath}
          isLoading={isLoading}
          onNavigateToFolder={navigateToFolder}
          onNavigateToRoot={navigateToRoot}
          onRefresh={refreshCurrentFolder}
          onCreateFolder={createFolder}
          onDeleteItem={deleteItem}
          currentFolderId={currentFolderId}
        />
      )}

      <FileUploader onFileSelect={handleFileSelect} />

      {files.length > 0 && (
        <UploadQueue
          files={files}
          onUploadFile={uploadFile}
          onRemoveFile={removeFile}
          isAuthenticated={isAuthenticated}
          onAuthenticate={authenticateGoogleDrive}
        />
      )}
    </>
  )
}
