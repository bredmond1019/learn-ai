export default function TestStyles() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-4xl font-bold">Style Test Page</h1>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Custom Colors:</h2>
        <div className="bg-background p-4 border">bg-background</div>
        <div className="bg-background-secondary p-4 border">bg-background-secondary</div>
        <div className="bg-primary text-background p-4">bg-primary</div>
        <div className="bg-accent p-4">bg-accent</div>
        <div className="text-primary">text-primary</div>
        <div className="text-foreground">text-foreground</div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Standard Tailwind Colors:</h2>
        <div className="bg-red-500 text-white p-4">bg-red-500</div>
        <div className="bg-blue-500 text-white p-4">bg-blue-500</div>
        <div className="bg-green-500 text-white p-4">bg-green-500</div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Fonts:</h2>
        <div className="font-heading text-xl">font-heading (Inter)</div>
        <div className="font-sans text-xl">font-sans (Source Sans Pro)</div>
        <div className="font-mono text-xl">font-mono (JetBrains Mono)</div>
      </div>
    </div>
  );
}