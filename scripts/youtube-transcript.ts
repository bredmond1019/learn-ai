#!/usr/bin/env tsx

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { YouTubeAPIError } from '../lib/youtube-api';
import { YouTubeAPIv2 } from '../lib/youtube-api-v2';
import { TranscriptFormatter, TranscriptExportOptions } from '../lib/youtube-transcript';
import { YouTubeMapping } from '../lib/youtube-mapping';

const program = new Command();
const api = new YouTubeAPIv2();
const formatter = new TranscriptFormatter();
const mapping = new YouTubeMapping();

// Utility functions
function displayError(message: string, error?: any) {
  console.error(chalk.red(`✗ ${message}`));
  if (error && process.env.DEBUG) {
    console.error(chalk.gray(error.stack || error.message));
  }
}

function displaySuccess(message: string) {
  console.log(chalk.green(`✓ ${message}`));
}

function displayInfo(message: string) {
  console.log(chalk.blue(`ℹ ${message}`));
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

// Command: fetch
program
  .command('fetch <video-url>')
  .description('Fetch transcript for a single YouTube video')
  .option('-l, --language <lang>', 'Transcript language (default: en)', 'en')
  .option('-f, --format <format>', 'Export format (txt, md, srt, vtt, json)', 'txt')
  .option('--no-timestamps', 'Exclude timestamps from text/markdown output')
  .option('--no-metadata', 'Skip fetching video metadata')
  .action(async (videoUrl: string, options) => {
    const spinner = ora('Fetching transcript...').start();

    try {
      await mapping.initialize();

      // Extract video ID
      const videoId = api.extractVideoId(videoUrl);
      if (!videoId) {
        spinner.fail('Invalid YouTube URL');
        process.exit(1);
      }

      // Check if already exists
      const exists = await mapping.exists(videoId);
      if (exists && !options.force) {
        spinner.info(`Transcript already exists for video: ${videoId}`);
        const existingMapping = await mapping.get(videoId);
        displayInfo(`Title: ${existingMapping!.title}`);
        displayInfo(`Path: ${existingMapping!.filePath}`);
        return;
      }

      // Fetch metadata if requested
      let metadata = null;
      if (!options.noMetadata) {
        spinner.text = 'Fetching video metadata...';
        metadata = await api.getVideoMetadata(videoId);
      }

      // Fetch transcript
      spinner.text = 'Fetching transcript...';
      const transcript = await api.fetchTranscript(videoId, {
        language: options.language
      });

      // Save to mapping
      spinner.text = 'Saving transcript...';
      const transcriptMapping = await mapping.add(videoId, transcript, metadata || undefined);

      // Format and save transcript
      const exportOptions: TranscriptExportOptions = {
        format: options.format,
        includeTimestamps: options.timestamps !== false,
        timestampFormat: 'hms',
        paragraphBreaks: true
      };

      const formattedContent = formatter.export(transcript, exportOptions, metadata);
      const filePath = await mapping.saveTranscript(videoId, formattedContent, options.format);
      
      // Also save the raw JSON data for later use
      const jsonPath = await mapping.saveTranscript(videoId, JSON.stringify(transcript, null, 2), 'json');

      spinner.succeed('Transcript fetched successfully!');
      
      // Display summary
      console.log('');
      displaySuccess(`Video: ${metadata?.title || videoId}`);
      displaySuccess(`Author: ${metadata?.author || 'Unknown'}`);
      displaySuccess(`Duration: ${metadata ? formatDuration(transcript.segments[transcript.segments.length - 1].start) : 'Unknown'}`);
      displaySuccess(`Words: ${transcript.fullText.split(/\s+/).length}`);
      displaySuccess(`Segments: ${transcript.segments.length}`);
      displaySuccess(`Language: ${transcript.language}`);
      displaySuccess(`Saved to: ${filePath}`);

    } catch (error) {
      spinner.fail('Failed to fetch transcript');
      if (error instanceof YouTubeAPIError) {
        displayError(error.message);
        if (error.statusCode === 404) {
          displayInfo('This video may not have captions available.');
        }
      } else {
        displayError('An unexpected error occurred', error);
      }
      process.exit(1);
    }
  });

// Command: update
program
  .command('update <video-url>')
  .description('Update an existing transcript')
  .option('-l, --language <lang>', 'Transcript language', 'en')
  .option('-f, --format <format>', 'Export format (txt, md, srt, vtt, json)', 'txt')
  .action(async (videoUrl: string, options) => {
    const spinner = ora('Updating transcript...').start();

    try {
      await mapping.initialize();

      // Extract video ID
      const videoId = api.extractVideoId(videoUrl);
      if (!videoId) {
        spinner.fail('Invalid YouTube URL');
        process.exit(1);
      }

      // Check if exists
      const exists = await mapping.exists(videoId);
      if (!exists) {
        spinner.info('Transcript does not exist. Use "fetch" command instead.');
        process.exit(1);
      }

      // Fetch fresh metadata
      spinner.text = 'Fetching updated metadata...';
      const metadata = await api.getVideoMetadata(videoId);

      // Check if update needed
      const needsUpdate = await mapping.needsUpdate(videoId, metadata || undefined);
      if (!needsUpdate) {
        spinner.info('Transcript is up to date');
        return;
      }

      // Fetch fresh transcript
      spinner.text = 'Fetching updated transcript...';
      const transcript = await api.fetchTranscript(videoId, {
        language: options.language
      });

      // Update mapping
      await mapping.add(videoId, transcript, metadata || undefined);
      await mapping.updateTimestamp(videoId);

      // Save updated transcript
      const exportOptions: TranscriptExportOptions = {
        format: options.format,
        includeTimestamps: true,
        timestampFormat: 'hms',
        paragraphBreaks: true
      };

      const formattedContent = formatter.export(transcript, exportOptions, metadata);
      const filePath = await mapping.saveTranscript(videoId, formattedContent, options.format);

      spinner.succeed('Transcript updated successfully!');
      displaySuccess(`Updated: ${filePath}`);

    } catch (error) {
      spinner.fail('Failed to update transcript');
      displayError('An error occurred', error);
      process.exit(1);
    }
  });

// Command: list
program
  .command('list')
  .description('List all downloaded transcripts')
  .option('-s, --sort <field>', 'Sort by field (date, title, author, duration)', 'date')
  .option('-r, --reverse', 'Reverse sort order')
  .action(async (options) => {
    try {
      await mapping.initialize();
      const transcripts = await mapping.getAll();

      if (transcripts.length === 0) {
        displayInfo('No transcripts found');
        return;
      }

      // Sort transcripts
      transcripts.sort((a, b) => {
        let compareValue = 0;
        switch (options.sort) {
          case 'title':
            compareValue = a.title.localeCompare(b.title);
            break;
          case 'author':
            compareValue = a.author.localeCompare(b.author);
            break;
          case 'duration':
            compareValue = (a.transcriptStats?.duration || 0) - (b.transcriptStats?.duration || 0);
            break;
          case 'date':
          default:
            compareValue = new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime();
        }
        return options.reverse ? -compareValue : compareValue;
      });

      // Display transcripts
      console.log(chalk.bold('\nDownloaded Transcripts:\n'));
      
      transcripts.forEach((t, index) => {
        console.log(chalk.cyan(`${index + 1}. ${t.title}`));
        console.log(chalk.gray(`   Author: ${t.author}`));
        console.log(chalk.gray(`   Video ID: ${t.videoId}`));
        console.log(chalk.gray(`   Language: ${t.language}`));
        if (t.transcriptStats) {
          console.log(chalk.gray(`   Duration: ${formatDuration(t.transcriptStats.duration)}`));
          console.log(chalk.gray(`   Words: ${t.transcriptStats.wordCount}`));
        }
        console.log(chalk.gray(`   Downloaded: ${new Date(t.downloadedAt).toLocaleDateString()}`));
        console.log(chalk.gray(`   Path: ${t.filePath}`));
        console.log('');
      });

      // Display summary
      const stats = await mapping.getStats();
      console.log(chalk.bold('Summary:'));
      console.log(`Total transcripts: ${stats.totalTranscripts}`);
      console.log(`Total words: ${stats.totalWords.toLocaleString()}`);
      console.log(`Total duration: ${formatDuration(stats.totalDuration)}`);
      
      if (Object.keys(stats.languages).length > 1) {
        console.log(`Languages: ${Object.entries(stats.languages).map(([lang, count]) => `${lang} (${count})`).join(', ')}`);
      }

    } catch (error) {
      displayError('Failed to list transcripts', error);
      process.exit(1);
    }
  });

// Command: export
program
  .command('export <video-id>')
  .description('Export transcript in different format')
  .option('-f, --format <format>', 'Export format (txt, md, srt, vtt, json)', 'md')
  .option('-o, --output <path>', 'Output file path')
  .option('--no-timestamps', 'Exclude timestamps (txt/md only)')
  .action(async (videoId: string, options) => {
    const spinner = ora('Exporting transcript...').start();

    try {
      await mapping.initialize();

      // Check if exists
      const transcriptMapping = await mapping.get(videoId);
      if (!transcriptMapping) {
        spinner.fail(`No transcript found for video ID: ${videoId}`);
        process.exit(1);
      }

      // Load transcript data
      const transcriptJson = await mapping.loadTranscript(videoId, 'json');
      const transcript = JSON.parse(transcriptJson);

      // Format transcript
      const exportOptions: TranscriptExportOptions = {
        format: options.format,
        includeTimestamps: options.timestamps !== false,
        timestampFormat: 'hms',
        paragraphBreaks: true
      };

      const formattedContent = formatter.export(
        transcript, 
        exportOptions, 
        transcriptMapping.metadata
      );

      // Save or output
      if (options.output) {
        const fs = await import('fs/promises');
        await fs.writeFile(options.output, formattedContent, 'utf-8');
        spinner.succeed(`Exported to: ${options.output}`);
      } else {
        spinner.stop();
        console.log(formattedContent);
      }

    } catch (error) {
      spinner.fail('Failed to export transcript');
      displayError('An error occurred', error);
      process.exit(1);
    }
  });

// Command: search
program
  .command('search <keyword>')
  .description('Search transcripts by keyword')
  .action(async (keyword: string) => {
    const spinner = ora('Searching transcripts...').start();

    try {
      await mapping.initialize();
      const results = await mapping.search(keyword);

      spinner.stop();

      if (results.length === 0) {
        displayInfo(`No transcripts found matching: ${keyword}`);
        return;
      }

      console.log(chalk.bold(`\nFound ${results.length} transcript(s) matching "${keyword}":\n`));
      
      results.forEach((t, index) => {
        console.log(chalk.cyan(`${index + 1}. ${t.title}`));
        console.log(chalk.gray(`   Author: ${t.author}`));
        console.log(chalk.gray(`   Video ID: ${t.videoId}`));
        console.log(chalk.gray(`   Path: ${t.filePath}`));
        console.log('');
      });

    } catch (error) {
      spinner.fail('Search failed');
      displayError('An error occurred', error);
      process.exit(1);
    }
  });

// Command: remove
program
  .command('remove <video-id>')
  .description('Remove a transcript')
  .option('-f, --force', 'Force removal without confirmation')
  .action(async (videoId: string, options) => {
    try {
      await mapping.initialize();

      const transcriptMapping = await mapping.get(videoId);
      if (!transcriptMapping) {
        displayError(`No transcript found for video ID: ${videoId}`);
        process.exit(1);
      }

      if (!options.force) {
        console.log(chalk.yellow(`\nAbout to remove transcript:`));
        console.log(`Title: ${transcriptMapping.title}`);
        console.log(`Author: ${transcriptMapping.author}`);
        console.log(`Path: ${transcriptMapping.filePath}`);
        console.log('');
        
        const readline = await import('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });

        const answer = await new Promise<string>((resolve) => {
          rl.question('Are you sure? (y/N): ', resolve);
        });
        rl.close();

        if (answer.toLowerCase() !== 'y') {
          displayInfo('Removal cancelled');
          return;
        }
      }

      await mapping.remove(videoId);
      displaySuccess(`Removed transcript for: ${transcriptMapping.title}`);

    } catch (error) {
      displayError('Failed to remove transcript', error);
      process.exit(1);
    }
  });

// Parse arguments
program
  .name('youtube-transcript')
  .description('YouTube transcript fetcher and manager')
  .version('1.0.0');

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}