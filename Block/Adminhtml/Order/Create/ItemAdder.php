<?php
namespace BeeBots\AdminOrder\Block\Adminhtml\Order\Create;

use Magento\Backend\Block\Template;
use Magento\Backend\Block\Template\Context;
use Magento\Backend\Model\Session\Quote;
use Magento\Catalog\Api\Data\ProductInterface;
use Magento\Catalog\Model\Product\Attribute\Source\Status;
use Magento\Catalog\Model\ResourceModel\Product\CollectionFactory;
use Magento\Eav\Model\Config as EavConfig;
use Magento\Framework\Exception\NoSuchEntityException;

/**
 * Class ItemAdder
 *
 * @package BeeBots\AdminOrder\Block\Adminhtml\Order\Create
 */
class ItemAdder extends Template
{
    /**
     * @var CollectionFactory
     */
    private $collectionFactory;

    /**
     * @var EavConfig
     */
    private $eavConfig;

    /**
     * @var Quote
     */
    private $sessionQuote;

    /**
     * ItemSearch constructor.
     *
     * @param Context $context
     * @param CollectionFactory $collectionFactory
     * @param EavConfig $eavConfig
     * @param Quote $sessionQuote
     * @param array $data
     */
    public function __construct(
        Context $context,
        CollectionFactory $collectionFactory,
        EavConfig $eavConfig,
        Quote $sessionQuote,
        array $data = []
    ) {
        parent::__construct($context, $data);
        $this->collectionFactory = $collectionFactory;
        $this->eavConfig = $eavConfig;
        $this->sessionQuote = $sessionQuote;
    }

    /**
     * Function: getSimpleProductJson
     *
     * @return false|string
     */
    public function getSimpleProductJson()
    {
        $productCollection = $this->collectionFactory->create()
            ->addAttributeToSelect('*')
            ->addFilter('type_id', 'simple')
            ->addAttributeToFilter('status', Status::STATUS_ENABLED);

        $items = [];
        /** @var ProductInterface $product */
        foreach ($productCollection as $product) {
            $item = [
                'id' => $product->getId(),
                'sku' => $product->getSku(),
                'name' => $product->getName(),
                'retailPrice' => $product->getPrice(),
                'tierPrices' => $this->prepareCustomerGroupPrices($product),
            ];

            $items[] = $item;
        }

        return json_encode($items);
    }

    /**
     * Function: getCacheLifetime
     *
     * @return bool|float|int|null
     */
    protected function getCacheLifetime()
    {
        // 1 month in seconds
        return 60 * 60 * 24 * 30;
    }

    /**
     * Function: getCacheKeyInfo
     *
     * @return array
     * @throws NoSuchEntityException
     */
    public function getCacheKeyInfo()
    {
        return [
            $this->getNameInLayout(),
            $this->_storeManager->getStore()->getCode(),
            $this->_storeManager->getStore()->getCode(),
        ];
    }

    private function prepareCustomerGroupPrices($product)
    {
        $tierPrices = $product->getTierPrices();
        $customerGroupPrices = [];
        foreach ($tierPrices as $tierPrice) {
            // Limit to the first tier (quantity 1)
            if ((int)$tierPrice->getQty() !== 1) {
                continue;
            }
            $customerGroupPrices[$tierPrice->getCustomerGroupId()] = $tierPrice->getValue();
        }
        return $customerGroupPrices;
    }
}
