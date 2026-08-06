export default function PracticeSessionLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center animate-pulse">
      <div className="text-center space-y-4">
        <div className="mx-auto h-16 w-16 rounded-full bg-muted" />
        <div className="h-4 w-32 mx-auto rounded bg-muted" />
        <div className="h-3 w-48 mx-auto rounded bg-muted" />
      </div>
    </div>
  );
}
