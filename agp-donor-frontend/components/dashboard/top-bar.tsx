interface TopBarProps {
  title: string
  lastUpload?: string | null
}

export function TopBar({ title, lastUpload }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-6 md:px-8">
      <h1 className="text-xl font-semibold text-foreground pl-12 md:pl-0">{title}</h1>
      {lastUpload && (
        <p className="text-sm text-muted-foreground">
          Last upload: <span className="font-medium">{lastUpload}</span>
        </p>
      )}
    </header>
  )
}
