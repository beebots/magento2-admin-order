<?php


namespace BeeBots\AdminOrder\Block\Adminhtml\Order\Create;

use Magento\Backend\Block\Template;
use Magento\Backend\Block\Template\Context;
use Magento\Backend\Model\Session\Quote;

/**
 * Class LinkCustomer
 *
 * @package BeeBots\AdminOrder\Block\Adminhtml\Order\Create
 */
class LinkCustomer extends Template
{
    /** @var Quote $sessionQuote */
    private $sessionQuote;

    private $showHeader = false;

    /**
     * LinkCustomer constructor.
     *
     * @param Quote $sessionQuote
     * @param Context $context
     * @param array $data
     */
    public function __construct(Quote $sessionQuote, Context $context, array $data = [])
    {
        parent::__construct($context, $data);
        $this->sessionQuote = $sessionQuote;
    }

    /**
     * Function: getCustomerUrl
     *
     * @return string
     */
    public function getCustomerUrl(): string
    {
        $customerId = $this->sessionQuote->getCustomerId();
        return $this->getUrl('customer/index/edit', ['id' => $customerId]);
    }

    /**
     * Function: hasCustomerId
     *
     * @return bool
     */
    public function hasCustomerId(): bool
    {
        $customerId = $this->sessionQuote->getCustomerId();
        return ! ! $customerId;
    }

    /**
     * Function: getShowHeader
     *
     * @return bool
     */
    public function getShowHeader(): bool
    {
        return $this->showHeader;
    }

    /**
     * Function: setShowHeader
     *
     * @param bool $showHeader
     */
    public function setShowHeader(bool $showHeader)
    {
        $this->showHeader = $showHeader;
    }
}
