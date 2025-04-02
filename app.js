const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { exec } = require('child_process');

const client = new Client({
    puppeteer: {
        executablePath: '/usr/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot está listo');
});

client.on('message', async (msg) => {
    const content = msg.body.toLowerCase();

    // Etiquetar a todos si se escribe "@todos"
    if (content === '@todos') {
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

    // Mostrar menú secreto
    if (content === 'minipc') {
        msg.reply(`🛠️ *Menú de Comandos MiniPC* 🛠️
1️⃣ start <nombre_contenedor> - Iniciar un contenedor
2️⃣ stop <nombre_contenedor> - Detener un contenedor
3️⃣ status - Ver el estado de todos los contenedores
4️⃣ ipMinecraft - Obtener la IP del servidor de Minecraft
5️⃣ consolaMinecraft - Ver la consola del servidor de Minecraft
6️⃣ enviarMinecraft <comando> - Enviar un comando a la consola de Minecraft
7️⃣ ssh <comando> - Ejecutar un comando en el sistema

¡Dime qué comando deseas ejecutar!`);
        return;
    }

    // Comando para obtener el estado de los contenedores
    if (content === 'status') {
        exec("docker ps -a", (error, stdout, stderr) => {
            if (error) {
                msg.reply(`❌ Error al obtener el estado de los contenedores: ${stderr}`);
                return;
            }
            msg.reply(`📊 Estado de contenedores:\n${stdout}`);
        });
        return;
    }

    // Comando para iniciar contenedores
    if (content.startsWith('start ')) {
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

    // Comando para detener contenedores
    if (content.startsWith('stop ')) {
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

    // Comando para obtener la IP del servidor de Minecraft
    if (content === 'ipminecraft') {
        exec("docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' mc-server", (error, stdout, stderr) => {
            if (error) {
                msg.reply(`❌ Error al obtener la IP del servidor de Minecraft: ${stderr}`);
                return;
            }
            msg.reply(`🌐 IP del servidor de Minecraft: ${stdout.trim()}`);
        });
        return;
    }

    // Comando para ver la consola del servidor de Minecraft
    if (content === 'consolaminecraft') {
        msg.reply(`Para ver la consola ejecuta este comando en tu sistema:
\`docker attach mc-server\`
(O puedes usar screen o logs si lo tienes configurado así)`);
        return;
    }

    // Comando para enviar comandos a la consola de Minecraft
    if (content.startsWith('enviarminecraft ')) {
        const command = content.replace('enviarminecraft ', '').trim();
        exec(`docker exec mc-server ${command}`, (error, stdout, stderr) => {
            if (error) {
                msg.reply(`❌ Error al enviar el comando a la consola: ${stderr}`);
                return;
            }
            msg.reply(`✅ Comando enviado a Minecraft: ${stdout}`);
        });
        return;
    }

    // Comando para ejecutar comandos del sistema
    if (content.startsWith('ssh ')) {
        const command = content.replace('ssh ', '').trim();
        exec(command, (error, stdout, stderr) => {
            if (error) {
                msg.reply(`❌ Error al ejecutar el comando: ${stderr}`);
                return;
            }
            msg.reply(`💻 Resultado:\n${stdout}`);
        });
        return;
    }

    // Comando para transcribir audios
    if (msg.hasMedia && (msg.type === 'ptt' || msg.type === 'audio')) {
        const media = await msg.downloadMedia();
        const timestamp = Date.now();
        const extension = msg.mimetype ? msg.mimetype.split('/')[1] : 'ogg';
        const audioPath = `./audio_${timestamp}.${extension}`;
        const transcriptPath = `./audio_${timestamp}.txt`;

        // Guardar el archivo de audio
        fs.writeFileSync(audioPath, media.data, { encoding: 'base64' });
        console.log(`Archivo de audio guardado: ${audioPath}`);

        // Ejecutar Whisper para transcribir el audio
        const whisperCommand = `whisper ${audioPath} --model medium --language es --output_format txt --fp16 False`;
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

                // Eliminar archivos temporales
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

client.initialize();
