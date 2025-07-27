/**
 * Configuration options for language model requests
 */
export interface LanguageModelOptions {
  /** The specific model to use */
  model?: string;
  /** Controls randomness in response generation (0.0 to 1.0) */
  temperature?: number;
  /** Maximum number of tokens to generate */
  maxTokens?: number;
  /** Controls diversity via nucleus sampling (0.0 to 1.0) */
  topP?: number;
  /** Whether to stream the response */
  stream?: boolean;
  /** AbortSignal to cancel the request */
  signal?: AbortSignal;
}

/**
 * Union type representing different types of content that can be sent to the language model
 */
export type PromptMessageContent =
  | {
      /** Text content type */
      type: 'text';
      /** The text string */
      value: string;
    }
  | {
      /** Image content type */
      type: 'image';
      /** Image data in various supported formats */
      value:
        | Blob
        | ImageData
        | ImageBitmap
        | VideoFrame
        | OffscreenCanvas
        | HTMLImageElement
        | SVGImageElement
        | HTMLCanvasElement
        | HTMLVideoElement
        | BufferSource
        | ArrayBuffer;
    }
  | {
      /** Audio content type */
      type: 'audio';
      /** Audio data in supported formats */
      value: Blob | AudioBuffer | BufferSource;
    };

/**
 * Defines a property in a JSON schema for response constraints
 */
export interface PromptResponseConstraintProperty {
  /** The JSON Schema type of this property */
  type: string;
  /** Optional description of the property */
  description?: string;
  /** Additional schema properties */
  [key: string]: any;
}

/**
 * JSON Schema object for constraining language model responses
 */
export interface PromptResponseConstraint {
  /** The JSON Schema type (typically "object") */
  type: string;
  /** Array of required property names */
  required: string[];
  /** Whether additional properties are allowed */
  additionalProperties: boolean;
  /** Object defining the schema properties */
  properties: {
    [key: string]: PromptResponseConstraintProperty;
  };
}

/**
 * Options for controlling prompt behavior and response format
 */
export interface PromptPayloadOptions {
  /** JSON schema to constrain the response format */
  responseConstraint: PromptResponseConstraint;
  /** Whether to omit the constraint from the input */
  omitResponseConstraintInput: boolean;
}

/**
 * Prompt input that can be either a simple string or an array of structured messages
 */
export type PromptPayload = ExpandedPromptPayload[] | string;

/**
 * Structured message with role and content for conversation-style prompts
 */
export interface ExpandedPromptPayload {
  /** The role of the message sender */
  role: 'system' | 'user' | 'assistant';
  /** The content of the message */
  content: PromptMessageContent;
}

/**
 * Specification for expected input or output types and languages
 */
export interface ExpectedInputOrOutput {
  /** The type of content expected */
  type: 'text' | 'image' | 'audio';
  /** Optional array of supported language codes */
  languages?: string[];
}

/**
 * Configuration options for creating a new language model session
 */
export interface CreateOptions {
  /** Types of inputs the session should expect */
  expectedInputs?: ExpectedInputOrOutput[];
  /** Types of outputs the session should produce */
  expectedOutputs?: ExpectedInputOrOutput[];
  /** Initial prompts to set context for the session */
  initialPrompts?: PromptPayload[];
  /** Available tools for function calling */
  tools?: LanguageModelTool[];
  /** Temperature setting for response generation */
  temperature?: number;
  /** Top-k sampling parameter */
  topK?: number;
}

/**
 * Definition of a tool that the language model can call
 */
export interface LanguageModelTool {
  /** Unique name for the tool */
  name: string;
  /** Human-readable description of what the tool does */
  description: string;
  /** JSON Schema defining the expected input structure */
  inputSchema: {
    /** Root type of the input schema */
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    /** Properties definition for object inputs */
    properties: {
      [key: string]: {
        /** Type of this property */
        type: 'string' | 'number' | 'boolean' | 'array' | 'object';
        /** Description of this property */
        description: string;
      };
    };
    /** Array of required property names */
    required: string[];
  };
  /** Function to execute when the tool is called */
  execute: (input: any) => Promise<any> | any;
}

/**
 * Availability status of the language model
 */
export type Availability =
  | 'available' // Ready to use
  | 'downloading' // Currently downloading
  | 'downloadable' // Can be downloaded
  | 'unavailable' // Not available
  | 'unknown'; // Status unknown

/**
 * Main interface for the language model available on the window object
 */
export interface LanguageModelType {
  /**
   * Create a new language model session
   * @param options Configuration options for the session
   * @returns Promise that resolves to a new session
   */
  create(options?: CreateOptions): Promise<LanguageModelSession>;

  /**
   * Check the current availability status of the language model
   * @returns Promise that resolves to the availability status
   */
  availability(): Promise<Availability>;
}

/**
 * A language model session for conducting conversations and generating responses
 */
export interface LanguageModelSession {
  /**
   * Generate a response to a prompt
   * @param payload The prompt content
   * @param options Optional configuration for the request
   * @returns Promise that resolves to the response string
   */
  prompt(
    payload: PromptPayload,
    options?: PromptPayloadOptions
  ): Promise<LanguageModelPromptResponse>;

  /**
   * Generate a streaming response to a prompt
   * @param payload The prompt content
   * @param options Optional configuration for the request
   * @returns AsyncIterable of response chunks
   */
  promptStreaming(
    payload: PromptPayload,
    options?: PromptPayloadOptions
  ): AsyncIterable<LanguageModelPromptResponse>;

  /**
   * Measure how many tokens a prompt would consume
   * @param payload The prompt content to measure
   * @param options Optional configuration for the measurement
   * @returns Promise that resolves to the token count
   */
  measureInputUsage(
    payload: PromptPayload,
    options?: PromptPayloadOptions
  ): Promise<number>;

  /** Current top-k sampling value */
  topK: number;
  /** Current temperature setting */
  temperature: number;
  /** Maximum tokens that can be generated */
  maxTokens: number;
  /** Total input quota available */
  inputQuota: number;
  /** Current input usage count */
  inputUsage: number;

  /**
   * Add an event listener to the session
   * @param event The event name to listen for
   * @param callback Function to call when event occurs
   */
  addEventListener(event: string, callback: (event: any) => void): void;

  /**
   * Remove an event listener from the session
   * @param event The event name to stop listening for
   * @param callback The callback function to remove
   */
  removeEventListener(event: string, callback: (event: any) => void): void;

  /**
   * Dispatch an event on the session
   * @param event The event name to dispatch
   * @param data Data to include with the event
   */
  dispatchEvent(event: string, data: any): void;
}

/**
 * Response from a language model prompt request
 */
export type LanguageModelPromptResponse = string;

/**
 * Error thrown when input quota is exceeded
 */
export type QuotaExceededError = DOMException & {
  /** Number of tokens the input requested */
  requested: number;
  /** Number of tokens available (inputQuota - inputUsage) */
  quota: number;
};

// Global declarations for window extensions
declare global {
  interface Window {
    /** The language model instance available in the browser */
    LanguageModel?: LanguageModelType;
  }
}
