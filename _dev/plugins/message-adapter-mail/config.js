'use strict';

module.exports = {

    // Config for system
    plugin: {
        description: 'Envoyer des mails'
    },

    // Config for system
    adapter: {

        description: 'Send mail with your tasks',
        displayName: 'Mail',

        options: [
            {
                name: 'mail',
                label: 'Adresse mail à utiliser',
                type: 'text',
                required: true
            },
            {
                name: 'code',
                label: 'Code d\'autorisation',
                type: 'password',
                required: true
            },
            {
                name: 'mailTo',
                label: 'Destinataire des mails',
                type: 'text',
                required: true
            },
        ]
    }
};