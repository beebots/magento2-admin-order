define([
    'jquery',
    'order-tabs-ui',
    'Magento_Sales/order/create/form',
], function ($, orderTabsUi) {

    let shippingFieldsSelector = '#order-shipping_address input:not([type="checkbox"]), #order-shipping_address select';

    return {

        init: function () {
            let origLoadShippingRates = window.order.loadShippingRates.bind(window.order);
            window.order.loadShippingRates = function () {
                if (this.validateShippingForm()) {
                    return origLoadShippingRates();
                }
                return false;
            }.bind(this);
        },

        validateShippingForm: function () {
            let $form = $('#edit_form');
            let $validator = $form.validate();
            let valid = true;
            let firstInvalid = null;
            $(shippingFieldsSelector).each(function () {
                let result = $validator.element(this);
                if(!result && !firstInvalid){
                    firstInvalid = this;
                }
                valid &= result;
            });
            if(!valid){
                this.selectAddressTab();
                $validator.element(firstInvalid);
                $form.triggerHandler('invalid-form', $validator);
            }
            return valid;
        },

        selectAddressTab: function() {
            orderTabsUi.selectTab($('li[data-tab-id="tab_customer"]'));
        },
    };
});
