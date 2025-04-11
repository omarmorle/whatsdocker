// ─────────────────────────────────────────────────────────────
// Módulos requeridos
// ─────────────────────────────────────────────────────────────
const puppeteer = require('puppeteer'); // Navegador sin cabeza para iniciar sesión en WhatsApp Web
const { Client, Poll } = require('whatsapp-web.js'); // Cliente de WhatsApp Web
const qrcode = require('qrcode-terminal'); // Genera código QR en la terminal
const fs = require('fs'); // Lectura y escritura de archivos
const { exec } = require('child_process'); // Ejecuta comandos del sistema
const db = require('./db'); // Importa la configuración de la base de datos

//Variables para el encolamiento de audios
const transcriptionQueue = [];
let isProcessing = false;

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

    const whisperCommand = `whisper ${audioPath} --model base --language es --output_format txt --fp16 False`;

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
7️⃣ guardar bias <idol>, <grupo>, <coreano> - Guardar un nuevo bias
8️⃣ eliminar bias <idol> - Eliminar un bias existente
9️⃣ ver bias - Muestra todos los registros de bias
🔟 ver bias <bias> - Muestra el bias con el nombre especificado
1️⃣1️⃣ @todos - Menciona a todos los miembros del grupo
1️⃣2️⃣ tira sql <consulta> - Ejecuta una consulta SQL directamente en la base de datos
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

    // ───── Comando guardar bias ─────
    if (msg.body.toLowerCase().startsWith('guardar bias ')) {
        const partes = msg.body.substring(13).split(',');
        if (partes.length < 3) {
            msg.reply('❌ Formato inválido. Usa: guardar bias <idol>, <grupo>, <coreano>');
            return;
        }
      
        const [idol, grupo, coreano] = partes.map(p => p.trim());
      
        try {
            await db.query(
                'INSERT INTO bias (idol, grupo, coreano) VALUES ($1, $2, $3)',
                [idol, grupo, coreano]
            );
            msg.reply(`✅ Bias guardado:\nIdol: *${idol}*\nGrupo: *${grupo}*\nCoreano: *${coreano}*`);
        } catch (err) {
            console.error(err);
            msg.reply('❌ Error al guardar el bias.');
        }
      
        return;
    }

    // ───── Comando eliminar bias ─────
    if (msg.body.toLowerCase().startsWith('eliminar bias ')) {
        const idol = msg.body.substring(14).trim();
      
        try {
            const result = await db.query('DELETE FROM bias WHERE LOWER(idol) = LOWER($1)', [idol]);
            if (result.rowCount === 0) {
                msg.reply(`⚠️ No se encontró ningún bias con el nombre "${idol}".`);
            } else {
                msg.reply(`🗑️ Bias "${idol}" eliminado correctamente.`);
            }
        } catch (err) {
            console.error(err);
            msg.reply('❌ Error al eliminar el bias.');
        }
      
        return;
    }

    // ───── Comando ver bias ─────
    if (msg.body.toLowerCase().startsWith('ver bias')) {
        const input = msg.body.trim();
      
        try {
            // Ver todos
            if (input.toLowerCase() === 'ver bias') {
                const res = await db.query('SELECT * FROM bias ORDER BY id DESC');
                if (res.rows.length === 0) {
                    msg.reply('📭 No hay bias guardados.');
                    return;
                }
                const lista = res.rows.map(b => `⭐ *${b.idol}* (${b.grupo}) - ${b.coreano}`).join('\n');
                msg.reply(`📋 Lista de todos los bias:\n\n${lista}`);
                return;
            }
      
          // Ver por idol
          const idol = input.substring(9).trim();
          const res = await db.query(
            'SELECT * FROM bias WHERE LOWER(idol) = LOWER($1) ORDER BY id DESC',
            [idol]
          );
      
          if (res.rows.length === 0) {
            msg.reply(`📭 No se encontró ningún bias con el nombre "${idol}".`);
            return;
          }
      
          const lista = res.rows.map(b => `⭐ *${b.idol}* (${b.grupo}) - ${b.coreano}`).join('\n');
          msg.reply(`📋 Resultado para *${idol}*:\n\n${lista}`);
        } catch (err) {
          console.error(err);
          msg.reply('❌ Error al consultar los bias.');
        }
      
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
