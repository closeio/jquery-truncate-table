define([
    'jquery',
],
    
function($) {
    /*
     * TruncateTable is a jQuery plugin to collapse/hide/truncate rows in
     * a table beyond a specific limit. Those rows can be shown by clicking
     * a special 'X rows hidden' row that appears at the bottom.
     *
     * Usage:
     *     $('table').truncateTable({ limit: 5 });
     */

    var TruncateTable = function(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, $.fn.truncateTable.defaults, options);

        this.collapse();
    };

    var pluginName = 'truncateTable';
    var HIDDEN_ROW_CLASS = pluginName+'-hidden';
    var EXPAND_ROW_CLASS = pluginName+'-expand';

    TruncateTable.prototype = {
        unhideRows: function(rows) {
            rows.each(function() {
                var row = $(this);
                if (row.hasClass(HIDDEN_ROW_CLASS)) {
                    row.removeClass(HIDDEN_ROW_CLASS).show();
                }
            });
        },
        orderChanged: function() {
            // call this function (externally) if the order of the tbody rows
            // changed. we re-collapse the table if it was already collapsed.
            if (this.$specialRow) this.collapse();
        },
        collapse: function() {
            var tbody = this.$tbody = this.$element.find('tbody'),
                rows = tbody.find('tr');
            this.unhideRows(rows);
            if (rows.length > this.options.limit) {
                var rowsToHide = rows.slice(this.options.limit - 1);
                rowsToHide.addClass(HIDDEN_ROW_CLASS).hide();

                var colSpan = 0;
                rowsToHide.first().children().each(function() {
                    colSpan += parseInt($(this).attr('colspan'), 10) || 1;
                });
                var tfoot = this.$element.find('tfoot');
                if (!tfoot.length) {
                    tfoot = $('<tfoot>');
                    this.$element.append(tfoot);
                }
                if (!this.$specialRow) {
                    var btnHtml = this.options.getExpandHtml(rowsToHide);
                    this.$specialRow = $('<tr class="'+EXPAND_ROW_CLASS+'"><td colspan="'+colSpan+'">'+btnHtml+'</td></tr>');
                    tfoot.append(this.$specialRow);
                }
            }
        },
       
        expand: function() {
            if (this.$specialRow) {
                this.$specialRow.remove();
                this.$specialRow = null;
                this.$tbody.find('.'+HIDDEN_ROW_CLASS).show();
            }
        }
    };

    $(document).on('click', '.'+EXPAND_ROW_CLASS, function(ev) {
        var row = $(ev.currentTarget),
            table = row.closest('table'),
            instance = table.data(pluginName);
        instance.expand();
    });

    $.fn.truncateTable = function(option) {
        var args = [].splice.call(arguments, 1);

        return this.each(function () {
            var $this = $(this),
                data = $this.data(pluginName),
                options = typeof option === 'object' && option;

            if (!data) {
                $this.data(pluginName, (data = new TruncateTable(this, options)));
            } else if (typeof option === 'string') {
                data[option].apply(data, args);
            }
        });
    };

    $.fn.truncateTable.defaults = {
        limit: 10,
        getExpandHtml: function(hiddenRows) {
            return hiddenRows.length + ' more hidden&hellip;';
        }
    };

});
