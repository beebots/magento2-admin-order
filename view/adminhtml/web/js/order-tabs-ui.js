define([
    'jquery',
    'order-reload-helper',
    'Magento_Sales/order/create/scripts',
], function ($, orderReloadHelper) {
    'use strict';

    let config = {
        contentAreaSelector: '.order-details',
        insertBeforeSelector: '#order-form_account',
        orderTabsClass: 'order-tabs',
        activeClass: 'active',
        inactiveClass: 'disabled',
        panelClass: 'order-tabs-panel',
        tabsInfo: [
            {
                title: 'Order Info',
                panelSelectors: [
                    '#order-form_account',
                    '#amasty-order-attributes'
                ],
            },
            {
                title: 'Addresses',
                panelSelectors: [
                    '#order-addresses'
                ]
            },
            {
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
                .data('tabInfo', tabInfo);

            let $tabListItemLink = $('<a class="switch">' + tabInfo.title + '</a>');

            $tabListItemLink.on('click', this.onTabClick.bind(this));
            $tabListItem.append($tabListItemLink);

            tabInfo.panelSelectors.forEach(function(panelSelector){
                $(panelSelector).addClass(config.panelClass);
            });

            if(tabInfo.isActive){
                this.activateTab($tabListItem);
            } else {
                this.disableTab($tabListItem);
            }

            return $tabListItem;
        },

        activateTab: function($tabListItem){
            let tabInfo = $tabListItem.data('tabInfo');
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
            let tabInfo = $tabListItem.data('tabInfo');
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
            let $tabList = $tabListItem.closest('ul');
            // Remove the active class on all tabs and panels
            $tabList.find('li').each(function(index, tabListItem){
                let $tabListItem = $(tabListItem);
                this.disableTab($tabListItem);
            }.bind(this));

            // Add the active class to the chosen tab and panel
            this.activateTab($tabListItem);

            event.preventDefault();
        },
    }
});