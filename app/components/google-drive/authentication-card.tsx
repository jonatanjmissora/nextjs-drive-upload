"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FolderOpen } from "lucide-react"
import type { UserInfo } from "@/app/lib/types"

interface AuthenticationCardProps {
  isAuthenticated: boolean
  user: UserInfo | null
  onSignIn: () => Promise<boolean>
  onSignOut: () => void
}

export function AuthenticationCard({ isAuthenticated, user, onSignIn, onSignOut }: AuthenticationCardProps) {
  if (!isAuthenticated) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
          <div className="mb-4 rounded-full bg-background p-3">
            <FolderOpen className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-medium">Sign in to Google Drive</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Connect your Google Drive account to start uploading images
          </p>
          <Button onClick={onSignIn}>
            <FolderOpen className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
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
        <Button variant="outline" size="sm" onClick={onSignOut}>
          Sign Out
        </Button>
      </CardContent>
    </Card>
  )
}
