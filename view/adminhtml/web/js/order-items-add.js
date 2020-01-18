define([
    'jquery',
    'selectize'
], function ($) {
    'use strict';

    let config = {
        orderItemAddSelector: '.js-order-item-add',
        itemSelectorClass: 'js-order-item-selector',
        itemSelectorPlaceholder: 'Add by SKU or Name'
    };

    let orderItemsAdd = {
        itemsToAddToOrder: [],
        init: function(productData){
            let $itemAddTable = this.createItemAddTable(productData);
            $(config.orderItemAddSelector).append($itemAddTable);
            return this;
        },
        createItemAddTable: function(productData){
            let $table = $('<table class="data-table admin__table-primary order-tables order-item-add-table"></table>');

            let $row = this.createItemAddRow(productData);
            $table.append($row);

            return $table;
        },
        createItemAddRow: function(productData){
            let $row = $('<tr class="order-item-add-row"></tr>');
            let $itemSelectorWrap = this.createItemSelectorWrap(productData);
            $row.append($itemSelectorWrap);

            let $itemQuantityWrap = this.createItemQuantity();
            $row.append($itemQuantityWrap);

            return $row;
        },
        createItemSelectorWrap: function(productData){
            let $searchElement = $('<select class="' + config.itemSelectorClass + ' order-item-selector"></select>');
            let $searchElementWrap = $('<td class="order-item-select-wrap"></td>');
            $searchElementWrap.append($searchElement);
            this.initializeItemSelectorElement($searchElement, productData);
            return $searchElementWrap;
        },
        initializeItemSelectorElement: function ($searchElement, productData) {
            $searchElement.selectize({
                searchField: ['sku', 'name'],
                selectOnTab: true,
                options: productData,
                placeholder: config.itemSelectorPlaceholder,
                valueField: 'id',
                render: {
                    item: this.buildProductSearchItem,
                    option: this.buildProductSearchItem
                },
                maxItems: 1,
                closeAfterSelect: true
            });
            return this;
        },
        buildProductSearchItem: function(item, escape){
            return '<div>' +
                (item.sku ? '<span class="sku">' + escape(item.sku) + ':</span> ' : '') +
                (item.name ? '<span class="name">' + escape(item.name) + '</span>' : '') +
                '</div>';
        },
        createItemQuantity: function(){
            let $itemQuantityWrap = $('<td class="order-item-quantity-wrap"></td>');
            let $itemQuantityElement = $('<input type="number" value="1" class="admin__control-text" />');
            $itemQuantityElement.change(this.onQuantityChange);
            $itemQuantityWrap.append($itemQuantityElement);
            return $itemQuantityWrap;
        },
        onQuantityChange: function(){
            console.log('changed quantity');
            return this;
        },
        fixTabIndexes: function(){
            $(':input:visible').each(function (i) {
                $(this).attr('tabindex', i + 1);
            });
        }
    };

    return orderItemsAdd;
});