const cheerio = require('cheerio');

const jokes = [
    'Something happened, but I’m not telling you what.',
    'Task failed successfully.',
    'You got 500\'d, sorry!',
    'rm -rf "/home/user/Documents/Programming/Web/Loard/users/*"',
    'Yikes! The API server is down, contact `marshallovski` at Discord'
];

function randomJoke() {
    return jokes[Math.floor(Math.random() * jokes.length)];
}

const chatHost = 'https://44464cc48710e0676d7881b606761201.serveo.net/send.php';

(async () => {
    console.log('getting joke');
    
    const res = await cheerio.fromURL('http://anekdots-api');
    const text = res.text();


    const errorMessage = `${randomJoke()}\n(type: api error, trnr: ${Date.now().toString(18)}, dt: ${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()})`;

    let formData = new FormData();
    formData.append('login', 'anonymous');
    formData.append('password', '');
    formData.append('message', text ?? errorMessage);

    console.log('sending joke');
    
    // sending request to mr. sugoma's chat server
    const msgReq = await fetch(chatHost, {
        method: 'post',
        body: formData
    }).catch(e => console.error(`Error: ${e.message} (host: ${chatHost})`));

    const msgRes = await msgReq?.text();
    const $ = cheerio.load(msgRes ?? '');

    const title = $('title').text();
    const bodyText = $('body').text();

    const HTMLrefresh = '<meta http-equiv="refresh"';

    const bodyInnerHTML = $('body').prop('innerHTML');
    const trimmedBody = bodyInnerHTML.trim();

    if (msgReq.status === 200) {
        console.log('successfully sent the joke');
        
        // detecting redirect
        if (trimmedBody.startsWith(HTMLrefresh)) {
            const redirectTarget = $('meta[http-equiv="refresh"]').attr('content').match(/url=(.+)/)[1].trim();

            return console.log(`*- redirect -*\ncode: ${msgReq?.status} ${msgReq?.statusText}\n\ntitle: "${title}"\ntarget: ${redirectTarget}\nbody: "${trimmedBody}"\n*- redirect -*\n`);
        }

        return console.log(`*- server response -*\ncode: ${msgReq?.status} ${msgReq?.statusText}\n\ntitle: "${title}"\nbody: "${trimmedBody ?? '<empty>'}"\n*- server response -*\n`);
    } else {
        console.error('error when sending the joke');

        const trimmedHTML = $.root().html().trim();
        console.log(`*- unhandled server response -*\ncode: ${msgReq?.status} ${msgReq?.statusText}\n\ntitle: "${title}"\nbody: "${bodyText ?? '<empty>'}"\nraw response: ${trimmedHTML}\n*- unhandled server response -*\n`);
    }
})();
