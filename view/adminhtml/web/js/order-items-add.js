define([
    'jquery',
    'selectize'
], function ($) {
    'use strict';

    let config = {
        orderItemAddSelector: '.js-order-item-add',
        itemSelectorClass: 'js-order-item-selector',
        itemTableClass: 'js-order-item-add-table',
        itemSelectorPlaceholder: 'Add by SKU or Name',
        rowClass: 'js-order-item-row',
        quantityClass: 'js-order-item-quantity',
        priceClass: 'js-order-item-price',
        rowActionsClass: 'js-order-item-row-actions'
    };

    let orderItemsAdd = {
        itemsToAddToOrder: [],
        productData: [],
        init: function(productData){
            this.productData = productData;

            let $orderItemsAddElement = $(config.orderItemAddSelector);
            let $itemAddTable = this.createItemAddTable();
            $orderItemsAddElement.append($itemAddTable);

            let $saveButton = this.createSaveButton();
            $orderItemsAddElement.append($saveButton);

            return this;
        },
        createItemAddTable: function(){
            let $table = $('<table class="data-table admin__table-primary order-tables order-item-add-table ' + config.itemTableClass + '"></table>');

            let $row = this.createItemAddRow();
            $table.append($row);

            return $table;
        },
        createSaveButton: function(){
            let $saveButton = $('<button class="action-secondary action-add">Save Items to Order</button>');
            $saveButton.click(this.onSaveItemsToOrder.bind(this));
            return $saveButton;
        },
        createItemAddRow: function(){
            let $row = $('<tr class="' + config.rowClass + '"></tr>');
            let $itemSelectorWrap = this.createItemSelectorWrap();
            $row.append($itemSelectorWrap);

            let $itemQuantityWrap = this.createItemQuantity();
            $row.append($itemQuantityWrap);

            let $priceWrap = this.createItemPriceWrap();
            $row.append($priceWrap);

            let $rowActions = this.createRowActions();
            $row.append($rowActions);

            return $row;
        },
        createItemSelectorWrap: function(){
            let $searchElement = $('<select class="' + config.itemSelectorClass + ' order-item-selector"></select>');
            let $searchElementWrap = $('<td class="order-item-select-wrap"></td>');
            $searchElementWrap.append($searchElement);
            this.initializeItemSelectorElement($searchElement);
            return $searchElementWrap;
        },
        initializeItemSelectorElement: function ($searchElement) {
            $searchElement.selectize({
                searchField: ['sku', 'name'],
                selectOnTab: false,
                options: this.productData,
                placeholder: config.itemSelectorPlaceholder,
                allowEmptyOption: true,
                valueField: 'id',
                render: {
                    item: this.buildProductSearchItem,
                    option: this.buildProductSearchItem
                },
                maxItems: 1,
                closeAfterSelect: true,
                copyClassesToDropdown: false
            });
            $searchElement.change(function(event){
                this.onItemSelectorChange(event);
            }.bind(this));
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
            let $itemQuantityElement = $('<input type="number" min="1" value="1" class="admin__control-text ' + config.quantityClass +'" />');
            $itemQuantityElement.change(this.onQuantityChange);
            $itemQuantityWrap.append($itemQuantityElement);
            return $itemQuantityWrap;
        },
        createItemPriceWrap: function(){
            let $priceWrap = $('<td class="order-item-price-wrap"></td>');
            let $price = $('<span class="' + config.priceClass + '"></span>');
            $priceWrap.append($price);
            return $priceWrap;
        },
        createRowActions: function(){
            return $('<td class="order-item-row-actions ' + config.rowActionsClass + '"></td>');
        },
        onQuantityChange: function(){
            return this;
        },
        onItemSelectorChange: function(event){
            let $selectorElement = $(event.target);
            let $parentRow = $selectorElement.closest('.' + config.rowClass);
            this.setRowPrice($parentRow, $selectorElement.val());
            this.createDeleteLinkForRow($parentRow);
            this.maintainLastRow();
        },
        setRowPrice: function($row, productId){
            let $priceElement = $row.find('.' + config.priceClass);
            if(!productId){
                $priceElement.empty();
                return;
            }
            let price = this.getPriceById(productId);
            let formattedPrice = this.formatPriceForDisplay(price);
            $priceElement.text(formattedPrice);
        },
        getPriceById: function(productId){
            let product =  this.productData.find(function(item){
                return item.id === productId;
            });
            return product['price'];
        },
        formatPriceForDisplay: function(price){
            let formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            });

            return formatter.format(price);
        },
        // Ensure that there is an empty last row
        maintainLastRow: function(){
            let $lastItemSelector = $(config.orderItemAddSelector + ' select.' + config.itemSelectorClass).last();
            if(!$lastItemSelector.val()){
                return this;
            }

            let $newRow = this.createItemAddRow();
            $('.' + config.itemTableClass).append($newRow);

            return this;
        },
        createDeleteLinkForRow: function($row){
            let $rowActions = $row.find('.' + config.rowActionsClass);
            let $deleteButton = $('<button tabindex="-1" class="order-item-row-delete action-secondary action-delete">X</button>');
            $deleteButton.click(this.onDeleteRow);
            $rowActions.html($deleteButton);

            return this;
        },
        onDeleteRow: function(event) {
            let $deleteButton = $(event.target);
            let $row = $deleteButton.closest('.' + config.rowClass);
            $row.remove();

            return this;
        },
        onSaveItemsToOrder: function(event) {
            // Save the items to the order
            let area = ['search', 'items', 'shipping_method', 'totals', 'giftmessage','billing_method'];
            let productsToAdd = this.getProductsToAdd();
            let productsFormattedForSubmit = this.formatProductsForSubmit(productsToAdd);
            window.order.productConfigureSubmit('product_to_add', area, productsFormattedForSubmit, []);
            // Remove all but the last empty item row
            return this;
        },

        formatProductsForSubmit(productsToFormat){
            return productsToFormat.reduce(function(formattedProducts, product){
                let key = 'item[' + product['id'] + '][qty]';
                formattedProducts[key] = product['quantity'];
                return formattedProducts;
            }, []);
        },

        getProductsToAdd: function() {
            // [{"id": "123", "quantity": "2"}, {...}]
            let productsToAdd = [];
            let $rows = $('.' + config.rowClass);
            $rows.each(function(index, row){
                let $row = $(row);
                let $productSelector = $row.find('select.' + config.itemSelectorClass);
                if(!$productSelector.val()){
                    return;
                }
                let $quantityInput = $row.find('input.' + config.quantityClass);
                let quantity = parseInt($quantityInput.val()) > 0
                    ? parseInt($quantityInput.val())
                    : 1;

                productsToAdd.push({
                    id: $productSelector.val(),
                    quantity: quantity
                });
            });

            return productsToAdd;
        }

    };

    return orderItemsAdd;
});