import React from 'react'
import formatPrice from './_helper'

const PurchaseItem = (props) => {
  const defaults = {
    qty: 1,
    name: '<item name>',
    category: 'Northwoods Wellness',
    price: 0,
    tax: 0,
    total: 0,
  }

  const item = {...defaults, ...props.data}

  return (
    <div class="purchase-item">
      <div class="purchase-item__left">
        <div class="purchase-item__image">
          <img src={'img/icon-item2.png'} />
        </div>
        <div class="purchase-item__name">{item.qty} x {item.name}</div>
        <div class="purchase-item__category">{item.category}</div>
      </div>

      <div class="purchase-item__right">
        <div class="purchase-item__price">
          <div class="purchase-item__label">List Price</div>
          <div class="purchase-item__value">{formatPrice(item.price)}</div>
        </div>
        <div class="purchase-item__tax">
          <div class="purchase-item__label">Tax</div>
          <div class="purchase-item__value">{formatPrice(item.tax)}</div>
        </div>
        <div class="purchase-item__total">
          <div class="purchase-item__label">Total</div>
          <div class="purchase-item__value">{formatPrice(item.total)}</div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  row: {
    borderBottom: '1px solid #ebeff4',
  },
}

export default PurchaseItem