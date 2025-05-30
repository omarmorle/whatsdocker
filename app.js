// ─────────────────────────────────────────────────────────────
// Módulos requeridos
// ─────────────────────────────────────────────────────────────
const puppeteer = require('puppeteer'); // Navegador sin cabeza para iniciar sesión en WhatsApp Web
const { Client, Poll } = require('whatsapp-web.js'); // Cliente de WhatsApp Web
const qrcode = require('qrcode-terminal'); // Genera código QR en la terminal
const fs = require('fs'); // Lectura y escritura de archivos
const { exec } = require('child_process'); // Ejecuta comandos del sistema
const db = require('./db'); // Importa la configuración de la base de datos
const { MessageMedia } = require('whatsapp-web.js'); // Manejo de archivos de WhatsApp

//Variables para el encolamiento de audios
const transcriptionQueue = [];
let isProcessing = false;
const ttsQueue = [];
let isProcessingTTS = false;

// ─────────────────────────────────────────────────────────────
// Configuración e inicialización del cliente de WhatsApp
// ─────────────────────────────────────────────────────────────
const client = new Client({
    puppeteer: {
        executablePath: puppeteer.executablePath(),
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Genera el código QR en la terminal para escanear con WhatsApp
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Confirma que el bot ha sido inicializado correctamente
client.on('ready', () => {
    console.log('Bot está listo');
});

// Procesa el audio a texto
function processQueue() {
    if (isProcessing || transcriptionQueue.length === 0) return;

    isProcessing = true;
    const { audioPath, transcriptPath, msg } = transcriptionQueue.shift();

    const whisperCommand = `python3 whisper.py ${audioPath}`;

    exec(whisperCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error al ejecutar Whisper: ${stderr}`);
            msg.reply('Hubo un problema al transcribir la nota de voz.');
        } else {
            try {
                const transcript = fs.readFileSync(transcriptPath, 'utf-8');
                msg.reply(`Transcripción: ${transcript}`);
            } catch (err) {
                console.error(`Error al leer la transcripción: ${err.message}`);
                msg.reply('No se pudo leer la transcripción.');
            }
        }

        // Limpieza
        fs.unlink(audioPath, () => {});
        fs.unlink(transcriptPath, () => {});

        isProcessing = false;
        processQueue();
    });
}

// Procesa el texto a audio
function processTTSQueue() {
    if (isProcessingTTS || ttsQueue.length === 0) return;

    isProcessingTTS = true;
    const { texto, msg } = ttsQueue.shift();

    let velocidad = '1.0';
    let textoFinal = texto;

    // Si empieza con número, se toma como velocidad
    if (/^[0-9.]+\s/.test(texto)) {
        const partes = texto.split(/\s+/);
        velocidad = partes[0];
        textoFinal = partes.slice(1).join(' ');
    }

    const comando = `python3 tts_coqui.py ${velocidad} "${textoFinal.replace(/"/g, '\\"')}"`;

    const { exec } = require('child_process');
    const { execSync } = require('child_process');

    exec(comando, async (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Error TTS:', stderr);
            try {
                await msg.reply('❌ No pude generar la voz.');
            } catch (err) {
                console.error('❌ No pude notificar error al usuario:', err.message);
            }
            isProcessingTTS = false;
            processTTSQueue();
            return;
        }

        try {
            // Validar velocidad permitida para atempo (entre 0.5 y 2.0)
            const velocidadFF = Math.max(0.5, Math.min(2.0, parseFloat(velocidad))) || 1.0;

            // Convertir WAV a OGG con cambio de velocidad
            execSync(`ffmpeg -y -i ./voz.wav -filter:a "atempo=${velocidadFF}" -ar 48000 -ac 1 -c:a libopus ./voz.ogg`);

            const media = MessageMedia.fromFilePath('./voz.ogg');

            try {
                await client.sendMessage(msg.from, media, { sendAudioAsVoice: true });
            } catch (sendErr) {
                console.error('❌ Error al enviar audio (mensaje puede haber sido eliminado):', sendErr.message);
            }

        } catch (err) {
            console.error('❌ Error al procesar el archivo de voz:', err);
            try {
                await msg.reply('❌ No pude enviar la nota de voz.');
            } catch (replyErr) {
                console.error('❌ Error al responder mensaje (posiblemente eliminado):', replyErr.message);
            }
        }

        isProcessingTTS = false;
        processTTSQueue();
    });
}


// ─────────────────────────────────────────────────────────────
// 📩 Escucha de mensajes entrantes
// ─────────────────────────────────────────────────────────────
client.on('message', async (msg) => {
    const raw = msg.body;
    const content = raw;
    const body = msg.body.toLowerCase();

    // ───── Comando @todos ─────
    // Menciona a todos los miembros de un grupo
    const todos = '@todos';
    const everyone = '@everyone';
    if (body.includes(todos) || body.includes(everyone)) {
        const chat = await msg.getChat();
        if (chat.isGroup) {
            let text = '';
            let mentions = [];

            for (let participant of chat.participants) {
                const contact = await client.getContactById(participant.id._serialized);
                mentions.push(contact);
                text += `@${contact.number} `;
            }

            chat.sendMessage(text.trim(), { mentions });
        } else {
            msg.reply('Este comando solo funciona en grupos.');
        }
        return;
    }

    // ───── Comando minipc ─────
    // Muestra el menú de comandos disponibles para gestión del sistema
    if (body === 'minipc') {
        msg.reply(`🛠️ *Menú de Comandos MiniPC* 🛠️

1️⃣ start <nombre_contenedor> - Iniciar un contenedor
2️⃣ stop <nombre_contenedor> - Detener un contenedor
3️⃣ status - Ver el estado de todos los contenedores
4️⃣ ssh <comando> - Ejecutar un comando en el sistema
5️⃣ crear encuesta <pregunta>, <opción1>, <opción2>, ... - Crear una encuesta
6️⃣ elige random - Menciona a un miembro aleatorio del grupo
7️⃣ @todos - Menciona a todos los miembros del grupo
8️⃣ tira sql <consulta> - Ejecuta una consulta SQL directamente en la base de datos
🛠️ Work In Progress - WIP

¡Dime qué comando deseas ejecutar!`);
        return;
    }
    // ───── Comando status ─────
    // Muestra el estado de los contenedores Docker
    if (body === 'status') {
        exec("docker ps -a --format '{{.Names}}\t{{.Status}}\t{{.Image}}'", (error, stdout, stderr) => {
            if (error) {
                msg.reply(`❌ Error al obtener el estado de los contenedores: ${stderr}`);
                return;
            }

            const lines = stdout.trim().split('\n');
            let formatted = '*📦 Contenedores Docker:*\n\n';
            lines.forEach(line => {
                const [name, status, image] = line.split('\t');
                formatted += `*🟢 ${name}*\nEstado: ${status}\nImagen: ${image}\n\n`;
            });

            msg.reply(formatted.trim());
        });
        return;
    }

    // ───── Comando status <nombre_contenedor> ─────
    if (body.startsWith('status ') && body !== 'status') {
        const nombre = body.replace('status ', '').trim();
        if (!nombre) {
            msg.reply('❌ Especifica el nombre del contenedor. Ejemplo:\nstatus boda');
            return;
        }

        exec(`docker inspect -f '{{.State.Status}}' ${nombre}`, (error, stdout, stderr) => {
            if (error) {
                msg.reply(`❌ No encontré ningún contenedor llamado *${nombre}*`);
                return;
            }

            const estado = stdout.trim();
            let emoji = '⚪️';

            if (estado === 'running') emoji = '🟢';
            else if (estado === 'exited') emoji = '🔴';
            else if (estado === 'paused') emoji = '🟡';

            msg.reply(`📦 Estado de *${nombre}*: ${emoji} ${estado}`);
        });

        return;
    }

    // ───── Comando start ─────
    // Inicia un contenedor Docker por nombre
    if (body.startsWith('start ')) {
        const container = content.replace('start ', '').trim();
        exec(`docker start ${container}`, (error, stdout, stderr) => {
            if (error) {
                msg.reply(`❌ Error al iniciar el contenedor: ${stderr}`);
                return;
            }
            msg.reply(`✅ Contenedor iniciado: ${stdout}`);
        });
        return;
    }

    // ───── Comando stop ─────
    // Detiene un contenedor Docker por nombre
    if (body.startsWith('stop ')) {
        const container = content.replace('stop ', '').trim();
        exec(`docker stop ${container}`, (error, stdout, stderr) => {
            if (error) {
                msg.reply(`❌ Error al detener el contenedor: ${stderr}`);
                return;
            }
            msg.reply(`🛑 Contenedor detenido: ${stdout}`);
        });
        return;
    }

    // ───── Comando crear encuesta ─────
    if (body.startsWith('crear encuesta ')) {
        const partes = msg.body.substring(15).split(',');
        if (partes.length < 2) {
            msg.reply('❗ Formato inválido. Usa: crear encuesta pregunta, opción1, opción2...');
            return;
        }
    
        const pregunta = partes[0].trim();
        const opciones = partes.slice(1).map(op => op.trim()).filter(op => op.length > 0);
    
        if (opciones.length < 2) {
            msg.reply('❗ Necesitas al menos dos opciones para crear una encuesta.');
            return;
        }
    
        try {
            await msg.reply(new Poll(pregunta, opciones));
        } catch (err) {
            console.error('❌ Error al crear encuesta:', err);
            msg.reply('❌ Hubo un error al crear la encuesta.');
        }
        return;
    }    

    // ─────────────────────────────────────────────────────────────
    // Respuestas personalizadas para ciertos comandos del sistema
    // ─────────────────────────────────────────────────────────────
    const customResponses = [
        {
            match: /^touch\s+(.+)/i,
            getResponse: (args) => `📄 Archivo *${args[1]}* creado correctamente!`
        },
        {
            match: /^rm\s+(-r\s+)?(.+)/i,
            getResponse: (args) => `🗑️ *${args[2]}* eliminado correctamente!`
        },
        {
            match: /^mv\s+(.+)\s+(.+)/i,
            getResponse: (args) => `✂️ *${args[1]}* movido a *${args[2]}* correctamente!`
        },
        {
            match: /^cp\s+(.+)\s+(.+)/i,
            getResponse: (args) => `📄 *${args[1]}* copiado a *${args[2]}* correctamente!`
        },
        {
            match: /^echo\s+.+>\s*(.+)/i,
            getResponse: (args) => `📝 Texto guardado en *${args[1]}* correctamente!`
        },
        {
            match: /^ls$/i,
            getResponse: () => `📂 Contenido del directorio:\n`
        }
    ];

    // ───── Comando ssh ─────
    // Ejecuta comandos del sistema desde WhatsApp
    if (msg.body.startsWith('ssh ')) {
        const command = content.replace('ssh ', '').trim();
        console.log(`🛠️ - Ejecutando comando: ${command}`);

        // Manejo especial para múltiples directorios con mkdir
        if (command.startsWith('mkdir ')) {
            const dirNames = command.replace('mkdir ', '').trim().split(/\s+/);
            let responses = [];
            let remaining = dirNames.length;

            dirNames.forEach(dir => {
                exec(`mkdir "${dir}"`, (err, stdout, stderr) => {
                    if (err) {
                        if (/ya existe|file exists/i.test(stderr)) {
                            responses.push(`⚠️ El directorio *${dir}* ya existe.`);
                        } else {
                            responses.push(`❌ Error creando *${dir}*: ${stderr.trim()}`);
                        }
                    } else {
                        responses.push(`📁 Directorio *${dir}* creado correctamente!`);
                    }

                    remaining--;

                    if (remaining === 0) {
                        exec('pwd', (pwdError, pwdOut) => {
                            const ruta = pwdError ? '[Error al obtener ruta]' : pwdOut.trim();
                            msg.reply(`📁 *Ruta actual:* ${ruta}\n\n${responses.join('\n')}`);
                        });
                    }
                });
            });

            return;
        }

        // Ejecuta cualquier otro comando
        exec(command, (error, stdout, stderr) => {
            exec('pwd', (pwdError, pwdOutput) => {
                const ruta = pwdError ? '[Error al obtener ruta]' : pwdOutput.trim();
                const output = stdout.trim();
                const errorOutput = stderr.trim();
                const yaExiste = /ya existe|file exists/i.test(errorOutput);

                if (error && yaExiste) {
                    msg.reply(`📁 *Ruta actual:* ${ruta}\n\n⚠️ El archivo o directorio ya existe.`);
                    return;
                }

                if (error) {
                    msg.reply(`📁 *Ruta actual:* ${ruta}\n\n❌ *Error:*\n${errorOutput || 'Error desconocido.'}`);
                    return;
                }

                for (let cmd of customResponses) {
                    const match = command.match(cmd.match);
                    if (match) {
                        const header = cmd.getResponse(match);
                        msg.reply(`📁 *Ruta actual:* ${ruta}\n\n${header}${output ? '\n' + output : ''}`);
                        return;
                    }
                }

                msg.reply(`📁 *Ruta actual:* ${ruta}\n\n💻 Resultado:\n${output || 'Sin salida.'}`);
            });
        });

        return;
    }

    // ───── Comando elige random ─────
    if (body === 'elige random') {
        const chat = await msg.getChat();
        if (chat.isGroup) {
            const participantes = chat.participants;
            const randomIndex = Math.floor(Math.random() * participantes.length);
            const randomParticipant = participantes[randomIndex];
            const contact = await client.getContactById(randomParticipant.id._serialized);

            chat.sendMessage(`🎲 ¡Hoy le toca a @${contact.number}!`, {
                mentions: [contact]
            });
        } else {
            msg.reply('Este comando solo funciona en grupos.');
        }
        return;
    }

    // ───── BIAS ─────
    const miBiasRegex = /^mi bias de (.+)$/i;
    const biasDeRegex = /^bias de (.+) de (.+)$/i;

    const miBiasMatch = raw.match(miBiasRegex);
    const biasDeMatch = raw.match(biasDeRegex);

    if (miBiasMatch) {
        const grupo = miBiasMatch[1].trim();
        const telefono = msg.author
            ? msg.author.replace(/[^0-9]/g, '')
            : msg.from.replace(/[^0-9]/g, '');

        try {
            const result = await db.query(
                `SELECT b.idol, b.imagen_path FROM usuarios_bias ub
                 JOIN bias b ON ub.bias_id = b.id
                 WHERE ub.telefono = $1 AND LOWER(ub.grupo) = LOWER($2)`,
                [telefono, grupo]
            );

            if (result.rows.length > 0) {
                const { idol, imagen_path } = result.rows[0];
                await msg.reply(`Tu bias de ${grupo} es *${idol}*`, msg.from);
                const media = MessageMedia.fromFilePath(imagen_path);
                await client.sendMessage(msg.from, media);
            } else {
                msg.reply(`No encontré tu bias de ${grupo}.`);
            }
        } catch (err) {
            console.error('Error al consultar bias:', err);
            msg.reply(`❌ Error al buscar tu bias: ${JSON.stringify(err)}`);
        }

        return;
    }

    if (biasDeMatch) {
        const nombre = biasDeMatch[1].trim();
        const grupo = biasDeMatch[2].trim();

        try {
            const result = await db.query(
                `SELECT b.idol, b.imagen_path FROM usuarios_bias ub
                 JOIN bias b ON ub.bias_id = b.id
                 WHERE LOWER(ub.usuario) = LOWER($1) AND LOWER(ub.grupo) = LOWER($2)`,
                [nombre, grupo]
            );

            if (result.rows.length > 0) {
                const { idol, imagen_path } = result.rows[0];
                await msg.reply(`El bias de ${nombre} en ${grupo} es *${idol}*`, msg.from);
                const media = MessageMedia.fromFilePath(imagen_path);
                await client.sendMessage(msg.from, media);
            } else {
                msg.reply(`No encontré el bias de ${nombre} en ${grupo}.`);
            }
        } catch (err) {
            console.error('Error al consultar bias de otro usuario:', err);
            msg.reply('❌ Hubo un error al buscar el bias.');
        }

        return;
    }

    // ───── Comando dime para nota de voz ─────
    if (msg.body.startsWith('!dime ')) {
        const texto = msg.body.substring(6).trim();
        if (!texto) {
            msg.reply('❌ ¿Qué quieres que diga? Usa: !dime tu mensaje');
            return;
        }
    
        ttsQueue.push({ texto, msg });
        processTTSQueue();
        return;
    }

    // ───── Comando tira sql ─────
    if (body.startsWith('tira sql ')) {
        const query = msg.body.substring(9).trim();
      
        try {
          const result = await db.query(query);
      
          if (result.rows.length > 0) {
            // Formatea resultados en tabla simple
            const headers = Object.keys(result.rows[0]).join(' | ');
            const rows = result.rows.map(row => Object.values(row).join(' | ')).join('\n');
            const respuesta = `📊 *Resultado:*\n\n${headers}\n${'-'.repeat(headers.length)}\n${rows}`;
            msg.reply(respuesta.slice(0, 3000)); // Trunca si es muy largo
          } else if (result.command === 'SELECT') {
            msg.reply('📭 Consulta ejecutada, sin resultados.');
          } else {
            msg.reply(`✅ Comando SQL ejecutado con éxito: *${result.command}*`);
          }
        } catch (err) {
          console.error('❌ Error SQL:', err.message);
          msg.reply(`❌ Error en la consulta:\n${err.message}`);
        }
      
        return;
      }

    // ───── Transcripción de notas de voz con Whisper ─────
    if (msg.hasMedia && (msg.type === 'ptt' || msg.type === 'audio')) {
        const media = await msg.downloadMedia();
        const timestamp = Date.now();
        const extension = msg.mimetype ? msg.mimetype.split('/')[1] : 'ogg';
        const audioPath = `./audio_${timestamp}.${extension}`;
        const transcriptPath = `./audio_${timestamp}.txt`;
    
        fs.writeFileSync(audioPath, media.data, { encoding: 'base64' });
        transcriptionQueue.push({ audioPath, transcriptPath, msg });
    
        processQueue();
        return;
    }

    // ──── Huevos vayanse a la verga ────
    if (body === ('huevos')) {
        msg.reply('Vayanse a la verga');
        return;
    }

});

// Inicializa el cliente de WhatsApp Web
client.initialize();
