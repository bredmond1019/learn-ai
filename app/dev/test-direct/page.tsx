export default function TestDirect() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-4">Direct Test Page</h1>
      <p className="text-foreground/80">This is a development test page for direct routing.</p>
      <div className="mt-8 p-4 bg-accent/10 rounded-lg">
        <p className="text-sm text-foreground/70">
          This is a development test page. It should not be accessible in production.
        </p>
      </div>
    </div>
  );
}