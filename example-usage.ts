// Example: How to use prompt-api-types in your project
// This file demonstrates the usage pattern requested by the user

/// <reference types="prompt-api-types/types" />

interface Window {
  LanguageModel: LanguageModelType;
}

// Example usage implementation
async function exampleUsage() {
  // Access the LanguageModel from the window object
  const model = window.LanguageModel;

  // Check if the model is available
  const availability = await model.availability();
  console.log('Model availability:', availability);

  if (availability === 'available') {
    // Create a new language model session
    const session = await model.create({
      temperature: 0.7,
      topK: 40,
      expectedInputs: [{ type: 'text' }],
      expectedOutputs: [{ type: 'text' }],
    });

    // Simple text prompt
    const simpleResponse = await session.prompt('Hello, how are you?');
    console.log('Simple response:', simpleResponse);

    // Advanced prompt with expanded payload
    const advancedResponse = await session.prompt([
      {
        role: 'system',
        content: { type: 'text', value: 'You are a helpful assistant.' },
      },
      {
        role: 'user',
        content: { type: 'text', value: 'What is the capital of France?' },
      },
    ]);
    console.log('Advanced response:', advancedResponse);

    // Streaming response
    const streamingResponse = session.promptStreaming('Tell me a story');
    for await (const chunk of streamingResponse) {
      console.log('Streaming chunk:', chunk);
    }

    // Check input usage
    const usage = await session.measureInputUsage(
      'How much usage does this use?'
    );
    console.log('Input usage:', usage, 'tokens');
    console.log('Remaining quota:', session.inputQuota - session.inputUsage);
  }
}

// Example with tools
async function exampleWithTools() {
  const model = window.LanguageModel;

  if ((await model.availability()) === 'available') {
    const session = await model.create({
      tools: [
        {
          name: 'getCurrentTime',
          description: 'Get the current time',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
          execute: () => new Date().toISOString(),
        },
      ],
    });

    const response = await session.prompt('What time is it?');
    console.log('Response with tools:', response);
  }
}

// Example with response constraints
async function exampleWithConstraints() {
  const model = window.LanguageModel;

  if ((await model.availability()) === 'available') {
    const session = await model.create();

    const response = await session.prompt(
      'Generate a person object with name and age',
      {
        responseConstraint: {
          type: 'object',
          required: ['name', 'age'],
          additionalProperties: false,
          properties: {
            name: { type: 'string', description: 'Person name' },
            age: { type: 'number', description: 'Person age' },
          },
        },
        omitResponseConstraintInput: false,
      }
    );
    console.log('Constrained response:', response);
  }
}

// Example with multimodal content
async function exampleWithImage() {
  const model = window.LanguageModel;

  if ((await model.availability()) === 'available') {
    const session = await model.create({
      expectedInputs: [{ type: 'text' }, { type: 'image' }],
      expectedOutputs: [{ type: 'text' }],
    });

    // Assuming you have an image element
    const imageElement = document.getElementById('myImage') as HTMLImageElement;

    const response = await session.prompt([
      {
        role: 'user',
        content: { type: 'text', value: 'What do you see in this image?' },
      },
      {
        role: 'user',
        content: { type: 'image', value: imageElement },
      },
    ]);
    console.log('Image analysis response:', response);
  }
}
