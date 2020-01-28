define([
    'jquery',
    'order-item-reload-helper',
    'Magento_Sales/order/create/scripts',
], function ($, itemsReloadHelper) {
    'use strict';

    let config = {
        actionDropdownSelector: '#order-items_grid .col-actions select',
        deleteVal: 'remove',
        moveToCartVal: 'cart',
        undoVal: '',
        inputsThatCauseRowUpdateSelector: 'input, #order-items_grid select',
        updatedClass: 'updated',
    };

    let orderItemActions = {
        init: function () {
            this.initializeRowActionsForDropdowns()
                .initializeRowUpdateEvents();

            itemsReloadHelper.onReload('itemActionsInit', function(){
                this.init();
            }.bind(this));


            return this;
        },

        initializeRowActionsForDropdowns: function(){
            $(config.actionDropdownSelector)
                .each(this.setupActionsForDropdown.bind(this))
                .hide();

            return this;
        },

        setupActionsForDropdown: function (index, element) {
            let $dropdown = $(element);

            let $undoButton = this.createUndoButton();
            $undoButton.click(this.createEventData($dropdown, config.undoVal), this.onActionClick.bind(this));
            //$undoButton.hide();
            $dropdown.after($undoButton);

            let $cartButton = this.createCartButton();
            $cartButton.click(this.createEventData($dropdown, config.moveToCartVal), this.onActionClick.bind(this));
            $dropdown.after($cartButton);

            let $deleteButton = this.createDeleteButton();
            $deleteButton.click(this.createEventData($dropdown, config.deleteVal), this.onActionClick.bind(this));
            $dropdown.after($deleteButton);

        },

        createDeleteButton: function(){
            return $('<button type="button" title="Remove" class="action icon icon-remove"><span>Remove</span></button>');
        },

        createCartButton: function(){
            return $('<button type="button" title="Move to cart" class="action icon icon-cart"><span>Move to cart</span></button>');
        },

        createUndoButton: function(){
            return $('<button type="button" title="Undo" class="action undo"><span>Undo</span></button>');
        },

        createEventData: function($dropdown, dropdownValue) {
            return {
                dropdown: $dropdown,
                dropdownValue: dropdownValue,
            };
        },

        onActionClick: function(event){
            let $dropdown = event.data.dropdown;
            let $clickValue = event.data.dropdownValue;

            $dropdown.val($clickValue);

            let $row = $dropdown.closest('tr');
            this.setRowClass($row, event.data.dropdownValue);

            return this;
        },

        setRowClass: function($row, rowClass){
            $row.removeClass(config.deleteVal)
                .removeClass(config.moveToCartVal)
                .removeClass(config.updatedClass);

            if(rowClass){
                $row.addClass(rowClass);
            }

            return this;
        },

        initializeRowUpdateEvents: function(){
            let $rows = $(config.actionDropdownSelector)
                .closest('tr')
                .each(this.setupChangeEventsForRow.bind(this));

            return this;
        },

        setupChangeEventsForRow: function(index, element) {
            let $row = $(element)
            let updateEventData = {
                row: $row
            };

            $row.find(config.inputsThatCauseRowUpdateSelector)
                .change(updateEventData, this.onRowUpdate.bind(this));
        },

        onRowUpdate: function(event){
            let $row = event.data.row;
            this.setRowClass($row, config.updatedClass);
        },

    }

    return orderItemActions;
});