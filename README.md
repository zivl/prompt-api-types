# prompt-api-types

TypeScript type definitions for Chrome's Prompt API, providing comprehensive types for language models and prompt-related functionality.

## Installation

```bash
npm install prompt-api-types
```

## Usage

### Basic Window Interface Extension

To use the types in your project, create a type declaration file (e.g., `external-types.d.ts`) and add the reference:

```typescript
/// <reference types="prompt-api-types/types" />

interface Window {
  LanguageModel: LanguageModelType
}
```

### Complete Example

```typescript
/// <reference types="prompt-api-types/types" />

interface Window {
  LanguageModel: LanguageModelType
}

// Example usage in your application
async function useLanguageModel() {
  const model = window.LanguageModel

  // Check availability
  const availability = await model.availability()

  if (availability === 'available') {
    // Create a session
    const session = await model.create({
      temperature: 0.7,
      topK: 40
    })

    // Simple prompt
    const response = await session.prompt('Hello, how are you?')
    console.log(response)

    // Advanced prompt with structured content
    const advancedResponse = await session.prompt([
      {
        role: 'system',
        content: { type: 'text', value: 'You are a helpful assistant.' }
      },
      {
        role: 'user',
        content: { type: 'text', value: 'What is TypeScript?' }
      }
    ])
    console.log(advancedResponse)

    // Streaming response
    for await (const chunk of session.promptStreaming('Tell me a story')) {
      console.log(chunk)
    }
  }
}
```

## Available Types

### Core Types

- `LanguageModelType` - Main interface with `create()` and `availability()` methods
- `LanguageModelSession` - Session interface for prompt interactions
- `LanguageModelOptions` - Configuration options for model requests
- `Availability` - Model availability status type
- `LanguageModelPromptResponse` - Response type (string)

### Message and Content Types

- `PromptPayload` - Can be a string or array of `ExpandedPromptPayload`
- `ExpandedPromptPayload` - Structured message with role and content
- `PromptMessageContent` - Union type for text, image, or audio content
- `PromptPayloadOptions` - Options for prompt requests including response constraints

### Advanced Types

- `CreateOptions` - Options for creating language model sessions
- `LanguageModelTool` - Tool definition for function calling
- `PromptResponseConstraint` - JSON schema for constraining responses
- `ExpectedInputOrOutput` - Type definitions for expected inputs/outputs
- `QuotaExceededError` - Error type for quota violations

### Multimodal Support

The API supports text, image, and audio content:

```typescript
// Text content
{ type: 'text', value: 'Hello world' }

// Image content (supports multiple formats)
{ type: 'image', value: imageElement } // HTMLImageElement, Canvas, Blob, etc.

// Audio content
{ type: 'audio', value: audioBlob } // Blob, AudioBuffer, etc.
```

### Tools and Function Calling

```typescript
const session = await model.create({
  tools: [{
    name: 'getCurrentWeather',
    description: 'Get current weather for a location',
    inputSchema: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'City name' }
      },
      required: ['location']
    },
    execute: async (input) => {
      // Your implementation
      return `Weather in ${input.location}: Sunny, 75°F`
    }
  }]
})
```

### Response Constraints

```typescript
const response = await session.prompt('Generate a person object', {
  responseConstraint: {
    type: 'object',
    required: ['name', 'age'],
    additionalProperties: false,
    properties: {
      name: { type: 'string' },
      age: { type: 'number' }
    }
  },
  omitResponseConstraintInput: false
})
```

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Clean generated files
npm run clean
```

## License

MIT
