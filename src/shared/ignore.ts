export function ignored(rawData) {
    let list = [];
    let lines = rawData.split('\n');
    lines.forEach(function(line) {
        line = line.trim();
        if(line.charAt(0) === '#' || line.length === 0) {
            // ignore comment and empty lines
        }
        else {
            list.push(line);
        }
    });
    return list;
}