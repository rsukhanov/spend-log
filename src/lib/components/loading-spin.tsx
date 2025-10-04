export const LoadingSpin = ({text}: {text?: string}) => {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
          <div className="animate-ping absolute inset-0 rounded-full h-5 w-5 border border-primary opacity-25"></div>
        </div>
        {text && (
          <span className="text-sm text-muted-foreground">{text}</span>
        )}
      </div>
    </div>
  )
}