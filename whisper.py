import whisperx
import sys
import os
import torch

def transcribe(audio_path):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    batch_size = 16
    compute_type = "float16" if device == "cuda" else "float32"

    model = whisperx.load_model("small", device, compute_type=compute_type)
    audio = whisperx.load_audio(audio_path)
    result = model.transcribe(audio, batch_size=batch_size)

    # Optional: word-level timestamps
    model_a, metadata = whisperx.load_align_model(language_code=result["language"], device=device)
    result_aligned = whisperx.align(result["segments"], model_a, metadata, audio, device, return_char_alignments=False)

    output_path = audio_path.replace(".ogg", ".txt").replace(".mp3", ".txt").replace(".wav", ".txt")
    text = ' '.join([s['text'] for s in result_aligned['segments']])
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(text)

    print(text)

if __name__ == "__main__":
    audio_path = sys.argv[1]
    transcribe(audio_path)
