var previous_code = "";
var LaxicalAnalyzer = (function () {
    //constructor;
    function LaxicalAnalyzer(code) {
        this.i = 0;
        this.j = 0; //index of this.code and this.temp.
        this.temp = [];
        this.tokenArray = new Array();
        this.lineno = 1;
        console.log("laxical analyzer initiated");
        this.code = code;
        this.codelength = this.code.length - 1;
    }
    LaxicalAnalyzer.prototype.generate = function () {
        console.log("processing started");
        for (; this.i <= this.codelength; this.i++) {
            this.temp[this.j] = this.code[this.i];
            console.log(this.temp.join(""));
            //for string 
            if (this.code[this.i] === '"') {
                if (this.j > 0) {
                    this.i--;
                    this.j--;
                    this.tokenArray.push(new tokens(this.temp.join(""), this.temp.join(""), this.lineno));
                    this.temp = [];
                    this.j = 0;
                }
                else {
                    var literal = this.stringliteral();
                    this.tokenArray.push(new tokens("", literal, this.lineno));
                    this.temp = [];
                    this.j = 0;
                }
            }
            else if (this.code[this.i] === '\'') {
                if (this.i < this.codelength)
                    this.temp[++this.j] = this.code[++this.i];
                if (this.code[this.i] === '\\' && this.i < this.codelength - 1) {
                    this.temp[++this.j] = this.code[++this.i];
                }
                if (this.i < this.codelength && this.code[this.i + 1] != '\n')
                    this.temp[++this.j] = this.code[++this.i];
                this.tokenArray.push(new tokens("", this.temp.join(""), this.lineno));
                this.temp = [];
                this.j = 0;
            }
            else if (this.isopertor(this.code[this.i])) {
                if (this.j > 0) {
                    this.i--;
                    this.j--;
                    this.temp.splice(-1, 1);
                    console.log('temp', this.temp);
                    this.tokenArray.push(new tokens("", this.temp.join(""), this.lineno));
                    this.temp = [];
                    this.j = 0;
                }
                else
                    this.addoperatortoken();
            }
            else if (this.code[this.i] === '.') {
                if (this.i < this.codelength - 1 && this.code[this.i + 1] >= '0' && this.code[this.i + 1] <= '9' && (this.temp[0] === '.' || (this.temp[0] >= '0' && this.temp[0] <= '9')) || ((this.i > 0) && (this.temp[this.i - 1] >= '0' && this.temp[this.i - 1] <= '9'))) {
                    this.temp[++this.j] = this.code[++this.i];
                    var floatConstant = this.readFloatConstant();
                    this.tokenArray.push(new tokens("", floatConstant, this.lineno));
                    this.temp = [];
                    this.j = 0;
                }
                else {
                    if (this.j > 0) {
                        this.i--;
                        this.j--;
                        this.tokenArray.push(new tokens("", this.temp.join(""), this.lineno));
                        this.temp = [];
                        this.j = 0;
                    }
                    else {
                        this.tokenArray.push(new tokens(this.temp.join(""), this.temp.join(""), this.lineno));
                        this.temp = [];
                        this.j = 0;
                    }
                }
            }
            else if (this.IsWordBreaker(this.code[this.i])) {
                if (this.j > 0) {
                    this.i--;
                    this.j--;
                    this.temp.splice(-1, 1);
                    this.tokenArray.push(new tokens("", this.temp.join(""), this.lineno));
                    this.temp = [];
                    this.j = 0;
                }
                else {
                    this.tokenArray.push(new tokens(this.temp.join(""), this.temp.join(""), this.lineno));
                    this.temp = [];
                    this.j = 0;
                }
            }
            else if (this.code[this.i] === '\n') {
                this.lineno++;
                if (this.j > 0) {
                    this.tokenArray.push(new tokens("", this.temp.join(""), this.lineno));
                    this.j = 0;
                }
            }
            else if (this.code[this.i] === ' ' || this.code[this.i] === '\t' || this.code[this.i] === '\r') {
                if (this.j != 0) {
                    this.temp.splice(-1, 1);
                    console.log('empty', this.temp);
                    this.tokenArray.push(new tokens("", this.temp.join(""), this.lineno));
                    this.temp = [];
                    this.j = 0;
                }
            }
            else if (this.code[this.i] === '#' && this.code[this.i + 1] === '##') {
                if (this.j > 0) {
                    this.tokenArray.push(new tokens("", this.temp.join(""), this.lineno));
                    this.temp = [];
                    this.j = 0;
                }
                //deal with the comment
                this.comments();
            }
            else {
                this.j++;
            }
        }
        if (this.j != 0) {
            this.tokenArray.push(new tokens("", this.temp.join(""), this.lineno));
            this.temp = [];
        }
        return this.tokenArray;
    };
    LaxicalAnalyzer.prototype.addoperatortoken = function () {
        var classname = null;
        if (this.i < this.codelength) {
            if ((this.code[this.i] === '+' && this.code[this.i + 1] === '+') || (this.code[this.i] === '-' && this.code[this.i + 1] === '-')) {
                classname = "INC_DEC";
                this.temp[++this.j] = this.code[++this.j];
            }
            else if ((this.code[this.i] === '&' && this.code[this.i + 1] === '&')) {
                classname = "AND";
                this.temp[++this.j] = this.code[++this.i];
            }
            else if ((this.code[this.i] === '|' && this.code[this.i + 1] === '|')) {
                classname = "OR";
                this.temp[++this.j] = this.code[++this.i];
            }
            else if ((this.code[this.i] === '%' || this.code[this.i] === '*' || this.code[this.i] === '/' || this.code[this.i] === '+' || this.code[this.i] === '-') && (this.code[this.i + 1] === '=')) {
                classname = "ASSIG_OP";
                this.temp[++this.j] = this.code[++this.i];
            }
            else if ((this.code[this.i] === '<' || this.code[this.i] === '>' || this.code[this.i] === '=' || this.code[this.i] === '!') && (this.code[this.i + 1] === '=')) {
                classname = "REL_OP";
                this.temp[++this.j] = this.code[++this.i];
            }
        }
        if (classname === null) {
            if (this.code[this.i] === '=') {
                classname = "EQUAL";
            }
            else if (this.code[this.i] === '+' || this.code[this.i] === '-') {
                classname = "ADD_SUB";
            }
            else if (this.code[this.i] === '*' || this.code[this.i] === '/') {
                classname = "MUL_DIV";
            }
            else if (this.code[this.i] === '>' || this.code[this.i] === '<') {
                classname = "REL_Opp";
            }
        }
        //this.temp.splice(1,-1);
        console.log('temp', this.temp);
        this.tokenArray.push(new tokens(classname, this.temp.join(""), this.lineno));
        this.temp = [];
    };
    LaxicalAnalyzer.prototype.isopertor = function (c) {
        return (c === '+' || c === '-' || c === '*' || c === '/' || c === '>' || c === '<' || c === '&' || c === '=' || c === '!');
    };
    LaxicalAnalyzer.prototype.IsWordBreaker = function (c) {
        return (c === '(' || c === ')' || c === '[' || c === ',' || c === ']' || c === '{' || c === '}' || c === ';' || c === ':');
    };
    LaxicalAnalyzer.prototype.readFloatConstant = function () {
        while (this.i <= this.codelength && !this.IsWordBreaker(this.code[this.i]) && !this.isopertor(this.code[this.i]) && this.code[this.i] != '"' && this.code[this.i] != '\'' && this.code[this.i] != '#' && this.code[this.i] != '.' && this.code[this.i] != '\r' && this.code[this.i] != '\n' && this.code[this.i] != ' ') {
            this.temp[this.j] = this.code[this.i];
            this.i++;
            this.j++;
        }
        this.i--;
        return this.temp.join("");
    };
    LaxicalAnalyzer.prototype.stringliteral = function () {
        if (this.i < this.codelength)
            this.temp[++this.j] = this.code[++this.i];
        while (this.temp[this.j] != '"' && this.i < this.codelength && this.temp[this.j] != '\n') {
            if (this.i < this.codelength)
                this.temp[++this.j] = this.code[++this.i];
            while (this.temp[this.j] != '"' && this.i < this.codelength && this.temp[this.j] != '\n') {
                if (this.i < this.codelength && this.temp[this.j] === '\\') {
                    while (this.i < this.codelength - 1 && this.temp[this.j] === '\\') {
                        {
                            this.temp[++this.j] = this.code[++this.i];
                            if (this.i < this.codelength)
                                this.temp[++this.j] = this.code[++this.i];
                        }
                    }
                }
                else if (this.i < this.codelength) {
                    this.i++;
                    this.j++;
                    this.temp[this.j] = this.code[this.i];
                }
                else if (this.temp[this.j] === '\n')
                    this.lineno++;
            }
        }
        if (this.temp[this.j] === '\n')
            this.i--;
        return this.temp.join("");
    };
    LaxicalAnalyzer.prototype.comments = function () {
        if (this.code[this.i] === '#' && this.code[this.i + 1] === '#') {
            this.i = this.i + 2;
        }
        while (this.code[this.i] != '#' && this.code[this.i + 1] != '#') {
            if (this.code[this.i] === '\n') {
                this.lineno++;
                break;
            }
            this.i++;
        }
        this.i = this.i + 2;
        this.j = 0;
    };
    return LaxicalAnalyzer;
})();
var tokens = (function () {
    function tokens(classname, value, lineno) {
        if (classname) {
            this.classname = classname;
        }
        else {
            this.classname = this.gettokenclass(value);
        }
        this.value = value;
        this.lineno = lineno;
    }
    tokens.prototype.gettokenclass = function (value) {
        var className = null;
        var keywords = ["only", "if", "else", "repeat", "line", "void", "in", "display", "or", "in", "switch", "model", "start"];
        var data_types = ["char", "float", "integer", "text"];
        if (value[0] === '"') {
            //token vlaue ===0;
            if (this.validiatebydfa(value, 0)) {
                className = "string constant";
            }
            else
                className = "error";
        }
        else if (value[0] === '\'') {
            if (this.validiatebydfa(value, 1)) {
                className = "'char constant";
            }
            else {
                className = "error";
            }
        }
        else if (value.indexOf(".") > 0) {
            if (this.validiatebydfa(value, 3)) {
                className = "FLOAT_CONST";
            }
            else {
                className = "ERORR";
            }
        }
        else if (value[0] >= '0' && value[0] <= '9') {
            if (this.validiatebydfa(value, 4)) {
                className = "INTEGER_CONST";
            }
            else {
                className = "ERORR";
            }
        }
        else {
            for (var _i = 0; _i < keywords.length; _i++) {
                var x = keywords[_i];
                if (value == x) {
                    className = value.toUpperCase();
                }
            }
            if (className === null) {
                for (var _a = 0; _a < data_types.length; _a++) {
                    var x = data_types[_a];
                    if (value == x) {
                        console.log('value');
                        className = "DATA_TYPE";
                    }
                }
            }
            if (className === null)
                if (value[0] >= 'a' && value[0] <= 'z' || value[0] >= 'A' && value[0] <= 'Z') {
                    if (this.validiatebydfa(value, 2)) {
                        className = "initilizer";
                    }
                    else
                        className = "Error";
                }
        }
        return className;
    };
    tokens.prototype.validiatebydfa = function (input, condition) {
        var currentstate = 0;
        var finalstate = 1;
        var ii = 0;
        var c = input.split('');
        switch (condition) {
            case 0:
                finalstate = 3;
                while (ii != c.length) {
                    currentstate = this.transitionstringconstant(currentstate, c[ii]);
                    ii++;
                }
                break;
            case 1:
                finalstate = 3;
                while (ii != c.length) {
                    currentstate = this.TransitionOfCharacterConstant(currentstate, c[ii]);
                    ii++;
                }
                break;
            case 2:
                finalstate = 1;
                while (ii != c.length) {
                    currentstate = this.tranistion_initilizer(currentstate, c[ii]);
                    ii++;
                }
                break;
            case 3:
                finalstate = 2;
                while (ii != c.length) {
                    currentstate = this.TransitionOffloatConstant(currentstate, c[ii]);
                    ii++;
                }
                break;
            case 4:
                while (ii != c.length) {
                    currentstate = this.TransitionOfIntegerConstant(currentstate, c[ii]);
                    ii++;
                }
                break;
            default:
                break;
        }
        return (currentstate == finalstate);
    };
    tokens.prototype.transitionstringconstant = function (state, character) {
        var TransitionTable = [[1, 4, 4],
            [3, 4, 2],
            [3, 4, 2],
            [4, 4, 4],
            [4, 4, 4] //4
        ];
        if (character === '"') {
            return TransitionTable[state][0];
        }
        else if ((character >= ' ' && character <= '~' && character != '\\' && character != '\"') || character === ' ')
            return TransitionTable[state][2];
        else
            return TransitionTable[state][1];
    };
    tokens.prototype.TransitionOfCharacterConstant = function (state, character) {
        var TransitionTable = [[1, 5, 5, 5],
            [5, 2, 4, 2],
            [3, 5, 5, 5],
            [5, 5, 5, 5],
            [2, 5, 2, 2],
            [5, 5, 5, 5]];
        if (character === '\'') {
            return TransitionTable[state][0];
        }
        else if (character === 't' || character === 'n' || character === 'b' || character === '"' || character === 'r' || character === 'v' || character === '0') {
            return TransitionTable[state][3];
        }
        else if ((character >= ' ' && character <= '~' && character != '\\' && character != '\'')) {
            return TransitionTable[state][1];
        }
        else if (character === '\\') {
            return TransitionTable[state][2];
        }
        else
            return 5;
    };
    tokens.prototype.tranistion_initilizer = function (state, character) {
        var TransitionTable = [
            [1, 2, 2] //0
            ,
            [1, 1, 1] //1
            ,
            [2, 2, 2] //2
        ];
        if ((character >= 'a' && character <= 'z' || character >= 'A' && character <= 'Z')) {
            return TransitionTable[state][0];
        }
        else if (character === '_') {
            return TransitionTable[state][1];
        }
        else if (!isNaN(character)) {
            return TransitionTable[state][1];
        }
        else {
            return 2;
        }
    };
    tokens.prototype.TransitionOffloatConstant = function (state, character) {
        var TransitionTable = [[0, 1],
            [2, 3],
            [2, 3],
            [3, 3]];
        if (character === '.') {
            return TransitionTable[state][1];
        }
        else if ((character >= '0' && character <= '9')) {
            return TransitionTable[state][0];
        }
        else {
            return 3;
        }
    };
    tokens.prototype.TransitionOfIntegerConstant = function (state, character) {
        var TransitionTable = [[1, 2],
            [1, 3],
            [1, 3],
            [3, 3]];
        if (character === '+' || character === '-') {
            return TransitionTable[state][1];
        }
        else if ((character >= '0' && character <= '9')) {
            return TransitionTable[state][0];
        }
        else {
            return 3;
        }
    };
    //print work
    tokens.prototype.getToken = function () {
        return "( " + this.classname + " , " + this.value + " , " + this.lineno + " )";
    };
    tokens.prototype.getClass = function () {
        return this.classname;
    };
    tokens.prototype.getLineNo = function () {
        return this.lineno;
    };
    return tokens;
})();
function Main() {
    var tokenarray;
    var text = document.getElementById("code").value;
    console.log(text.length);
    var la = new LaxicalAnalyzer(text);
    tokenarray = la.generate();
    console.log('processing...', tokenarray);
    var size = tokenarray.length;
    var temp = null;
    for (var i = 0; i < size; i++) {
        // tokenarray[i].getLineNo();
        // tokenarray[i].getClass();
        // tokenarray[i].getToken();
        var token = tokenarray[i].getToken().slice(1, -1).split(",");
        temp += tokenarray[i].getToken() + "\t \n";
        var table = document.getElementById("table");
        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        td1.innerHTML = token[0];
        var td2 = document.createElement("td");
        td2.innerHTML = token[1];
        var td3 = document.createElement("td");
        td3.innerHTML = token[2];
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        table.appendChild(tr);
    }
}
function refresh() {
    var table = document.getElementById("table");
    while (table.hasChildNodes()) {
        table.removeChild(table.lastChild);
    }
    previous_code = document.getElementById("code").value;
    document.getElementById("code").value = "";
}
function previous() {
    document.getElementById("code").value = previous_code;
    Main();
}
