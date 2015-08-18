#!/usr/bin/node

bconsole = require('better-console');
sprintf = require('sprintf-js').sprintf;

var interest = 0.01;
var duration = 30;
var debt     = 300000;
var ballpark_tax_return = 0.30
var investment_interest = 0.02;

bconsole.warn("Interest: " + interest);
bconsole.warn("Duration: " + duration);
bconsole.warn("Debt:     " + debt);
bconsole.log();

var repay = new Array;
for (var i = 1; i <= duration; i++) {
    if (i >= 1 && i <= 5) {
        repay.push(20000);
    } else {
        repay.push(5000);
    }
}


bconsole.error("Annual mortgage calculations with and without extra repayments");
bconsole.log();

var ret = annualRepay(debt, duration, interest, repay, ballpark_tax_return);

bconsole.log('With replayments');
bconsole.log('Total: ' + sprintf('%.2f', ret[1]));
bconsole.log('Total with tax return: ' + sprintf('%.2f', ret[2]));
bconsole.log();

var invest_repay = 0;
for (var i = 1; i <= ret[3]; i++) {
    invest_repay += repay[i-1] + invest_repay * investment_interest;
}



repay = zeroRepay(duration);
var ret_no = annualRepay(debt, duration, interest, repay, ballpark_tax_return);

bconsole.log('Without repayments');
bconsole.log('Total: ' + sprintf('%.2f', ret_no[1]));
bconsole.log('Total with tax return: ' + sprintf('%.2f', ret_no[2]));
bconsole.log();

var invest_difference = 0;
for (var i = 1; i <= ret[3]; i++) {
    invest_difference += (ret_no[0][i-1]['monthly pay'] - ret[0][i-1]['monthly pay'])*12 + invest_difference * investment_interest;
}

var save = ret_no[2] - ret[2];
bconsole.log('You save: ' + sprintf('%.2f', save));
bconsole.log('If you invest repayments, you can get: ' + sprintf('%.2f', invest_repay));
bconsole.log('If you invest monthly payment difference, you can get: ' + sprintf('%.2f', invest_difference));

bconsole.log('Overall: ' + sprintf('%.2f', save + invest_difference) + ' vs ' + sprintf('%.2f', invest_repay));


function zeroRepay(duration) {
    var repay = new Array;
    for (var i = 1; i <= duration; i++) {
        repay.push(0);
    }

    return repay;
}

function annualRepay(debt, duration, interest, repay, ballpark_tax_return) {

    var stats = new Array();
    var total = 0;
    var total_minus_tax_break = 0;
    var end_year = 0;

    for (var i = 1; i <= duration; i++) {
        if (debt < 0) {
            if (end_year == 0) {
                end_year = i - 1;
            }
            continue;
        }

        var annuity = interest * debt / (1 - Math.pow(1 + interest, -duration + i - 1));
        var monthly = annuity / 12;
        total += annuity + repay[i-1];

        var debt_initial = debt;
        debt = (1 + interest) * debt - annuity;
        var interest_per_year = annuity - (debt_initial - debt);
        total_minus_tax_break += annuity - (interest_per_year * ballpark_tax_return) + repay[i-1];

        debt = debt - repay[i-1];

        var year_stats = new Object();
        year_stats['year'] = i;
        year_stats['debt start'] = sprintf('%.2f', debt_initial);
        year_stats['debt end'] = sprintf('%.2f', debt);
        year_stats['monthly pay'] = sprintf('%.2f', monthly);
        year_stats['extra repayments'] = repay[i-1];
        year_stats['tax return'] = sprintf('%.2f', interest_per_year / 12 * ballpark_tax_return);

        stats.push(year_stats);
    }

    return [stats, total, total_minus_tax_break, end_year];
}
