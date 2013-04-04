/**
 * jQuery.autoExpandingList
 *
 * @projectDescription Auto expand a list of inputs as needed
 * @author Ryan Graham
 * @demo http://jsbin.com/ecisa/18
 * @js http://jsbin.com/ecisa/18/js
 * @id jQuery.autoExpandingList
 * @return {jQuery}
 * @example $("ul.expandingList").autoExpandingList();
 *
 * Notes:
 * Given a <ul>, make sure there is always an <li> with blank input fields at the end.
 * .autoExpandingList() can be given an optional settings object:
 *     max: a maximum number of items (defaults to false for no maximum)
 *     min: a minimum number of items to expand the list to (default 2)
 *     minBlank: minimum number of blank rows to keep around at all times
 *     maxBlank: maximum number of blank rows to keep around at all times, and collapse down to if exceeded
 *
 */
(function ($) {
    "use strict";
    $.fn.autoExpandingList = $.fn.autoExpandingList || (function ($) {

        var defaults = {
            max: false,
            min: 2,
            minBlank: 1,
            maxBlank: false
        };

        // Compare the values of two input fields, a and b are expected to be jQuery objects wrapping input elements
        var equalInputs = function (a, b) {
            var inputType = a.attr("type");
            if (inputType !== b.attr("type")) {
                return false;
            }
            if (inputType === "checkbox") {
                return a.attr("checked") === b.attr("checked");
            } else {
                return a.val() === b.val();
            }
        };

        // Keep track of which element has cursor focus so we don't delete it
        var currentFocus;
        $("a, input").on("focus", function () {
            currentFocus = this;
        });

        return function (settings) {

            // Settings are cached per selector/invocation, not per affected element
            settings = $.extend({}, defaults, settings);

            this.each(function () {
                var that = this,
                    blank = $("li", this).first().clone(),
                // we assume the first row is the prototype for a "blank" row
                inputs = blank.find("input");

                var shrinkList = function (removeCount) {
                    var rows = $("li", that);
                    rows.filter(function () {
                        var isRowBlank = (removeCount > 0);
                        $("input", this).each(function (i) {
                            isRowBlank = isRowBlank && this !== currentFocus && equalInputs($(this), inputs.eq(i));
                        });
                        if (isRowBlank) {
                            removeCount -= 1;
                        }
                        return isRowBlank;
                    }).remove();
                };

                var growList = function (addCount) {
                    var list = $(that);
                    while (addCount > 0) {
                        list.append(blank.clone());
                        addCount -= 1;
                    }
                };

                var checkAndExpand = function () {
                    var list = $(that);
                    var rows = $("li", list);
                    var blankRowCount = 0;
                    var rowAdjustment = 0;

                    // Short path intended to pad the list out to the requested minimum size
                    if (rows.length < settings.min) {
                        list.append(blank.clone());
                        return;
                    }

                    rows.each(function () {
                        var isRowBlank = true;
                        $("input", this).each(function (i) {
                            isRowBlank = isRowBlank && equalInputs($(this), inputs.eq(i));
                        });
                        if (isRowBlank) {
                            blankRowCount += 1;
                        }
                    });

                    if (settings.maxBlank && blankRowCount + rowAdjustment > settings.maxBlank) {
                        rowAdjustment = settings.maxBlank - blankRowCount;
                    }
                    if (settings.minBlank && blankRowCount + rowAdjustment < settings.minBlank) {
                        rowAdjustment = settings.minBlank - blankRowCount;
                    }
                    if (settings.min && rows.length + rowAdjustment < settings.min) {
                        rowAdjustment = settings.min - rows.length;
                    }
                    if (settings.max && rows.length + rowAdjustment > settings.max) {
                        rowAdjustment = settings.max - (rows.length + rowAdjustment);
                    }
                    if (rowAdjustment > 0) {
                        growList(rowAdjustment);
                    } else if (rowAdjustment < 0) {
                        shrinkList(-rowAdjustment);
                    }
                };

                $(this).on("change focus blur keydown keyup", "input", checkAndExpand).each(checkAndExpand);
            });

            return this;
        };
    }($));
}(jQuery));
