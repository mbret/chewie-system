'use strict';

module.exports = {

    // 'Elizabeth', u'Adel', u'Bronwen', u'Eva', u'Marta', u'Guy', u'PapaNoel', u'Papi', u'Philippe', u'Ramboo', u'Robot', u'Sidoo', u'Sorciere', u'Stallone', u'Yeti', u'Zozo', u'Pedro', u'Helene', u'Paul', u'Sonia', u'Emma', u'Ludovic', u'Michel', u'Fabienne', u'Matteo', u'Emma', u'Judith', u'Martha', u'Becool', u'Chuchoti', u'Dark', u'Jean', u'Alain', u'Papy_Noel', u'Sylvester', u'Stallone', u'Moussa', u'Mendoo', u'Witch']. got 'qsd'
    voices: [
        { key: 'Sorciere', value: 'Sorciere' },
        { key: 'Philippe', value: 'Philippe' },
        { key: 'Sylvia', value: 'Sylvia' },
        { key: 'Agnes', value: 'Agnes' },
        { key: 'Loic', value: 'Loic' },
        { key: 'Damien', value: 'Damien' },
        { key: 'Becool', value: 'Becool' },
        { key: 'Chut', value: 'Chut' },
        { key: 'DarkVadoor', value: 'DarkVadoor' },
        { key: 'Electra', value: 'Electra' },
        { key: 'JeanJean', value: 'JeanJean' },
        { key: 'John', value: 'John' },
        { key: 'Melodine', value: 'Melodine' },
    ],

    coreModule: {
        description: 'Add speaker adapter with voxygen voices',

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
    },

    speakerAdapter: {
        voice: 'Becool',

        // By default the player will look for mpg123 as PATH executable
        // You can force the use of specific location
        //binaryPath: null,
        binaryPath: 'C:/Program Files/mpg123/mpg123',

    },

    voxygenBasePath: "http://www.voxygen.fr/sites/all/modules/voxygen_voices/assets/proxy/index.php?method=redirect&voice=:voice&text=:text",

};