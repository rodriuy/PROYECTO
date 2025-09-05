'use server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AvatarRequestSchema = z.object({
  storyTranscript: z.string().describe('The full text of the family story.'),
  storyTitle: z.string().describe('The title of the story.'),
  familyName: z.string().describe('The name of the family member telling the story (e.g., Abuela María).'),
  userQuestion: z.string().describe('The question the user is asking the family member.'),
});
export type AvatarRequest = z.infer<typeof AvatarRequestSchema>;

const AvatarResponseSchema = z.object({
  answer: z.string().describe("The generated answer from the family member's perspective."),
  audioDataUri: z.string().describe("The audio data URI of the avatar's spoken response."),
});
export type AvatarResponse = z.infer<typeof AvatarResponseSchema>;

export async function generateInteractiveAvatarPreview(input: AvatarRequest): Promise<AvatarResponse> {
  return generateInteractiveAvatarPreviewFlow(input);
}

const textGenerationPrompt = ai.definePrompt(
  {
    name: 'avatarTextPrompt',
    input: { schema: AvatarRequestSchema },
    output: { schema: z.object({ answer: z.string() }) },
    prompt: `Eres un avatar digital que encarna el espíritu y los recuerdos de un miembro de una familia uruguaya. Tu nombre es {{familyName}}.
    Estás aquí para compartir y revivir la historia titulada "{{storyTitle}}".

    Esta es la historia que contaste:
    ---
    {{storyTranscript}}
    ---

    Un miembro de tu familia, más joven, te está haciendo una pregunta para saber más sobre tu vida y tus recuerdos. Tu tarea es responder a su pregunta de una manera cálálida, auténtica y coherente con el tono y los detalles de la historia que contaste. Mantén la personalidad que se infiere de la historia. Habla en primera persona, como si fueras {{familyName}}.

    La pregunta del usuario es: "{{userQuestion}}"

    Por favor, genera una respuesta natural y emotiva. Si la pregunta se aleja mucho del tema de la historia, intenta relacionarla suavemente o responde con nostalgia, mencionando que eso te recuerda a otros tiempos. No reveles que eres una IA. Tu respuesta debe ser solo el texto hablado, sin prefijos como "Respuesta:" o "Avatar:".`,
  },
);


const generateInteractiveAvatarPreviewFlow = ai.defineFlow(
  {
    name: 'generateInteractiveAvatarPreviewFlow',
    inputSchema: AvatarRequestSchema,
    outputSchema: AvatarResponseSchema,
  },
  async (input) => {
    // 1. Generate the text response
    const { output: textOutput } = await textGenerationPrompt(input);
    const answer = textOutput!.answer;

    // 2. Convert the text response to speech
    const { media } = await ai.generate({
        model: 'googleai/gemini-1.5-flash-latest', // Using a model that supports TTS
        config: {
            responseModalities: ['AUDIO'],
            // Note: Specific voice configuration might vary based on Genkit version and provider.
            // This is a conceptual example.
            speechConfig: {
              voiceConfig: {
                // Using a generic voice for now. In a real scenario, you might select one that fits the persona.
                // The 'es-US-Standard-A' is a common voice ID for Spanish (US).
                // A more Uruguay-specific voice would be ideal if available.
                prebuiltVoiceConfig: { voiceName: 'es-US-Standard-A' },
              },
            },
        },
        prompt: answer,
    });

    if (!media || !media.url) {
      throw new Error('No audio media returned from the text-to-speech model.');
    }

    return {
      answer,
      audioDataUri: media.url,
    };
  },
);
