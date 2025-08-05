import { NextRequest, NextResponse } from 'next/server';
import { getModule, validateModuleId } from '@/lib/content/learning/modules.server';
import { validateMDXContent } from '@/lib/content/blog/mdx-parser.server';

interface RouteParams {
  params: Promise<{
    pathSlug: string;
    moduleId: string;
  }>;
}

// GET /api/modules/[pathSlug]/[moduleId] - Get specific module content
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { pathSlug, moduleId } = await params;

    // Validate module exists
    const isValid = await validateModuleId(pathSlug, moduleId);
    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Module not found',
          message: `Module ${moduleId} not found in path ${pathSlug}`,
        },
        { status: 404 }
      );
    }

    // Get module data
    const moduleData = await getModule(pathSlug, moduleId);
    if (!moduleData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Module not found',
          message: `Failed to load module ${moduleId}`,
        },
        { status: 404 }
      );
    }

    // Include validation status for each section's MDX content
    const sectionsWithValidation = await Promise.all(
      moduleData.sections.map(async (section) => {
        const validation = section.content.type === 'mdx' && section.content.source 
          ? await validateMDXContent(section.content.source)
          : { valid: true };
        return {
          ...section,
          contentValid: validation.valid,
          contentError: validation.error,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        ...moduleData,
        sections: sectionsWithValidation,
      },
    });
  } catch (error) {
    console.error('Error fetching module:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch module',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}