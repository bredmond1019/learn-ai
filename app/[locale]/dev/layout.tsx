export default function DevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="bg-yellow-500/20 border-b border-yellow-500/40 px-4 py-2 text-center">
        <p className="text-sm font-medium text-yellow-200">
          ⚠️ Development Environment - These pages are for testing only
        </p>
      </div>
      {children}
    </>
  );
}