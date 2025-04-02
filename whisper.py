import whisper
import sys

def transcribe(audio_path):
    model = whisper.load_model("base")
    result = model.transcribe(audio_path)
    print(result["text"])

if __name__ == "__main__":
    audio_path = sys.argv[1]
    transcribe(audio_path)
