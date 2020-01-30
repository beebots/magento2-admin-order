define([
    'underscore',
    'Magento_Sales/order/create/scripts',
], function (_) {
    'use strict';

    let orderReloadHelper = {

        callbackKeys: [],

        onOrderItemGridReload: function(callbackKey, callback){
            this.onReloadAreas(callbackKey, callback);
            this.onReloadItems(callbackKey, callback);
        },

        onReloadItems: function(callbackKey, callback){
            let itemsCallbackKey = 'items-' + callbackKey;
            if(_.contains(this.callbackKeys, itemsCallbackKey)){
                return this;
            }
            this.callbackKeys.push(itemsCallbackKey);

            let originalItemsLoaded = window.order.itemsLoaded;
            window.order.itemsLoaded = function(){
                originalItemsLoaded();
                callback();
            }.bind(this);

            return this;
        },

        onReloadAreas: function(callbackKey, callback){
            let areasCallbackKey = 'areas-' + callbackKey;
            if(_.contains(this.callbackKeys, areasCallbackKey)){
                return this;
            }
            this.callbackKeys.push(areasCallbackKey);

            let originalAreasLoaded = window.order.areasLoaded;
            window.order.areasLoaded = function(){
                originalAreasLoaded();
                callback();
            }.bind(this);

            return this;
        },

    };

    return orderReloadHelper;
});