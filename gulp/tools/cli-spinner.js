const readline = require('readline');
const Spinner = function (text = '%s') {
    if ('string' == typeof text) {
        text = { text };
    }
    this._text = text.text || '';
    this._list = text.spinners || function (
        spin = (t) => ['|', '/', '-', '\\'][t % 4], list = []
    ) {
        for (let n = 0; n < 19; n++) list.push(
            `[[37m${"█".repeat(n)}[30m${".".repeat(18 - n)}[37m] ${spin(n)}`
        );
        for (let n = 19; n < 36; n++) list.push(
            `[[30m${".".repeat(n - 18)}[37m${"█".repeat(36 - n)}] ${spin(n)}`
        );
        return list;
    }();
    this._second = text.delay || 60;
    this._output = text.stream || process.stdout;
    this.onTick = text.onTick || function (t) {
        this.clear(this._output);
        this._output.write(t);
    };
};
Spinner.prototype.start = function (index = 0) {
    this._id = setInterval(() => {
        this.onTick(this._text.indexOf('%s') > -1
            ? this._text.replace('%s', this._list[index])
            : this._list[index] + ' ' + this._text);
        index = ++index % this._list.length;
    }, this._second);
};
Spinner.prototype.stop = function (clear) {
    clearInterval(this._id);
    this._id = undefined;
    clear && this.clear();
};
Spinner.prototype.clear = function () {
    readline.clearLine(this._output, 0);
    readline.cursorTo(this._output, 0);
};
module.exports = Spinner;
