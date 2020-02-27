define([
    'jquery',
    'order-reload-helper',
    'Magento_Sales/order/create/form',
], function ($, orderReloadHelper) {
    'use strict';

    return {
        init: function(){
            this._initBilling();
            this._initShipping();
            this._initShippingReload();
            orderReloadHelper.onReloadAreas('beeSaveAddressBookShipping', this._initShipping.bind(this));
            orderReloadHelper.onReloadAreas('beeSaveAddressBookShippingReload', this._initShippingReload.bind(this));
            orderReloadHelper.onReloadAreas('beeSaveAddressBookBilling', this._initBilling.bind(this));
        },

        _initBilling: function(){
            this.onBillingAddressChange();
            $('#order-billing_address_customer_address_id').change(this.onBillingAddressChange.bind(this));
        },

        _initShipping: function(){
            this.onShippingAddressChange();
            $('#order-shipping_address_customer_address_id').change(this.onShippingAddressChange.bind(this));
        },

        _initShippingReload: function(){
            orderReloadHelper.initAreaReloadCallback('beeSaveAddressBookInit', 'order-shipping_address', this._initShipping.bind(this));
        },

        onBillingAddressChange(){
            let billingAddress = $('#order-billing_address_customer_address_id').val();
            if(billingAddress){
                $('#order-billing_address_save_in_address_book').prop('checked', null);
            } else {
                $('#order-billing_address_save_in_address_book').prop('checked', 'checked');
            }
        },

        onShippingAddressChange(){
            let shippingAddress = $('#order-shipping_address_customer_address_id').val();
            if(shippingAddress){
                $('#order-shipping_address_save_in_address_book').prop('checked', null);
            } else {
                $('#order-shipping_address_save_in_address_book').prop('checked', 'checked');
            }
        }
    }
});
