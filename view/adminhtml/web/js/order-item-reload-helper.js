define([
    'underscore',
    'Magento_Sales/order/create/scripts',
], function (_) {
    'use strict';

    let orderItemReloadHelper = {
        callbackKeys: [],
        onReload: function(callbackKey, callback){
            if(_.contains(this.callbackKeys, callbackKey)){
                return this;
            }
            this.callbackKeys.push(callbackKey);

            let originalItemsLoaded = window.order.itemsLoaded;
            window.order.itemsLoaded = function(){
                originalItemsLoaded();
                callback();
            }.bind(this);

            let originalAreasLoaded = window.order.areasLoaded;
            window.order.areasLoaded = function(){
                originalAreasLoaded();
                callback();
            }.bind(this);

            return this;
        },

    };

    return orderItemReloadHelper;
});