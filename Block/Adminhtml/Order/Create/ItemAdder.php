<?php
namespace BeeBots\AdminOrder\Block\Adminhtml\Order\Create;

use Magento\Backend\Block\Template;
use Magento\Backend\Block\Template\Context;
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
     * ItemSearch constructor.
     *
     * @param Context $context
     * @param CollectionFactory $collectionFactory
     * @param EavConfig $eavConfig
     * @param array $data
     */
    public function __construct(
        Context $context,
        CollectionFactory $collectionFactory,
        EavConfig $eavConfig,
        array $data = []
    ) {
        parent::__construct($context, $data);
        $this->collectionFactory = $collectionFactory;
        $this->eavConfig = $eavConfig;
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
                'price' => $product->getPrice(),
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
        $key = [];
        $key[] = $this->getNameInLayout();
        $key[] = $this->_storeManager->getStore()->getCode();
        return $key;
    }
}
