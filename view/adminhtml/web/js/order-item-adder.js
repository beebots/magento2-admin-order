define([
    'jquery',
    'Magento_Ui/js/modal/alert',
    'Magento_Ui/js/modal/confirm',
    'order-reload-helper',
    'selectize',
    'Magento_Catalog/catalog/product/composite/configure',
    'Magento_Sales/order/create/scripts',
], function ($, alert, confirm, orderReloadHelper) {
    'use strict';

    let config = {
        insertAfterSelector: '#order-items_grid table > tbody:last-child',
        itemSelectorClass: 'js-order-item-selector',
        itemAreaClass: 'js-order-item-add-area',
        itemSelectorPlaceholder: 'Add by SKU or Name',
        rowClass: 'js-order-item-row',
        quantityClass: 'js-order-item-quantity',
        priceClass: 'js-order-item-price',
        rowActionsClass: 'js-order-item-row-actions',
        itemsSaveButtonSelector: '#order-items button[title="Update Items and Quantities"]',
        orderItemsGridSelector: '#order-items_grid',
        mainFormSelector: '#edit_form',
        customerGroupSelector: 'select#group_id',
    };

    let orderItemAdder = {
        itemsToAddToOrder: [],
        productData: [],
        hasHookedIntoOrderItemsLoadEvent: false,
        hasHookedIntoOrderAreasLoadEvent: false,

        init: function(productData){
            this.productData = productData || this.productData;

            let $itemAddTable = this.createItemAddArea();
            $itemAddTable.insertAfter(config.insertAfterSelector);

            this.replaceDefaultOrderSaveButton();
            this.setupSubmitConfirm();

            orderReloadHelper.onOrderItemGridReload('itemAdderInit', function(){
                this.init(this.productData);
            }.bind(this));

            return this;
        },

        createItemAddArea: function(){
            let $table = $('<tbody class="order-item-add-area ' + config.itemAreaClass + '"></tbody>');

            let $row = this.createItemAddRow();
            $table.append($row);

            return $table;
        },

        createSaveButton: function(){
            let $saveButton = $('<button class="action-secondary action-add save-order-items" type="button">Update Items and Quantities</button>');
            $saveButton.click(this.onSaveItemsToOrder.bind(this));
            return $saveButton;
        },

        createItemAddRow: function(){
            let $row = $('<tr class="' + config.rowClass + '"></tr>');

            let $itemSelectorWrap = this.createItemSelectorWrap();
            $row.append($itemSelectorWrap);

            let $priceWrap = this.createItemPriceWrap();
            $row.append($priceWrap);

            let $itemQuantityWrap = this.createItemQuantity();
            $row.append($itemQuantityWrap);

            $row.append('<td></td>');// Subtotal
            $row.append('<td></td>');// Discount
            $row.append('<td></td>');// Row Subtotal


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
            let $itemQuantityWrap = $('<td class="order-item-quantity-wrap col-qty"></td>');
            let $itemQuantityElement = $('<input type="number" min="1" value="1" maxlength="12" class="admin__control-text ' + config.quantityClass +'" />');
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
            return $('<td class="order-item-row-actions ' + config.rowActionsClass + '" colspan="4"></td>');
        },

        replaceDefaultOrderSaveButton: function(){
            let $originalOrderSaveButton = $(config.itemsSaveButtonSelector);
            let $newSaveButton = this.createSaveButton();
            $(config.orderItemsGridSelector).after($newSaveButton);
            $originalOrderSaveButton.hide();
        },

        onItemSelectorChange: function(event){
            let $selectorElement = $(event.target);
            let $parentRow = $selectorElement.closest('.' + config.rowClass);
            this.setRowPrice($parentRow, $selectorElement.val());
            this.createDeleteButtonForRow($parentRow);
            this.maintainLastRow();
        },

        setRowPrice: function($row, productId){
            let $priceElement = $row.find('.' + config.priceClass);
            let customerGroupId = $(config.customerGroupSelector).val();
            if(!productId){
                $priceElement.empty();
                return;
            }
            let price = this.getPriceById(productId, customerGroupId);
            let formattedPrice = this.formatPriceForDisplay(price);
            $priceElement.text(formattedPrice);
        },

        getPriceById: function(productId, customerGroupId){
            let product =  this.productData.find(function(item){
                return item.id === productId;
            });

            return product['tierPrices'][customerGroupId]
                || product['retailPrice'];
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
            let $lastItemSelector = $('.' + config.itemAreaClass + ' select.' + config.itemSelectorClass).last();
            if(!$lastItemSelector.val()){
                return this;
            }

            let $newRow = this.createItemAddRow();
            $('.' + config.itemAreaClass).append($newRow);

            return this;
        },

        createDeleteButtonForRow: function($row){
            let $rowActions = $row.find('.' + config.rowActionsClass);
            let $deleteButton = $('<button tabindex="-1" class="order-item-row-delete action-additional" type="button">Remove</button>');
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
            let productsToAdd = this.getProductsToAdd();

            // If we don't have new products, update the existing quote items and return early
            if(productsToAdd.length === 0){
                return this.updateExistingQuoteItems();
            }

            // Save the new items to the order
            this.saveNewItemsToOrder(productsToAdd);

            return this;
        },

        saveNewItemsToOrder: function(productsToAdd){
            let area = ['search', 'items', 'shipping_method', 'totals', 'giftmessage','billing_method'];
            area = window.order.prepareArea(area);

            let url = window.order.loadBaseUrl + 'block/' + area;

            let data = this.formatProductsForSubmit(productsToAdd);
            data = window.order.prepareParams(data);
            data.json = true;

            $.ajax({
                    url: url,
                    method: 'POST',
                    dataType: 'json',
                    data: data,
                })
                .fail(this.onSaveNewItemsFail.bind(this))
                .complete(this.onSaveNewItemsComplete.bind(this));

            this.startLoader();
            return this;
        },

        onSaveNewItemsFail: function(xhr, status, error){
            alert({
                content: error
            });
        },

        onSaveNewItemsComplete: function(){
            this.stopLoader();
            this.updateExistingQuoteItems();
        },

        updateExistingQuoteItems: function(){
            window.order.itemsUpdate();
            return this;
        },

        formatProductsForSubmit(productsToFormat){
            return productsToFormat.reduce(function(formattedProducts, product){
                let key = 'item[' + product['id'] + '][qty]';
                formattedProducts[key] = product['quantity'];
                return formattedProducts;
            }, {});
        },

        getProductsToAdd: function() {
            // Format: [{"id": "123", "quantity": "2"}, {...}]
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
        },

        startLoader: function(){
            $(window.productConfigure.blockForm).trigger('processStart');
            return this;
        },

        stopLoader: function(){
            $(window.productConfigure.blockForm).trigger('processStop');
            return this;
        },

        setupSubmitConfirm: function(){
            $(config.mainFormSelector)
                .off('realOrder')
                .on('realOrder', this.confirmUnAddedItems.bind(this));

            return this;
        },

        confirmUnAddedItems: function(){
            if(this.hasUnsavedNewItems()){
                $(config.mainFormSelector).trigger('processStop');

                confirm({
                    content: 'You have unsaved new items. Would you like to submit the order anyway?',
                    actions: {
                        confirm: function() {
                            $(config.mainFormSelector).trigger('processStart');
                            window.order._realSubmit();
                        }
                    }
                });
                return this;
            }

            window.order._realSubmit();

            return this;
        },

        hasUnsavedNewItems: function(){
            let hasUnsavedNewItems = false;
            let $itemDropdowns = $('.' + config.itemAreaClass + ' .' + config.rowClass + ' select.' + config.itemSelectorClass);
            $itemDropdowns.each(function(index, element){
                if($(element).val() !== ''){
                    hasUnsavedNewItems = true;
                }
            });
            return hasUnsavedNewItems;
        },
    };

    return orderItemAdder;
});
