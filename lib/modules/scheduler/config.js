'use strict';

module.exports = {

    // Supported specific format to handle negative schedule.
    // Any other format will not be recalculated if the diff with now is negative.
    formats: {
        minutes: 'mm',
        hours: 'HH',
        hoursMinutes: 'HH:mm',
        day: 'DD',
        dayHours: 'DD HH',
        dayHoursMinutes: 'DD HH:mm'
    },

    // Maximum value supported by timeout methods.
    x32Bit_NUMBER_LIMIT: 2147483647
};