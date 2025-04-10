// ─────────────────────────────────────────────────────────────
// Módulos requeridos
// ─────────────────────────────────────────────────────────────
const puppeteer = require('puppeteer'); // Navegador sin cabeza para iniciar sesión en WhatsApp Web
const { Client } = require('whatsapp-web.js'); // Cliente de WhatsApp Web
const qrcode = require('qrcode-terminal'); // Genera código QR en la terminal
const fs = require('fs'); // Lectura y escritura de archivos
const { exec } = require('child_process'); // Ejecuta comandos del sistema


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


// ─────────────────────────────────────────────────────────────
// 📩 Escucha de mensajes entrantes
// ─────────────────────────────────────────────────────────────
client.on('message', async (msg) => {
    const raw = msg.body;
    const content = raw;

    // ───── Comando @todos ─────
    // Menciona a todos los miembros de un grupo
    if (msg.body.toLowerCase() === '@todos') {
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
    if (msg.body.toLowerCase() === 'minipc') {
        msg.reply(`🛠️ *Menú de Comandos MiniPC* 🛠️

1️⃣ start <nombre_contenedor> - Iniciar un contenedor
2️⃣ stop <nombre_contenedor> - Detener un contenedor
3️⃣ status - Ver el estado de todos los contenedores
4️⃣ ssh <comando> - Ejecutar un comando en el sistema
🛠️ Work In Progress - WIP

¡Dime qué comando deseas ejecutar!`);
        return;
    }
    // ───── Comando status ─────
    // Muestra el estado de los contenedores Docker
    if (msg.body.toLowerCase() === 'status') {
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

    // ───── Comando start ─────
    // Inicia un contenedor Docker por nombre
    if (msg.body.toLowerCase().startsWith('start ')) {
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
    if (msg.body.toLowerCase().startsWith('stop ')) {
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


    // ───── Transcripción de notas de voz con Whisper ─────
    if (msg.hasMedia && (msg.type === 'ptt' || msg.type === 'audio')) {
        const media = await msg.downloadMedia();
        const timestamp = Date.now();
        const extension = msg.mimetype ? msg.mimetype.split('/')[1] : 'ogg';
        const audioPath = `./audio_${timestamp}.${extension}`;
        const transcriptPath = `./audio_${timestamp}.txt`;

        // Guarda el audio como archivo temporal
        fs.writeFileSync(audioPath, media.data, { encoding: 'base64' });
        console.log(`Archivo de audio guardado: ${audioPath}`);

        // Ejecuta Whisper para transcribir el audio
        const whisperCommand = `whisper ${audioPath} --model base --language es --output_format txt --fp16 False`;
        exec(whisperCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error al ejecutar Whisper: ${stderr}`);
                msg.reply('Hubo un problema al transcribir la nota de voz.');
                return;
            }

            try {
                const transcript = fs.readFileSync(transcriptPath, 'utf-8');
                console.log(`Transcripción: ${transcript}`);
                msg.reply(`Transcripción: ${transcript}`);

                // Elimina los archivos temporales después de procesar
                fs.unlinkSync(audioPath);
                fs.unlinkSync(transcriptPath);
            } catch (err) {
                console.error(`Error al leer la transcripción: ${err.message}`);
                msg.reply('No se pudo leer la transcripción.');
            }
        });

        return;
    }
});

// Inicializa el cliente de WhatsApp Web
client.initialize();
