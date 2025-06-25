import { NextRequest, NextResponse } from 'next/server';
import { ModuleProgress } from '@/types/module';

// In a real application, this would connect to a database
// For now, we'll simulate progress tracking with in-memory storage
const progressStore = new Map<string, ModuleProgress>();

// GET /api/progress - Get user's progress for modules
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const moduleId = searchParams.get('moduleId');
    const pathSlug = searchParams.get('path');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing userId parameter',
        },
        { status: 400 }
      );
    }

    if (moduleId) {
      // Get progress for specific module
      const progressKey = `${userId}-${moduleId}`;
      const progress = progressStore.get(progressKey);
      
      return NextResponse.json({
        success: true,
        data: progress || null,
      });
    } else if (pathSlug) {
      // Get progress for all modules in a path
      const pathProgress = Array.from(progressStore.values()).filter(
        progress => progress.userId === userId && progress.moduleId.startsWith(pathSlug)
      );
      
      return NextResponse.json({
        success: true,
        data: pathProgress,
        count: pathProgress.length,
      });
    } else {
      // Get all progress for user
      const userProgress = Array.from(progressStore.values()).filter(
        progress => progress.userId === userId
      );
      
      return NextResponse.json({
        success: true,
        data: userProgress,
        count: userProgress.length,
      });
    }
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch progress',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/progress - Update user's progress
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      moduleId, 
      userId, 
      completed, 
      completedSections, 
      exercisesCompleted, 
      quizScore, 
      timeSpent 
    } = body;

    // Validate required fields
    if (!moduleId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: moduleId and userId',
        },
        { status: 400 }
      );
    }

    const progressKey = `${userId}-${moduleId}`;
    const existingProgress = progressStore.get(progressKey);

    const updatedProgress: ModuleProgress = {
      moduleId,
      userId,
      completed: completed ?? existingProgress?.completed ?? false,
      completedSections: completedSections ?? existingProgress?.completedSections ?? [],
      exercisesCompleted: exercisesCompleted ?? existingProgress?.exercisesCompleted ?? [],
      quizScore: quizScore ?? existingProgress?.quizScore,
      lastAccessedAt: new Date().toISOString(),
      timeSpent: (timeSpent ?? 0) + (existingProgress?.timeSpent ?? 0),
    };

    progressStore.set(progressKey, updatedProgress);

    return NextResponse.json({
      success: true,
      data: updatedProgress,
      message: 'Progress updated successfully',
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update progress',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/progress - Reset user's progress
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const moduleId = searchParams.get('moduleId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing userId parameter',
        },
        { status: 400 }
      );
    }

    if (moduleId) {
      // Reset progress for specific module
      const progressKey = `${userId}-${moduleId}`;
      progressStore.delete(progressKey);
      
      return NextResponse.json({
        success: true,
        message: `Progress reset for module ${moduleId}`,
      });
    } else {
      // Reset all progress for user
      const keysToDelete = Array.from(progressStore.keys()).filter(
        key => key.startsWith(`${userId}-`)
      );
      
      keysToDelete.forEach(key => progressStore.delete(key));
      
      return NextResponse.json({
        success: true,
        message: `All progress reset for user ${userId}`,
        count: keysToDelete.length,
      });
    }
  } catch (error) {
    console.error('Error resetting progress:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reset progress',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}