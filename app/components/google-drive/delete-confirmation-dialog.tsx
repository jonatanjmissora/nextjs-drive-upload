"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  itemName: string
  itemType: "file" | "folder" | null
  onConfirmDelete: () => Promise<void>
}

export function DeleteConfirmationDialog({
  isOpen,
  onOpenChange,
  itemName,
  itemType,
  onConfirmDelete,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {itemType === "folder" ? "Folder" : "File"}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>
            Are you sure you want to delete <span className="font-medium">{itemName}</span>?
            {itemType === "folder" && (
              <span className="block text-destructive mt-2">
                This will also delete all files and folders inside it.
              </span>
            )}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirmDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
