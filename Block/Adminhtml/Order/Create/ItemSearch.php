<?php
namespace BeeBots\AdminOrder\Block\Adminhtml\Order\Create;

use Magento\Backend\Block\Template;
use Magento\Backend\Block\Template\Context;
use Magento\Catalog\Model\ProductRenderList;
use Magento\Framework\Api\FilterBuilder;
use Magento\Framework\Api\SearchCriteriaBuilder;
use Magento\Store\Model\StoreManager;

class ItemSearch extends Template
{
    /**
     * @var StoreManager
     */
    private $storeManager;

    /**
     * @var SearchCriteriaBuilder
     */
    private $searchCriteriaBuilder;

    /**
     * @var FilterBuilder
     */
    private $filterBuilder;

    /**
     * @var ProductRenderList
     */
    private $productRenderList;

    public function __construct(
        Context $context,
        array $data = []
    ) {
        parent::__construct($context, $data);
    }

    public function getSimpleProductJsonData()
    {
        return json_Encode([]);
    }
}
