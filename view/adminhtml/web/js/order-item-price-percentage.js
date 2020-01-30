define([
    'jquery',
    'order-reload-helper',
    'Magento_Sales/order/create/scripts',
], function ($, orderReloadHelper) {
    'use strict';

    let config = {
        itemGridSelector: '#order-items_grid',
        priceColSelector: '.col-price',
        customPriceInputSelector: 'input.item-price',
        priceDisplaySelector: '.price',
        customPriceCheckboxSelector: '.custom-price-block input[type=checkbox]',
    };

    let orderItemPricePercentage = {
        init: function () {
            this.redefineToggleCustomPrice();
            this.relocateCustomPriceInputs();
            this.setupDisplaysBasedOnCustomPriceEnabled();

            orderReloadHelper.onOrderItemGridReload('orderItemPricePercentageInit', function(){
                this.init();
            }.bind(this));

            return this;
        },

        redefineToggleCustomPrice: function(){
            let originalToggleCustomPrice = window.order.toggleCustomPrice;
            window.order.toggleCustomPrice = function(checkbox, elemId, tierBlock){
                this.setPriceDisplayForCheckbox(checkbox);
                originalToggleCustomPrice(checkbox, elemId, tierBlock);
            }.bind(this);

            return this;
        },

        relocateCustomPriceInputs: function(){
            let $customPriceInputs = $(config.itemGridSelector + ' ' + config.customPriceInputSelector);
            $customPriceInputs.each(function(index, element){
                let $customPriceInput = $(element);
                let $priceArea = $customPriceInput.closest(config.priceColSelector);
                let $priceDisplay = $priceArea.find(config.priceDisplaySelector);
                $priceDisplay.after($customPriceInput);
            });

            return this;
        },

        setupDisplaysBasedOnCustomPriceEnabled: function(){
            let customPriceCheckboxes = $(config.itemGridSelector + ' ' + config.customPriceCheckboxSelector);

            customPriceCheckboxes.each(function(index, element){
                this.setPriceDisplayForCheckbox(element);
            }.bind(this));

            return this;
        },

        setPriceDisplayForCheckbox: function(checkbox){
            let $checkbox = $(checkbox);
            let showCustomPrice = $checkbox[0].checked;
            let $price = $checkbox.closest(config.priceColSelector).find(config.priceDisplaySelector);
            if(showCustomPrice){
                $price.hide();
                return this;
            }
            $price.show();

            return this;
        }
    }

    return orderItemPricePercentage;
});