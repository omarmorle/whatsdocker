FROM node:18-slim

# Instalar dependencias necesarias
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y \
    chromium \
    libnss3 \
    libgconf-2-4 \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxi6 \
    libxtst6 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libpangoft2-1.0-0 \
    libcups2 \
    libxss1 \
    libxext6 \
    libxinerama1 \
    libgtk-3-0 \
    libgbm1 \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    git \
    build-essential \
    docker.io \
    bash \
    default-mysql-client \
    curl \
    wget \
    nano \
    vim \
    htop \
    iputils-ping \
    net-tools \
    screen \
    && apt-get clean

# Crear un entorno virtual para Python
RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"

# Actualizar pip y setuptools
RUN pip install --upgrade pip setuptools wheel

# Instalar PyTorch y Whisper
RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
RUN pip install git+https://github.com/openai/whisper.git

# Crear el directorio de la aplicación
WORKDIR /app

# Copiar los archivos de configuración
COPY package*.json ./
RUN npm install
RUN npm i whatsapp-web.js
RUN npm install pg


# Copiar el resto de los archivos
COPY . .

# Establecer la variable de entorno para Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Comando de inicio
CMD ["npm", "start"]
