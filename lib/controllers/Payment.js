import merge from 'lodash/merge'
import castArray from 'lodash/castArray'
import map from 'lodash/map'
import first from 'lodash/first'
import get from 'lodash/get'
import set from 'lodash/set'
import pick from 'lodash/pick'
import cloneDeep from 'lodash/cloneDeep'
import isArray from 'lodash/isArray'
import Promise from 'bluebird'
import { GET, POST } from 'constants/httpMethods'

class Payment {
  constructor (sdk) {
    this.sdk = sdk
  }

  get (paymentId, callback) {
    return this.sdk.apiClient.call({
      method: GET,
      path: `/veem/v1.1/payments/${paymentId}`,
    }, callback)
  }

  getBatch (batchId, callback) {
    return this.sdk.apiClient.call({
      method: GET,
      path: `/veem/v1.1/payments/batch/${batchId}`,
      queries: {
        includeItems: true,
      },
    }, callback)
  }

  list (options, callback) {
    const queries = pick(options, [
      'paymentIds',
      'batchId',
      'batchItemIds',
      'status',
      'sort',
      'pageNumber',
      'pageSize',
    ])

    return this.sdk.apiClient.call({
      method: GET,
      path: '/veem/v1.1/payments',
      queries,
    }, callback)
  }

  draft (paymentOrPayments, callback) {
    const isBatch = isArray(paymentOrPayments)
    const payments = castArray(paymentOrPayments)

    const computedPayments = map(payments, payment => merge({}, payment, { approveAutomatically: false }))
    const computedPaymentOrPayments = isBatch ? computedPayments : first(computedPayments)

    return this._create(computedPaymentOrPayments, callback)
  }

  send (paymentOrPayments, callback) {
    const isBatch = isArray(paymentOrPayments)
    const payments = castArray(paymentOrPayments)

    const computedPayments = map(payments, payment => merge({}, payment, { approveAutomatically: true }))
    const computedPaymentOrPayments = isBatch ? computedPayments : first(computedPayments)

    return this._create(computedPaymentOrPayments, callback)
  }

  sendById (paymentId, callback) {
    return this.sdk.apiClient.call({
      method: POST,
      path: `/veem/v1.1/payments/${paymentId}/approve`,
    }, callback)
  }

  cancel (paymentId, callback) {
    return this.sdk.apiClient.call({
      method: POST,
      path: `/veem/v1.1/payments/${paymentId}/cancel`,
    }, callback)
  }

  async _create (paymentOrPayments, callback) {
    const computedPaymentOrPayments = cloneDeep(paymentOrPayments)
    const isBatch = isArray(computedPaymentOrPayments)

    if (!isBatch) {
      const attachments = get(computedPaymentOrPayments, 'attachments', [])
      const uploadedAttachments = await Promise.map(attachments, attachment => this.sdk.attachment.upload(attachment))

      set(computedPaymentOrPayments, 'attachments', uploadedAttachments)
    }

    const path = isBatch
      ? '/veem/v1.1/payments/batch'
      : '/veem/v1.1/payments'

    const queries = {
      includeItems: isBatch,
    }

    return this.sdk.apiClient.call({
      method: POST,
      path,
      payload: computedPaymentOrPayments,
      queries,
    }, callback)
  }
}

export default Payment
