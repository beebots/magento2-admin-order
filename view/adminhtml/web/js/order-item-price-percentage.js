define([
    'jquery',
    'order-item-reload-helper',
    'Magento_Sales/order/create/scripts',
], function ($, itemsReloadHelper) {
    'use strict';

    let config = {
        priceColSelector: '#order-items_grid .col-price',
    };

    let orderItemPricePercentage = {
        init: function () {
            this.redefineToggleCustomPrice();

            itemsReloadHelper.onReload('orderItemPricePercentageInit', function(){
                this.init();
            }.bind(this));

            return this;
        },

        redefineToggleCustomPrice: function(){
            let originalToggleCustomPrice = window.order.toggleCustomPrice;
            window.order.toggleCustomPrice = function(checkbox, elemId, tierBlock){
                console.log('toggling the price');
                originalToggleCustomPrice(checkbox, elemId, tierBlock);
            }

        }
    }

    return orderItemPricePercentage;
});