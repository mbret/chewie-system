// https://github.com/adaltas/node-pad
export default function stringPad(text, length, options: any = {}) {
    var escapecolor, invert, pad, padlength, ref;
    if (options == null) {
        options = {};
    }
    invert = typeof text === 'number';
    if (invert) {
        ref = [text, length], length = ref[0], text = ref[1];
    }
    if (typeof options === 'string') {
        options = {
            char: options
        };
    }
    if (options.char == null) {
        options.char = ' ';
    }
    if (options.strip == null) {
        options.strip = false;
    }
    text = text.toString();
    pad = '';
    if (options.colors) {
        escapecolor = /\x1B\[(?:[0-9]{1,2}(?:;[0-9]{1,2})?)?[m|K]/g;
        length += text.length - text.replace(escapecolor, '').length;
    }
    padlength = length - text.length;
    if (padlength < 0) {
        if (options.strip) {
            if (invert) {
                return text.substr(length * -1);
            } else {
                return text.substr(0, length);
            }
        }
        return text;
    }
    pad += options.char.repeat(padlength);
    if (invert) {
        return pad + text;
    } else {
        return text + pad;
    }
};