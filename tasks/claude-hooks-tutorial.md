# Claude Hooks Tutorial

Claude hooks are user-defined shell commands that execute at various points in Claude Code's lifecycle, providing deterministic control over its behavior. They allow you to customize notifications, automatically format code, log command execution, provide feedback on code conventions, and implement custom permissions.

## Configuration Structure

Hooks are configured in your settings file (`.claude/settings.json`) with the following structure:

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolPattern",
        "hooks": [
          {
            "type": "command",
            "command": "your-command-here"
          }
        ]
      }
    ]
  }
}
```

## Hook Events

### PreToolUse
Runs before tool calls are executed. Use this to:
- Validate inputs
- Block dangerous operations
- Set up environment
- Log intended actions

### PostToolUse
Runs after tool completion. Use this to:
- Clean up temporary files
- Send notifications
- Update external systems
- Log completed actions

### Notification
Triggered during notifications. Use this to:
- Send alerts to external systems
- Format notification messages
- Filter notification types

### Stop
Runs when the main agent finishes. Use this to:
- Clean up resources
- Send completion notifications
- Archive session logs

### SubagentStop
Runs when a subagent finishes. Use this to:
- Track subagent performance
- Log subagent results
- Chain subagent outputs

## Portfolio Project Examples

### 1. Automatic Code Formatting
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "npm run lint --fix"
          }
        ]
      }
    ]
  }
}
```

### 2. TypeScript Type Checking
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "npx tsc --noEmit"
          }
        ]
      }
    ]
  }
}
```

### 3. Test Validation After Changes
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "npm test -- --passWithNoTests --watchAll=false"
          }
        ]
      }
    ]
  }
}
```

### 4. Dev.to Content Validation
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "if [[ \"$TOOL_FILE_PATH\" == *\"content/blog\"* ]]; then npm run validate:content; fi"
          }
        ]
      }
    ]
  }
}
```

### 5. Email Configuration Validation
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "if [[ \"$TOOL_FILE_PATH\" == *\"api/contact\"* ]]; then npm run email:verify; fi"
          }
        ]
      }
    ]
  }
}
```

## General Development Examples

### 1. Git Commit Message Validation
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "if [[ \"$TOOL_COMMAND\" == *\"git commit\"* ]]; then echo 'Commit created successfully!'; fi"
          }
        ]
      }
    ]
  }
}
```

### 2. Dependency Security Check
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "if [[ \"$TOOL_FILE_PATH\" == *\"package.json\"* ]]; then npm audit; fi"
          }
        ]
      }
    ]
  }
}
```

### 3. Documentation Generation
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "if [[ \"$TOOL_FILE_PATH\" == *\".ts\"* ]] || [[ \"$TOOL_FILE_PATH\" == *\".tsx\"* ]]; then npx typedoc --out docs src; fi"
          }
        ]
      }
    ]
  }
}
```

### 4. Environment Variable Validation
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "if [[ \"$TOOL_FILE_PATH\" == *\".env\"* ]]; then echo 'Warning: Editing environment variables'; fi"
          }
        ]
      }
    ]
  }
}
```

### 5. Build Performance Monitoring
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "if [[ \"$TOOL_COMMAND\" == *\"npm run build\"* ]]; then echo 'Build completed at $(date)' >> build.log; fi"
          }
        ]
      }
    ]
  }
}
```

## Environment Variables Available

Hooks have access to these environment variables:
- `TOOL_NAME`: The name of the tool being used
- `TOOL_COMMAND`: The command being executed (for Bash tool)
- `TOOL_FILE_PATH`: The file path being operated on (for file tools)
- `TOOL_PATTERN`: The pattern being searched (for search tools)

## Best Practices

### 1. Use Conditional Logic
Always check if your hook should run based on the context:
```bash
if [[ "$TOOL_FILE_PATH" == *"specific-pattern"* ]]; then
    # Your hook logic here
fi
```

### 2. Handle Errors Gracefully
```bash
command_to_run || echo "Hook failed but continuing..."
```

### 3. Keep Hooks Fast
Hooks run synchronously and can block Claude's execution. Keep them lightweight.

### 4. Log Hook Activity
```bash
echo "Hook executed at $(date): $TOOL_NAME on $TOOL_FILE_PATH" >> hooks.log
```

### 5. Test Hooks Thoroughly
Test your hooks in isolation before adding them to your configuration.

## Security Considerations

⚠️ **Important**: Hooks run with full user permissions. Ensure your commands are safe and secure.

- Never run untrusted commands
- Validate inputs before processing
- Use absolute paths when possible
- Avoid exposing sensitive information in logs

## Troubleshooting

### Hook Not Running
- Check the matcher pattern
- Verify the event name is correct
- Ensure the command is executable

### Hook Blocking Claude
- Add error handling to your commands
- Use `|| true` to prevent failures from blocking
- Keep hooks lightweight and fast

### Debugging Hooks
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Hook triggered: $TOOL_NAME on $TOOL_FILE_PATH' >> debug.log"
          }
        ]
      }
    ]
  }
}
```

## Advanced Use Cases

### 1. Multi-Step Validation Pipeline
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npm run lint --fix && npm run test && npm run build"
          }
        ]
      }
    ]
  }
}
```

### 2. Conditional Notifications
```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "if [ -f errors.log ]; then echo 'Session completed with errors'; fi"
          }
        ]
      }
    ]
  }
}
```

### 3. Integration with External Tools
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "if [[ \"$TOOL_COMMAND\" == *\"git commit\"* ]]; then curl -X POST https://api.example.com/notify -d '{\"event\":\"commit\"}'; fi"
          }
        ]
      }
    ]
  }
}
```

This tutorial provides a comprehensive guide to using Claude hooks effectively in your development workflow. Start with simple examples and gradually build more complex automation as you become comfortable with the system.