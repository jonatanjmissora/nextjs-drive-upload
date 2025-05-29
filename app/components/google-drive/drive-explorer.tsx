"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { RefreshCw, Plus, Home, FolderOpen } from "lucide-react"
import type { DriveFolder } from "@/app/lib/types"
import { FileList } from "./file-list"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"

interface DriveExplorerProps {
  currentFolder: DriveFolder
  folderPath: { id: string; name: string }[]
  isLoading: boolean
  currentFolderId: string
  onNavigateToFolder: (folderId: string, folderName: string, isPathClick?: boolean) => Promise<void>
  onNavigateToRoot: () => Promise<void>
  onRefresh: () => Promise<void>
  onCreateFolder: (parentFolderId: string, folderName: string) => Promise<any>
  onDeleteItem: (parentFolderId: string, itemId: string) => Promise<void>
}

export function DriveExplorer({
  currentFolder,
  folderPath,
  isLoading,
  currentFolderId,
  onNavigateToFolder,
  onNavigateToRoot,
  onRefresh,
  onCreateFolder,
  onDeleteItem,
}: DriveExplorerProps) {
  const [newFolderName, setNewFolderName] = useState("")
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [selectedItemName, setSelectedItemName] = useState<string>("")
  const [selectedItemType, setSelectedItemType] = useState<"file" | "folder" | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      await onCreateFolder(currentFolderId, newFolderName.trim())
      setNewFolderName("")
      setIsCreateFolderDialogOpen(false)
      onRefresh()
    } catch (error) {
      console.error("Failed to create folder:", error)
    }
  }

  const handleDeleteItem = async () => {
    if (!selectedItemId) return

    try {
      await onDeleteItem(currentFolderId, selectedItemId)
      setSelectedItemId(null)
      setIsDeleteDialogOpen(false)
      onRefresh()
    } catch (error) {
      console.error("Failed to delete item:", error)
    }
  }

  const handleDeleteRequest = (id: string, name: string, type: "file" | "folder") => {
    setSelectedItemId(id)
    setSelectedItemName(name)
    setSelectedItemType(type)
    setIsDeleteDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Drive Files</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Dialog open={isCreateFolderDialogOpen} onOpenChange={setIsCreateFolderDialogOpen}>
              <Button size="sm" onClick={() => setIsCreateFolderDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                New Folder
              </Button>
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
              <BreadcrumbLink onClick={onNavigateToRoot}>
                <Home className="h-4 w-4 mr-1" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            {folderPath.map((folder, index) => (
              <BreadcrumbItem key={folder.id}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbLink
                  onClick={() => onNavigateToFolder(folder.id, folder.name, true)}
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
          <FileList
            items={currentFolder.items}
            onNavigateToFolder={onNavigateToFolder}
            onDeleteRequest={handleDeleteRequest}
          />
        )}
      </CardContent>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={selectedItemName}
        itemType={selectedItemType}
        onConfirmDelete={handleDeleteItem}
      />
    </Card>
  )
}
