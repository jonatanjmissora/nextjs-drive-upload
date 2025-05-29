import type { DriveFolder } from "./types"

// Mock Google Drive data
export const mockDriveData: Record<string, DriveFolder> = {
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
