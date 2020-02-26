define([
    'jquery',
    'order-reload-helper',
    'Magento_Sales/order/create/form',
], function ($jQuery, orderReloadHelper) {
    'use strict';

    return {
        init: function(){
            orderReloadHelper.initReloadCallback('order-shipping_address', this._initShipping.bind(this));
            this._initBilling();
            this._initShipping();
        },

        _initBilling: function(){
            this.onBillingAddressChange();
            $jQuery('#order-billing_address_customer_address_id').change(this.onBillingAddressChange.bind(this));
        },

        _initShipping: function(){
            this.onShippingAddressChange();
            $jQuery('#order-shipping_address_customer_address_id').change(this.onShippingAddressChange.bind(this));
        },

        onBillingAddressChange(){
            debugger;
            let billingAddress = $jQuery('#order-billing_address_customer_address_id').val();
            if(billingAddress){
                $jQuery('#order-billing_address_save_in_address_book').attr('checked', null);
            } else {
                $jQuery('#order-billing_address_save_in_address_book').attr('checked', 'checked');
            }
        },

        onShippingAddressChange(){
            let shippingAddress = $jQuery('#order-shipping_address_customer_address_id').val();
            if(shippingAddress){
                $jQuery('#order-shipping_address_save_in_address_book').attr('checked', null);
            } else {
                $jQuery('#order-shipping_address_save_in_address_book').attr('checked', 'checked');
            }
        }
    }
});
