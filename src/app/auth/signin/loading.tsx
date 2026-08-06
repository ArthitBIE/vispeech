export default function SignInLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 animate-pulse">
        <div className="mx-auto h-10 w-32 rounded bg-muted" />
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-10 rounded-md bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-10 rounded-md bg-muted" />
          <div className="h-10 rounded-md bg-muted" />
        </div>
      </div>
    </div>
  );
}
