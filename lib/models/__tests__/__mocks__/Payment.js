import moment from 'moment'
import uniqueId from 'lodash/uniqueId'
import MONETARY_AMOUNT_MOCK from './MonetaryAmount'
import PAYEE_MOCK from './Payee'

const PAYMENT = {
  amount: MONETARY_AMOUNT_MOCK,
  approveAutomatically: false,
  ccEmails: [
    'test+cc1@domain.com',
    'test+cc2@domain.com',
  ],
  dueDate: moment().unix(),
  exchangeRateQuoteId: uniqueId(),
  externalInvoiceRefId: uniqueId(),
  notes: 'Lorem ipsum',
  payee: PAYEE_MOCK,
}

export default PAYMENT
