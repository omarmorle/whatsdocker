#import sys
#from TTS.api import TTS

#texto = " ".join(sys.argv[1:])

# Modelo solo español, sin necesidad de parámetros extra
#tts = TTS(model_name="tts_models/es/css10/vits", progress_bar=False, gpu=False)
#tts.tts_to_file(text=texto, file_path="voz.wav")


import sys
from TTS.api import TTS

# Uso: python3 tts_coqui.py [velocidad] texto...
args = sys.argv[1:]

# Detectar si primer parámetro es velocidad
try:
    velocidad = float(args[0])
    texto = " ".join(args[1:])
except ValueError:
    velocidad = 1.0
    texto = " ".join(args)

tts = TTS(model_name="tts_models/es/css10/vits", progress_bar=False, gpu=False)
tts.tts_to_file(text=texto, file_path="voz.wav", speed=velocidad)
