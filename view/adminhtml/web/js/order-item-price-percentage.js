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
        priceDisplaySelector: '.price-excl-tax',
        customPriceCheckboxSelector: '.custom-price-block input[type=checkbox]',
        pricePercentageClass: 'js-price-percentage',
        percentageIndicatorClass: 'js-percent-indicator',
        priceValueSelector: '.price',
    };

    return {
        init: function () {
            this.redefineToggleCustomPrice();

            this.setupUiModifications();

            orderReloadHelper.onOrderItemGridReload('orderItemPricePercentageInit', function(){
                this.init();
            }.bind(this));

            return this;
        },

        redefineToggleCustomPrice: function(){
            let originalToggleCustomPrice = window.order.toggleCustomPrice;
            window.order.toggleCustomPrice = function(checkbox, elemId, tierBlock){
                originalToggleCustomPrice(checkbox, elemId, tierBlock);
                this.additionalToggleCustomPriceActions(checkbox);
            }.bind(this);

            return this;
        },

        additionalToggleCustomPriceActions: function(checkbox){
            let $checkbox = $(checkbox);
            let $priceArea = $checkbox.closest(config.priceColSelector);
            let $percentageInput = $priceArea.find('.' + config.pricePercentageClass);
            let $percentageIndicator = $priceArea.find('.' + config.percentageIndicatorClass);
            let $priceElement = $priceArea.find(config.priceDisplaySelector);
            let showCustomPrice = checkbox.checked;
            this.setPriceVisibility($priceElement, showCustomPrice);
            this.setPercentageInputVisibility($percentageInput, $percentageIndicator, showCustomPrice);
        },

        setupUiModifications: function(){
            let $customPriceCheckboxes = $(config.itemGridSelector + ' ' + config.customPriceCheckboxSelector);
            $customPriceCheckboxes.each(function(index, element){
                this.setupUiModificationsForRow(element);
            }.bind(this));

            return this;
        },

        setupUiModificationsForRow: function(checkbox){
            let $checkbox = $(checkbox);
            let $priceArea = $checkbox.closest(config.priceColSelector);
            let $customPriceInput = $priceArea.find(config.customPriceInputSelector);
            let $priceElement = $priceArea.find(config.priceDisplaySelector);
            let originalPrice = $priceElement.data('originalPrice');
            let currentPrice = $priceElement.data('currentPrice');

            this.setCheckboxStateToMatchPriceState($checkbox, originalPrice, currentPrice); // This is important for browser reloads that preserve the input values from the page before.
            let showCustomPrice = $checkbox[0].checked;

            let percentageInputName = $customPriceInput.attr('id') + '_percentage';
            let $percentageInput = this.createPercentageInput(percentageInputName);

            this.setPriceVisibility($priceElement, showCustomPrice);
            this.setupCustomPriceInput($customPriceInput, $priceElement, $percentageInput, originalPrice, currentPrice);
            this.setupPercentageInput($percentageInput, $priceElement, $customPriceInput, showCustomPrice, originalPrice, currentPrice);
            this.setDisplayPriceToOriginal($priceElement, originalPrice);
        },

        setupCustomPriceInput: function($customPriceInput, $priceElement, $percentageInput, originalPrice, currentPrice){
            // Copy the current price into the custom price input as a starting point
            $customPriceInput.val(Number(currentPrice).toFixed(2));

            // Set the percentage input when the custom price changes
            let eventData = {
                percentageInput: $percentageInput,
                customPriceInput: $customPriceInput,
                originalPrice: originalPrice,
                currentPrice: currentPrice,
            };
            $customPriceInput.on('input change', eventData, this.onCustomPriceChange.bind(this));
            $customPriceInput.focus(this.onFocusSelect.bind(this));

            // Move custom price input to directly after price display
            $priceElement.after($customPriceInput);
            return this;
        },

        setPriceVisibility: function($priceElement, showCustomPrice){
            if(showCustomPrice){
                $priceElement.hide();
            } else {
                $priceElement.show();
            }

            return this;
        },

        setupPercentageInput: function($percentageInput, $priceElement, $customPriceInput, showCustomPrice, originalPrice, currentPrice){
            let percentageValue = this.calculatePercentage(originalPrice, currentPrice);

            let eventData = {
                percentageInput: $percentageInput,
                customPriceInput: $customPriceInput,
                originalPrice: originalPrice,
            };
            $percentageInput.on('change input', eventData, this.onPercentageChange.bind(this));
            $percentageInput.focus(this.onFocusSelect.bind(this));
            $percentageInput.val(percentageValue);
            $customPriceInput.after($percentageInput);

            let $percentIndicator = $('<span class="percent-indicator ' + config.percentageIndicatorClass + '">%</span>');
            $percentageInput.after($percentIndicator);

            this.setPercentageInputVisibility($percentageInput, $percentIndicator, showCustomPrice);

            return this;
        },

        setDisplayPriceToOriginal: function($priceElement, originalPrice){
            $priceElement.find(config.priceValueSelector)
                .html(this.formatPriceForDisplay(originalPrice));
        },

        formatPriceForDisplay(price){
            return '$' + Number(price).toFixed(2);
        },

        setPercentageInputVisibility: function($percentageInput, $percentIndicator, showCustomPrice){
            if(showCustomPrice){
                $percentageInput.show();
                $percentIndicator.show();
            } else {
                $percentageInput.hide();
                $percentIndicator.hide();
            }

            return this;
        },

        setCheckboxStateToMatchPriceState: function($checkbox, originalPrice, currentPrice){
            if(Number(originalPrice) === Number(currentPrice)){
                $checkbox.prop('checked', false);
            } else {
                $checkbox.prop('checked', true);
            }

            return this;
        },

        createPercentageInput: function(inputName){
            return $('<input class="' + config.pricePercentageClass + ' price-percentage input-text admin__control-text" type="text" value="0" name="' + inputName + '" />');
        },

        calculatePercentage: function(fullPrice, currentPrice){
            if(fullPrice === undefined
                || fullPrice === 0){
                return 0;
            }

            return (100 - (currentPrice / fullPrice * 100)).toFixed(0);
        },

        calculatePriceFromPercentageOff: function(originalPrice, percentageOff){
            let multiplier = (100 - percentageOff) / 100;
            return originalPrice * multiplier;
        },

        onPercentageChange: function(event){
            let $percentageInput = event.data.percentageInput;
            let percentValue = Number($percentageInput.val());
            let $customPriceInput = event.data.customPriceInput;
            let originalPrice = Number(event.data.originalPrice);

            if(percentValue >= 0
                && percentValue <= 100 ){

                let customPrice = this.calculatePriceFromPercentageOff(originalPrice, percentValue);
                $customPriceInput.val(customPrice.toFixed(2));
            } else if (percentValue > 100) {
                $percentageInput.val(100);
                $customPriceInput.val(0.00);
            } else {
                $percentageInput.val(0);
                $customPriceInput.val(originalPrice);
            }

            return this;
        },

        onCustomPriceChange: function(event){
            let originalPrice = Number(event.data.originalPrice);
            let currentPrice = Number(event.data.currentPrice);
            let $customPriceInput = event.data.customPriceInput;
            let $percentageInput = event.data.percentageInput;
            let newCustomPrice = Number($customPriceInput.val());

            // If invalid reset to currentPrice
            if(isNaN(newCustomPrice)
                || newCustomPrice < 0){

                $customPriceInput.val(currentPrice.toFixed(2));
                newCustomPrice = Number(currentPrice);

            // If greater than full price set to full price
            } else if(newCustomPrice > originalPrice){
                $customPriceInput.val(originalPrice.toFixed(2));
                newCustomPrice = Number(originalPrice);
            }

            // Set the percentage input
            let percentageValue = this.calculatePercentage(originalPrice, newCustomPrice);
            $percentageInput.val(percentageValue);

            return this;
        },

        onFocusSelect: function(event){
            event.target.select();
            return this;
        }
    };
});