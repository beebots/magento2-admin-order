define([
    'jquery',
    'order-reload-helper',
    'Magento_Sales/order/create/scripts',
], function ($, orderReloadHelper) {
    'use strict';

    let config = {
        formSelector: '#edit_form',
        contentAreaSelector: '.order-details',
        insertBeforeSelector: '#order-form_account',
        orderTabsClass: 'order-tabs',
        activeClass: 'active',
        inactiveClass: 'disabled',
        panelClass: 'order-tabs-panel',
        tabIdDataAttribute: 'data-tab-id',
        panelTabIdDataAttribute: 'data-panel-tab-id',
        tabsInfo: [
            {
                tabId: 'tab_order_info',
                title: 'Order Info',
                panelSelectors: [
                    '#order-form_account',
                    '#amasty-order-attributes'
                ],
            },
            {
                tabId: 'tab_addresses',
                title: 'Addresses',
                panelSelectors: [
                    '#order-addresses'
                ]
            },
            {
                tabId: 'tab_shipping_payment',
                title: 'Shipping & Payment',
                panelSelectors: [
                    '#order-methods',
                    '.order-summary'
                ],
                isActive: true
            },
        ],
    };

    return {
        init: function (options) {
            // Take passed in options over default config
            $.extend(config, options);

            this.createTabs();
            this.setupFormInvalidHandler();

            orderReloadHelper.onReloadAreas('orderTabsUiInit', function () {
                this.init();
            }.bind(this));

            return this;
        },

        createTabs: function (){
            let $tabList = $('<ul class="' + config.orderTabsClass + '"></ul>');
            config.tabsInfo.forEach(function(tabInfo){
                let $tabListItem = this.createTab(tabInfo);
                if($tabListItem){
                    $tabList.append($tabListItem);
                }

                return $tabList;
            }, this);

            $(config.insertBeforeSelector).before($tabList);
        },

        createTab: function(tabInfo){
            let $tabListItem = $('<li></li>')
                .attr(config.tabIdDataAttribute, tabInfo.tabId);

            let $tabListItemLink = $('<a class="switch">' + tabInfo.title + '</a>');

            $tabListItemLink.on('click', this.onTabClick.bind(this));
            $tabListItem.append($tabListItemLink);

            this.setupPanelsForTab(tabInfo.panelSelectors, tabInfo.tabId);

            if(tabInfo.isActive){
                this.activateTab($tabListItem);
            } else {
                this.disableTab($tabListItem);
            }

            return $tabListItem;
        },

        setupPanelsForTab: function(panelSelectors, tabId){
            panelSelectors.forEach(function(panelSelector){
                let $panel = $(config.contentAreaSelector + ' ' + panelSelector);
                $panel
                    .addClass(config.panelClass)
                    .attr(config.panelTabIdDataAttribute, tabId);

            }.bind(this));

            return this;
        },

        activateTab: function($tabListItem){
            let tabId = $tabListItem.attr(config.tabIdDataAttribute);
            let tabInfo = this.getTabInfoById(tabId);
            tabInfo.panelSelectors.forEach(function(panelSelector){
                $(panelSelector)
                    .removeClass(config.inactiveClass)
                    .addClass(config.activeClass);
            });

            $tabListItem
                .removeClass(config.inactiveClass)
                .addClass(config.activeClass);

            return this;
        },

        disableTab: function($tabListItem){
            let tabId = $tabListItem.attr(config.tabIdDataAttribute);
            let tabInfo = this.getTabInfoById(tabId);
            tabInfo.panelSelectors.forEach(function(panelSelector){
                $(panelSelector)
                    .removeClass(config.activeClass)
                    .addClass(config.inactiveClass);
            });

            $tabListItem
                .removeClass(config.activeClass)
                .addClass(config.inactiveClass);

            return this;
        },

        onTabClick: function(event){
            let $tabListItemLink = $(event.target);
            let $tabListItem = $tabListItemLink.closest('li');
            this.selectTab($tabListItem);

            event.preventDefault();
        },

        selectTab: function($tabListItem){
            let $tabList = $tabListItem.closest('ul');
            // Remove the active class on all tabs and panels
            $tabList.find('li').each(function(index, tabListItem){
                let $tabListItem = $(tabListItem);
                this.disableTab($tabListItem);
            }.bind(this));

            // Add the active class to the chosen tab and panel
            this.activateTab($tabListItem);
        },

        getTabInfoById: function(tabId){
            let tabInfos = config.tabsInfo.filter(function(tabInfo){
                return tabInfo.tabId === tabId;
            });

            if(tabInfos.length === 0){
                return null;
            }

            return tabInfos[0];
        },

        setupFormInvalidHandler: function(){
            let $orderCreateForm = $(config.formSelector);
            $orderCreateForm.on('invalid-form.validate', this.onFormInvalid.bind(this));
        },

        onFormInvalid: function(event, validator){
            if(!validator || !validator.errorList || !validator.errorList[0] || !validator.errorList[0].element){
                return this;
            }

            let $invalidInput = $(validator.errorList[0].element);
            let $containingPanel = $invalidInput.closest('.' + config.panelClass);

            if($containingPanel.length === 0){
                return this;
            }

            let tabId = $containingPanel.attr(config.panelTabIdDataAttribute);
            let $tabListItem = $('.' + config.orderTabsClass + ' [' + config.tabIdDataAttribute + '="' + tabId + '"]');
            this.selectTab($tabListItem);
            $invalidInput.focus();

            return this;
        },
    }
});