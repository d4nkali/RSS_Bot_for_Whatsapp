/*

Boot para WhatsApp para enviar feed RSS

Autor: d4nkali 
Data: 22/07/2024

*/

// Importando as bibliotecas

const express = require('express');
const Twilio = require('twilio');
const RSSParser = require('rss-parser');
const parser = new RSSParser();

const app = express(); // Cria a aplicação 
app.use(express.urlencoded({ extended: true}));

const link_rss = 'LINK_RSS'; //? Link do RSS para ser atualizado
const what_numero = 'whatsapp:+SEU_NUMERO' //? Numero onde recebera as atualizações do RSS

var ult_envio = new Set(); // Armazena as atualizações para evitar duplicatas

async function attRSS() { //* Função para atualização do RSS

    let feed = await parser.parseURL(link_rss);
    feed.items.forEach(item => {

        if (!ult_envio.has(item.link)) { //* Se o link for não foi enviado, então:

            // Envia a mensagem
            envMensagem(item.title + "/n" + item.content + "/n" + item.link);
            ult_envio.add(item.link);

        }

    });

}

function envMensagem(mensagem) { //* Função para enviar mensagem no WhatsApp usando Twilio

    cliente.mensagem.criar({

        body: mensagem, //? Conteúdo da mensagem
        from: 'whatsapp:+14155238886', //? Número do WhatsApp do bot Twilio
        to: what_numero //? Número de envio

    }).then(mensagem => console.log(mensagem.sid)).catch(err => console.error(err)); //! Loga qualquer erro que possa acontecer

}

app.post('/webhook', (req, res) => { // Ativar webhook do Twilio

    const msgEntrada = req.body.Body.toLowerCase(); // Converte as mensagens para minusculo

    if (msgEntrada.includes('start')) { //* Se for digitado 'start'

        // Verifica se a atualização do feed a cada 1 hora
        res.send('<Response><Message>Bot iniciado. Você receberá atualizações do RSS.</Message></Response>')
        setInterval(attRSS, 3600000);

    }

    else { //* Senão:

        res.send('<Response><Message>Envie "start" para iniciar as notificações de RSS.</Message></Response>');

    }

});

const info_port = process.env.PORT || 3000; // Define a porta do server

app.listen(info_port, () => {

    console.log(`Bot está rodando na porta ${info_port}`);

});
