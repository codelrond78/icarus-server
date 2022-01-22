async function logLine(type, text, db){
    await db.post({
        type,
        text,
        timestamp: JSON.stringify(new Date())
    });
}

async function logInputLine(line, db){
    await logLine('input', line, db);
}

async function logOutputLine(line, db){
    await logLine('output', line, db);
}

module.exports = {
    logInputLine,
    logOutputLine
}