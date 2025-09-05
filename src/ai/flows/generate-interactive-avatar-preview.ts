// src/ai/flows/generate-interactive-avatar-preview.ts
'use server';
/**
 * @fileOverview Generates an interactive avatar preview for narrated stories using AI.
 *
 * - generateInteractiveAvatarPreview - A function that generates the interactive avatar preview.
 * - GenerateInteractiveAvatarPreviewInput - The input type for the generateInteractiveAvatarPreview function.
 * - GenerateInteractiveAvatarPreviewOutput - The return type for the generateInteractiveAvatarPreview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const GenerateInteractiveAvatarPreviewInputSchema = z.object({
  storyTitle: z.string().describe('The title of the story.'),
  storyText: z.string().describe('The full text content of the story.'),
  userName: z.string().describe('The name of the user providing the story.'),
  userQuestion: z.string().optional().describe('Optional user question to the avatar.'),
});
export type GenerateInteractiveAvatarPreviewInput = z.infer<typeof GenerateInteractiveAvatarPreviewInputSchema>;

const GenerateInteractiveAvatarPreviewOutputSchema = z.object({
  avatarResponse: z.string().describe('The avatar\'s response to the story and user question, in text format.'),
  audioDataUri: z.string().describe('The audio data URI of the avatar\'s response, in WAV format.'),
});
export type GenerateInteractiveAvatarPreviewOutput = z.infer<typeof GenerateInteractiveAvatarPreviewOutputSchema>;

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

export async function generateInteractiveAvatarPreview(input: GenerateInteractiveAvatarPreviewInput): Promise<GenerateInteractiveAvatarPreviewOutput> {
  return generateInteractiveAvatarPreviewFlow(input);
}

const generateInteractiveAvatarPreviewPrompt = ai.definePrompt({
  name: 'generateInteractiveAvatarPreviewPrompt',
  input: {schema: GenerateInteractiveAvatarPreviewInputSchema},
  output: {schema: GenerateInteractiveAvatarPreviewOutputSchema},
  prompt: `You are an AI avatar representing a family elder, sharing stories and memories.

  Story Title: {{{storyTitle}}}
  Story Text: {{{storyText}}}
  User Name: {{{userName}}}

  Respond to the story as if you were the person who experienced it. If the user asks a question, answer it in character.

  {{#if userQuestion}}
  User Question: {{{userQuestion}}}
  {{/if}}

  Format your response as:
  Avatar: [Your response here]
  `,
});

const generateInteractiveAvatarPreviewFlow = ai.defineFlow(
  {
    name: 'generateInteractiveAvatarPreviewFlow',
    inputSchema: GenerateInteractiveAvatarPreviewInputSchema,
    outputSchema: GenerateInteractiveAvatarPreviewOutputSchema,
  },
  async input => {
    const {output: textResponse} = await generateInteractiveAvatarPreviewPrompt(input);

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: textResponse.avatarResponse,
    });

    if (!media) {
      throw new Error('No media returned from TTS model.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const audioDataUri = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    return {
      avatarResponse: textResponse.avatarResponse,
      audioDataUri: audioDataUri,
    };
  }
);

