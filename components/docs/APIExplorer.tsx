'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Code2, 
  Copy, 
  Check, 
  ChevronRight,
  ChevronDown,
  ExternalLink,
  FileCode2,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface APIMethod {
  name: string;
  description: string;
  signature: string;
  parameters: APIParameter[];
  returns: string;
  example: string;
  category: string;
  async?: boolean;
  deprecated?: boolean;
}

interface APIParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: string;
}

interface APICategory {
  name: string;
  description: string;
  methods: APIMethod[];
}

// Sample API data - in production, this would come from a data source
const API_DATA: APICategory[] = [
  {
    name: 'WASM Loader',
    description: 'WebAssembly module loading and management',
    methods: [
      {
        name: 'getWasmLoader',
        description: 'Returns the singleton instance of WasmLoader',
        signature: 'getWasmLoader(): WasmLoader',
        parameters: [],
        returns: 'WasmLoader instance',
        example: `const loader = getWasmLoader();
await loader.initialize();`,
        category: 'WASM Loader',
        async: false
      },
      {
        name: 'loadModule',
        description: 'Loads a WebAssembly module from URL',
        signature: 'loadModule(url: string, moduleId: string, options?: WasmLoadOptions): Promise<WasmModule | null>',
        parameters: [
          {
            name: 'url',
            type: 'string',
            description: 'URL of the WASM module',
            required: true
          },
          {
            name: 'moduleId',
            type: 'string',
            description: 'Unique identifier for the module',
            required: true
          },
          {
            name: 'options',
            type: 'WasmLoadOptions',
            description: 'Optional configuration',
            required: false,
            default: '{}'
          }
        ],
        returns: 'Promise<WasmModule | null>',
        example: `const module = await loader.loadModule(
  '/wasm/compiler.wasm',
  'rust-compiler',
  { cache: true }
);`,
        category: 'WASM Loader',
        async: true
      }
    ]
  },
  {
    name: 'Playground',
    description: 'Code execution environment management',
    methods: [
      {
        name: 'executeCode',
        description: 'Compiles and executes Rust code',
        signature: 'executeCode(code: string): Promise<ExecutionResult>',
        parameters: [
          {
            name: 'code',
            type: 'string',
            description: 'Rust source code to execute',
            required: true
          }
        ],
        returns: 'Promise<ExecutionResult>',
        example: `const result = await playground.executeCode(\`
fn main() {
    println!("Hello, world!");
}
\`);`,
        category: 'Playground',
        async: true
      }
    ]
  }
];

export function APIExplorer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<APIMethod | null>(null);
  const [copiedCode, setCopiedCode] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Filter methods based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return API_DATA;

    return API_DATA.map(category => ({
      ...category,
      methods: category.methods.filter(method =>
        method.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        method.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(category => category.methods.length > 0);
  }, [searchQuery]);

  // Toggle category expansion
  const toggleCategory = useCallback((categoryName: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  }, []);

  // Copy code to clipboard
  const copyCode = useCallback(async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">API Explorer</h2>
        <p className="text-muted-foreground mt-1">
          Interactive documentation for Claude SDK APIs
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search APIs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - API List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">API Methods</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="p-4 space-y-2">
                {filteredCategories.map((category) => (
                  <div key={category.name} className="space-y-1">
                    <button
                      onClick={() => toggleCategory(category.name)}
                      className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileCode2 className="h-4 w-4" />
                        <span className="font-medium">{category.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {category.methods.length}
                        </Badge>
                      </div>
                      {expandedCategories.has(category.name) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    
                    {expandedCategories.has(category.name) && (
                      <div className="ml-6 space-y-1">
                        {category.methods.map((method) => (
                          <button
                            key={method.name}
                            onClick={() => {
                              setSelectedCategory(category.name);
                              setSelectedMethod(method);
                            }}
                            className={cn(
                              'w-full text-left p-2 hover:bg-muted rounded-lg transition-colors text-sm',
                              selectedMethod?.name === method.name && 'bg-muted'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono">{method.name}</span>
                              <div className="flex items-center gap-1">
                                {method.async && (
                                  <Badge variant="outline" className="text-xs">
                                    <Zap className="h-3 w-3 mr-1" />
                                    async
                                  </Badge>
                                )}
                                {method.deprecated && (
                                  <Badge variant="destructive" className="text-xs">
                                    deprecated
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {method.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Detail View */}
        <Card className="lg:col-span-2">
          {selectedMethod ? (
            <>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-mono">{selectedMethod.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {selectedMethod.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedMethod.async && (
                      <Badge variant="outline">
                        <Zap className="h-3 w-3 mr-1" />
                        async
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`#${selectedMethod.name}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value="overview" className="w-full" onValueChange={() => {}}>
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="parameters">Parameters</TabsTrigger>
                    <TabsTrigger value="example">Example</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 mt-4">
                    {/* Signature */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Signature</h4>
                      <div className="relative">
                        <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                          <code className="text-sm">{selectedMethod.signature}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2"
                          onClick={() => copyCode(selectedMethod.signature, 'signature')}
                        >
                          {copiedCode === 'signature' ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Returns */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Returns</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedMethod.returns}
                      </p>
                    </div>

                    {/* Category */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Category</h4>
                      <Badge variant="secondary">{selectedMethod.category}</Badge>
                    </div>
                  </TabsContent>

                  <TabsContent value="parameters" className="mt-4">
                    {selectedMethod.parameters.length > 0 ? (
                      <div className="space-y-4">
                        {selectedMethod.parameters.map((param) => (
                          <div key={param.name} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <code className="font-mono font-semibold">
                                  {param.name}
                                </code>
                                {param.required && (
                                  <Badge variant="destructive" className="ml-2 text-xs">
                                    required
                                  </Badge>
                                )}
                              </div>
                              <code className="text-sm text-muted-foreground">
                                {param.type}
                              </code>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {param.description}
                            </p>
                            {param.default && (
                              <p className="text-sm mt-2">
                                <span className="font-semibold">Default:</span>{' '}
                                <code className="bg-muted px-1 py-0.5 rounded">
                                  {param.default}
                                </code>
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        This method has no parameters.
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent value="example" className="mt-4">
                    <div className="relative">
                      <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                        <code className="text-sm language-typescript">
                          {selectedMethod.example}
                        </code>
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyCode(selectedMethod.example, 'example')}
                      >
                        {copiedCode === 'example' ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-[600px]">
              <div className="text-center">
                <Code2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select an API method to view details
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}