function floatParse(state, value) {
    var TransitionTable = [
        [1, 1, 2] //0
        ,
        [4, 1, 2] //1
        ,
        [4, 3, 4] //2
        ,
        [4, 3, 4] //3
        ,
        [4, 4, 4] //4
    ];
    if (value == '+' || value == '-' && state == 0) {
        return TransitionTable[state][1];
    } else if (!isNaN(value)) {
        return TransitionTable[state][1];
    } else if (value == '.') {
        return TransitionTable[state][2];
    } else {
        return 4;
    }
}

function float() {
    var str;
    var cs = 0;
    var fs = 3;
    str = document.getElementById('float').value;
    console.log(str.length);
    for (var i = 0; i < str.length; i++) {
        cs = floatParse(cs, str[i]);
        console.log("cs: ", cs);
    }
    if (cs == fs) {
        document.getElementById('floatResult').innerHTML = 'valid';
    } else {
        document.getElementById('floatResult').innerHTML = 'invalid';
    }
}

function charParse(state, value) {
    var t = [
        [1, 4, 4], //0
        [4, 2, 2], //1
        [3, 4, 4], //2
        [4, 4, 4], //3
        [4, 4, 4] //4
    ];
    if (value === "'") { // for '
        return t[state][0];
    } else if (!isNaN(value) || value.match(/[a-z]/i) || value == '"' || value == '~' || value == '!' || value == '@' || value == '#' || value == '$' || value == '%' || value == '^' || value == '&' || value == '*' || value == '(' || value == ')' || value == '-' || value == '_' || value == '+' || value == '=' || value == '{' || value == '}' || value == '[' || value == ']' || value == '|' || value == ':' || value == ';' || value == ',' || value == '.' || value == '/' || value == '<' || value == '>' || value == '?' || value == ' ') {
        return t[state][1];
    } else if (value == '\n' || value == '\t' || value == '\r' || value == '\b' || value == '\\' || value == '\'' || value == '\"') {
        return t[state][2];
    } else {
        return 4;
    }
}

function checkescape(value) {
    if (value.includes('\\n') || value === '\\t' || value === '\\r' || value === '\\b' || value === "\\\\" || value === '\\\'' || value === '\\\"') {
        return true;
    } else {
        console.log('dsf')
        return false;
    }
}

function char() {
    var i = 0;
    var CS = 0;
    var FS = 3;
    var quoteflag = false;
    var escapeFlag = false;
    var str = document.getElementById('char').value;
    if (str[0] === "'" && str[str.length - 1] === "'") {
        escapeFlag = checkescape(str.slice(1, str.length - 1));
        quoteflag = true;
    }
    console.log(escapeFlag + '-' + quoteflag);
    if (!escapeFlag && quoteflag) {
        while (i < str.length) {
            CS = charParse(CS, str[i]);
            console.log(CS);
            i++;
        }
        if (CS == FS) {
            document.getElementById('charResult').innerHTML = 'valid';
        } else {
            document.getElementById('charResult').innerHTML = 'invalid';
        }
    } else {
        if (quoteflag) {
            document.getElementById('charResult').innerHTML = 'valid';
        } else {
            document.getElementById('charResult').innerHTML = 'invalid';
        }
    }
}
// function stringCheckEscape(value) {
//     var flag = true;
//     console.log(value);
//     for (var i = 0; i < value.length; i++) {
//         if (value === '\\' || value === '\'' || value === '\"') {
//             if (value[i - 1]) {
//                 if (value[i - 1] === '\\') {
//                     flag = true;
//                     console.log('yes')
//                 } else {
//                     flag = false;
//                     console.log('no')
//                 }
//             }
//         }
//     }
//     return flag;
// }
function stringParse(state, value, index, str) {
    console.log('value', value);
    t = [
        [1, 5, 5],
        [4, 3, 3],
        [3, 5, 3],
        [4, 1, 1],
        [5, 5, 5],
        [5, 5, 5]
    ];
    if (value === '"') {
        if (str[index - 1]) {
            if (str[index - 1] === '\\') {
                return t[state][2];
            } else {
                return t[state][0];
            }
        } else { // for "
            return t[state][0];
        }
    } else if (!isNaN(value) || value.match(/[a-z]/i) || value == '\'' || value == '~' || value == '!' || value == '@' || value == '#' || value == '$' || value == '%' || value == '^' || value == '&' || value == '*' || value == '(' || value == ')' || value == '-' || value == '_' || value == '+' || value == '=' || value == '{' || value == '}' || value == '[' || value == ']' || value == '|' || value == ':' || value == ';' || value == ',' || value == '.' || value == '/' || value == '<' || value == '>' || value == '?' || value == ' ') {
        return t[state][1];
    } else if (value == '\\"' || value == '\'') {
        return t[state][2];
    } else if (value == '\\') {
        if (str[index + 1]) {
            if (str[index + 1] === 'n' || str[index + 1] === 't' || str[index + 1] === 'r' || str[index + 1] === 'b' || str[index + 1] === '"' || str[index + 1] === "'") {
                return t[state][2];
            } else {
                return 5;
            }
        } else {
            return 5;
        }
    } else {
        return 4;
    }
}

function string() {
    var i = 0;
    var CS = 0
    var FS = 4;
    //String str="\"ashdjsah:asd><>?$#^%^@!\"";
    var str = document.getElementById('string').value;
    while (i < str.length) {
        CS = stringParse(CS, str.charAt(i), i, str);
        console.log(CS);
        i++;
    }
    if (CS == FS) {
        document.getElementById('stringResult').innerHTML = 'valid';
    } else {
        document.getElementById('stringResult').innerHTML = 'invalid';
    }
}

function integerParse(state, value) {
    // {digit,+-}
    var t = [
        [2, 1],
        [2, 3],
        [2, 3],
        [3, 3]
    ];
    if (!isNaN(value)) {
        return t[state][0];
    } else if (value == '+' || value == '-') {
        return t[state][1];
    } else {
        return 3
    };
}

function integer() {
    var i = 0;
    var CS = 0;
    var FS = 2;
    var str = document.getElementById('integer').value;
    while (i < str.length) {
        CS = integerParse(CS, str[i]);
        i++;
    }
    if (CS == FS) {
        document.getElementById('integerResult').innerHTML = 'valid';
    } else document.getElementById('integerResult').innerHTML = 'invalid';
}

function identifierParse(state, value) {
	console.log(value);
    var TransitionTable = [
        [1, 2, 2] //0
        ,
        [1, 1, 1] //1
        ,
        [2, 2, 2] //2
    ];
    if ((value >= 'a' && value <= 'z' || value >= 'A' && value <= 'Z')) {
        return TransitionTable[state][ 0];
    } else if (value == '_') {
        return TransitionTable[state][1];
    } else if (!isNaN(value)) {
        return TransitionTable[state][1];
    } else {
        return 2;
    }
}

function identifier() {
    var str;
    var cs = 0;
    var fs = 1;
    str = document.getElementById('identifier').value;
    for (var i = 0; i < str.length; i++) {
        cs = identifierParse(cs, str[i]);
        console.log(cs);
    }
    if (cs == fs) {
        document.getElementById('identifierResult').innerHTML = 'valid';
    } else {
        document.getElementById('identifierResult').innerHTML = 'invalid';
    }
}