"use strict";
Date.fromUsDateString = function (string) {
    let parts = string.split('/');
    let date = new Date();
    date.setDate(parseInt(parts[1]));
    date.setMonth(parseInt(parts[0]) - 1);
    date.setFullYear(parseInt(parts[2]));
    date.setMinutes(0);
    date.setSeconds(0);
    date.setHours(0);
    date.setMilliseconds(0);
    return date;
};
Date.fromUsDateTimeString = function (string) {
    let parts = string.split(' ');
    let date_parts = parts[0].split('/');
    let time_parts = parts[1].split('/');
    let date = new Date();
    date.setDate(parseInt(date_parts[1]));
    date.setMonth(parseInt(date_parts[0]) - 1);
    date.setFullYear(parseInt(date_parts[2]));
    date.setHours(parseInt(time_parts[0]));
    date.setMinutes(parseInt(time_parts[1]));
    date.setSeconds(parseInt(time_parts[2]));
    return date;
};
Date.fromDateTimeString = function (string) {
    //created_at: "2019-05-02 12:13:47"
    let parts = string.split(' ');
    let date_parts = parts[0].split('-');
    let time_parts = parts[1].split(':');
    let date = new Date();
    date.setDate(parseInt(date_parts[2]));
    date.setMonth(parseInt(date_parts[1]) - 1);
    date.setFullYear(parseInt(date_parts[0]));
    date.setHours(parseInt(time_parts[0]));
    date.setMinutes(parseInt(time_parts[1]));
    date.setSeconds(parseInt(time_parts[2]));
    return date;
};
Date.prototype.toUsDateTimeString = function () {
    return [(this.getMonth() + 1).toString().padStart(2, '0'), this.getDate().toString().padStart(2, '0'), this.getFullYear()].join('/')
        + ' '
        + [this.getHours().toString().padStart(2, '0'), this.getMinutes().toString().padStart(2, '0'), this.getSeconds().toString().padStart(2, '0')].join(':');
};
Date.prototype.toUsDateString = function () {
    return [(this.getMonth() + 1).toString().padStart(2, '0'), this.getDate().toString().padStart(2, '0'), this.getFullYear()].join('/');
};
Date.prototype.toDateString = function () {
    return [this.getFullYear(), (this.getMonth() + 1).toString().padStart(2, '0'), this.getDate().toString().padStart(2, '0')].join('-');
};
