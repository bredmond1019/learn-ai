import { NextRequest, NextResponse } from 'next/server';
import { validateMDXContent } from '@/lib/content/blog/mdx-parser.server';
import { validateModuleId } from '@/lib/content/learning/modules.server';

// POST /api/validate - Validate content or module structure
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, content, pathSlug, moduleId } = body;

    switch (type) {
      case 'mdx':
        if (!content) {
          return NextResponse.json(
            {
              success: false,
              error: 'Missing content field for MDX validation',
            },
            { status: 400 }
          );
        }

        const mdxValidation = await validateMDXContent(content);
        return NextResponse.json({
          success: true,
          data: {
            type: 'mdx',
            valid: mdxValidation.valid,
            error: mdxValidation.error,
          },
        });

      case 'module':
        if (!pathSlug || !moduleId) {
          return NextResponse.json(
            {
              success: false,
              error: 'Missing pathSlug or moduleId for module validation',
            },
            { status: 400 }
          );
        }

        const moduleExists = await validateModuleId(pathSlug, moduleId);
        return NextResponse.json({
          success: true,
          data: {
            type: 'module',
            valid: moduleExists,
            pathSlug,
            moduleId,
          },
        });

      case 'json':
        if (!content) {
          return NextResponse.json(
            {
              success: false,
              error: 'Missing content field for JSON validation',
            },
            { status: 400 }
          );
        }

        try {
          JSON.parse(content);
          return NextResponse.json({
            success: true,
            data: {
              type: 'json',
              valid: true,
            },
          });
        } catch (jsonError) {
          return NextResponse.json({
            success: true,
            data: {
              type: 'json',
              valid: false,
              error: jsonError instanceof Error ? jsonError.message : 'Invalid JSON',
            },
          });
        }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid validation type. Supported types: mdx, module, json',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error validating content:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate content',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET /api/validate/paths - Get all available learning paths for validation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pathSlug = searchParams.get('path');

    if (pathSlug) {
      // Validate specific path
      const pathExists = await validateModuleId(pathSlug, ''); // This will check if the path directory exists
      return NextResponse.json({
        success: true,
        data: {
          pathSlug,
          exists: pathExists,
        },
      });
    }

    // This is a simplified version - in a real app, you'd read the filesystem
    const availablePaths = [
      'agentic-workflows',
      'mcp-fundamentals', 
      'production-ai'
    ];

    return NextResponse.json({
      success: true,
      data: availablePaths,
      count: availablePaths.length,
    });
  } catch (error) {
    console.error('Error validating paths:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate paths',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}