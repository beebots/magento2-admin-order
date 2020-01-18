<?php
namespace BeeBots\AdminOrder\Block\Adminhtml\Order\Create;

use Magento\Backend\Block\Template;
use Magento\Backend\Block\Template\Context;
use Magento\Catalog\Api\Data\ProductAttributeInterface;
use Magento\Catalog\Api\Data\ProductInterface;
use Magento\Catalog\Model\Product\Attribute\Source\Status;
use Magento\Catalog\Model\ResourceModel\Product\CollectionFactory;
use Magento\Eav\Model\Config as EavConfig;

class ItemSearch extends Template
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

    public function getSimpleProductJson()
    {
        $productCollection = $this->collectionFactory->create()
            ->addAttributeToSelect('*')
            ->addAttributeToSelect('flavor')
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

            if ($product->hasData('flavor')) {
                array_push($item, ['flavor' => $product->getData('flavor')]);
            }

            $items[] = $item;
        }

        return json_encode($items);
    }

    public function getAttributeOptionText($attributeCode, $attributeValue)
    {
        return $this->eavConfig
            ->getAttribute(ProductAttributeInterface::ENTITY_TYPE_CODE, $attributeCode)
            ->getSource()
            ->getOptionText($attributeValue);
    }
}
