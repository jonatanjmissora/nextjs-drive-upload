"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Folder, FileIcon, ImageIcon, MoreVertical, Trash2 } from "lucide-react"
import type { DriveItem } from "@/app/lib/types"
import { formatFileSize } from "@/app/lib/utils"

interface FileListProps {
  items: DriveItem[]
  onNavigateToFolder: (folderId: string, folderName: string) => Promise<void>
  onDeleteRequest: (id: string, name: string, type: "file" | "folder") => void
}

export function FileList({ items, onNavigateToFolder, onDeleteRequest }: FileListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <div
            className={`p-4 flex items-center ${item.type === "folder" ? "cursor-pointer hover:bg-muted/50" : ""}`}
            onClick={() => {
              if (item.type === "folder") {
                onNavigateToFolder(item.id, item.name)
              }
            }}
          >
            <div className="mr-3 p-2 rounded-md bg-muted">
              {item.type === "folder" ? (
                <Folder className="h-6 w-6 text-blue-500" />
              ) : item.mimeType?.startsWith("image/") ? (
                <ImageIcon className="h-6 w-6 text-green-500" />
              ) : (
                <FileIcon className="h-6 w-6 text-gray-500" />
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
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteRequest(item.id, item.name, item.type)
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
  )
}
