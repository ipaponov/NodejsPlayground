#!/usr/bin/node

bconsole = require('better-console');
sprintf = require('sprintf-js').sprintf;

var interest = 0.1;
var duration = 30;
var debt     = 300000;

bconsole.warn("Interest: " + interest);
bconsole.warn("Duration: " + duration);
bconsole.warn("Debt:     " + debt);
bconsole.log();

annual(debt, duration, interest);

var repay = new Array;
for (var i = 1; i <= duration; i++) {
    if (i >= 1 && i <= 5) {
        repay.push('20000');
    } else {
        repay.push('5000');
    }
}
annualRepay(debt, duration, interest, repay);



function annual(debt, duration, interest) {
    var annuity = interest * debt / (1 - Math.pow(1 + interest, -duration));
    var monthly = annuity / 12;
    var total_interest = annuity * duration - debt;
    var tax_return = total_interest * 0.32;

    bconsole.error("Annual mortgage calculation");
    bconsole.log('Monthly pay: ' + sprintf("%.2f", monthly));
    bconsole.log();

    var stats = new Array();
    for (var i = 1; i <= duration; i++) {
        var year_stats = new Object();

        var debt0 = debt;
        debt = (1 + interest) * debt - annuity;
        var yearly_interest = annuity - (debt0 - debt);

        year_stats['year'] = i;
        year_stats['debt'] = sprintf('%.2f', debt);
        year_stats['interest per year'] = sprintf('%.2f', yearly_interest);
        stats.push(year_stats);
    }

    bconsole.table(stats);
    bconsole.log();
}


function annualRepay(debt, duration, interest, repay) {
    bconsole.error("Annual mortgage calculation with extra repayments");
    bconsole.log();

    var stats = new Array();
    for (var i = 1; i <= duration; i++) {
        if (debt < 0) {
            continue;
        }

        var annuity = interest * debt / (1 - Math.pow(1 + interest, -duration + i - 1));
        var monthly = annuity / 12;
        debt = (1 + interest) * debt - annuity;
        debt = debt - repay[i-1];

        var year_stats = new Object();
        year_stats['year'] = i;
        year_stats['debt'] = sprintf('%.2f', debt);
        year_stats['monthly pay'] = sprintf('%.2f', monthly);
        year_stats['extra repayments'] = repay[i-1];

        stats.push(year_stats);
    }

    bconsole.table(stats);
    bconsole.log();
}
