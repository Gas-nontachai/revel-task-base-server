const Task = function (task) { this.task = task.task }

const {
  BranchModel,
  CompanyModel,
  InvoiceSupplierListModel,
  InvoiceSupplierModel,
  PaymentLogModel,
  PaymentModel,
  ProductModel,
  SupplierModel,
  SyncDataModel
} = require("@/models")

const { Mailer, Notify, } = require('@/plugins')

const { queue } = require("@/queue")

const { formatDate } = require("@/utils/date-helper")
const { toFloat } = require("@/utils/number-helper")

const { isChange } = require('@/utils/invoice-supplier-helper')

const syncProduct = async (connection, data) => {
  const { branch_id, company_id, STK = [], } = data

  if (!STK.length) return

  console.log(`begin sync: [${STK.length} product] estimate time [${STK.length / 20} minutes]`)

  const product_syncs = STK.map(item => ({
    branch_id,
    company_id,
    product_origin_id: item.STKcode,
    product_name: item.STKdescT1,
    product_unit_name1: item.STKuname1,
    product_unit_name2: item.STKuname2,
    product_unit_name3: item.STKuname3,
    product_unit_name4: item.STKuname4,
    product_unit_name5: item.STKuname5,
    product_unit_qty1: item.STKqU1,
    product_unit_qty2: item.STKqU2,
    product_unit_qty3: item.STKqU3,
    product_unit_qty4: item.STKqU4,
    product_unit_qty5: item.STKqU5,
    product_unit_conv1: item.STKqE1,
    product_unit_conv2: item.STKqE2,
    product_unit_conv3: item.STKqE3,
    product_unit_conv4: item.STKqE4,
    product_unit_conv5: item.STKqE5,
  }))

  const { docs: product_olds } = await ProductModel.getProductBy(connection, {
    match: {
      branch_id,
      product_origin_id: { $in: product_syncs.map(item => item.product_origin_id) },
    }
  })

  for (const product_sync of product_syncs) {
    const product_old = product_olds.find(val => val.product_origin_id === product_sync.product_origin_id)

    if (product_old) {
      await ProductModel.updateSyncProductBy(connection, { ...product_old, ...product_sync })
    } else {
      product_sync.product_id = await ProductModel.generateProductID(connection)

      await ProductModel.insertSyncProduct(connection, product_sync)
    }
  }
}

const syncSupplier = async (connection, data) => {
  const { branch_id, company_id, CRE = [], } = data

  if (!CRE.length) return

  console.log(`begin sync: [${CRE.length} supplier] estimate time [${CRE.length / 20} minutes]`)

  const supplier_syncs = CRE.map(item => {
    const address_texts = [item.CREadd1AT, item.CREadd2AT, item.CREadd3AT]

    return {
      branch_id,
      company_id,
      supplier_origin_id: item.CREcode,
      supplier_name: item.CREnameT,
      supplier_contact_name: item.CREcontactT,
      supplier_address: address_texts.filter(text => text).join(' '),
      supplier_contact1: item.CREtel,
      supplier_contact2: item.CREfax,
      supplier_contact3: item.CREemail,
      supplier_vat_rate: item.CREtaxclass,
      supplier_remark: item.CREmemo,
    }
  })

  const { docs: supplier_olds } = await SupplierModel.getSupplierBy(connection, {
    match: {
      branch_id,
      supplier_origin_id: { $in: supplier_syncs.map(item => item.supplier_origin_id) },
    }
  })

  for (const supplier_sync of supplier_syncs) {
    const supplier_old = supplier_olds.find(val => val.supplier_origin_id === supplier_sync.supplier_origin_id)

    if (supplier_old) {
      await SupplierModel.updateSyncSupplierBy(connection, { ...supplier_old, ...supplier_sync })
    } else {
      supplier_sync.supplier_id = await SupplierModel.generateSupplierID(connection)

      await SupplierModel.insertSyncSupplier(connection, supplier_sync)
    }
  }
}

const syncInvoiceSupplier = async (connection, data) => {
  const {
    branch_id,
    company_id,
    del_sync_time,
    MIH = [],
    MIL = [],
    MIHvnos = [],
  } = data

  if (!MIH.length || !MIHvnos.length) return

  const min_date = MIH.reduce((minDate, current) => {
    const currentDate = new Date(current.MIHkeyDate);

    return currentDate < minDate ? currentDate : minDate;
  }, new Date(MIH[0].MIHkeyDate));

  console.log(`begin sync: [${MIH.length} invoice] MIHkeyDate:[`, formatDate(min_date, 'dd/MM/yyyy HH:mm:fff'), `] estimate time [${MIH.length / 15} minutes]`)

  const branch = await BranchModel.getBranchByID(connection, { branch_id })
  const company = await CompanyModel.getCompanyByID(connection, { company_id })

  const invoice_supplier_syncs = MIH.map(item => {
    return {
      company_id,
      branch_id,
      invoice_supplier_origin_id: item.MIHvnos,
      supplier_origin_id: item.MIHcus,
      supplier_id: item.MIHcus,
      invoice_supplier_name: item.MIHcus,
      invoice_supplier_account_number: item.MIHmec,
      invoice_supplier_branch_name: branch.branch_name,
      invoice_supplier_company_name: company.company_name,
      invoice_supplier_license_plate: item.MIHref1,
      invoice_supplier_date: formatDate(`${item.MIHyear}-${item.MIHmonth}-${item.MIHday}`, 'yyyy-MM-dd'),
      invoice_supplier_key_by: item.MIHkeyUser,
      invoice_supplier_key_date: formatDate(item.MIHkeyDate, 'yyyy-MM-dd HH:mm:ss'),
      invoice_supplier_weight: 0,
      invoice_supplier_price: item.MIHcog,
      invoice_supplier_vat_type: 'exc',
      invoice_supplier_vat_rate: 0,
      invoice_supplier_vat_price: item.MIHvatSUM,
      invoice_supplier_net_price: item.MIHnetSUM,
      invoice_supplier_remark: item.MIHnotes,
      invoice_supplier_paid_type: item.MIHref3,
      invoice_supplier_status: (() => {
        const { MIHref3, MIHcancel } = item

        if (MIHcancel === -1) return 'cancel'
        if (MIHref3 && MIHref3 !== 'เงินโอน') return 'paid'

        return ''
      })(),
    }
  })

  const invoice_supplier_list_syncs = MIL.map(item => {
    const invoice_supplier_list = {
      invoice_supplier_origin_id: item.MILvnos,
      product_origin_id: item.MILstk,
      invoice_supplier_list_convert_weight: item.MILconv,
      invoice_supplier_list_qty: item.MILquan / item.MILconv,
      invoice_supplier_list_weight: item.MILquan,
      invoice_supplier_list_deweight_quality: 0,
      invoice_supplier_list_deweight_percent: 0,
      invoice_supplier_list_deweight_compensation: 0,
      invoice_supplier_list_net_weight: item.MILquan,
      invoice_supplier_list_price: item.MILcog,
      invoice_supplier_list_unit_name: item.MILuname,
      invoice_supplier_list_unit_price: item.MILvCol1,
      invoice_supplier_list_unit_promotion_price: item.MILvCol2,
      invoice_supplier_list_unit_shipping_price: item.MILvCol3,
      invoice_supplier_list_unit_other_price: item.MILvCol4,
      invoice_supplier_list_remark: item.MILnotes,
    }

    if (item.MECcode) {
      const {
        MECc2,
        MECc3,
        MECc4,
        MECi1,
        MECm6,
        MECt5,
        MECt6,
      } = item

      invoice_supplier_list.invoice_supplier_list_qty = MECm6
      invoice_supplier_list.invoice_supplier_list_deweight_quality = MECc2 + MECc4
      invoice_supplier_list.invoice_supplier_list_deweight_compensation = (MECi1 * MECt6) + ((MECc2 * MECt5) / 100) + ((MECc3 * MECt5) / 100)
      invoice_supplier_list.invoice_supplier_list_net_weight = MECt5
    }

    return invoice_supplier_list
  })

  const { docs: invoice_supplier_deletes } = await InvoiceSupplierModel.getInvoiceSupplierBy(connection, {
    match: {
      branch_id,
      invoice_supplier_key_date: { $gte: formatDate(del_sync_time, 'yyyy-MM-dd HH:mm:ss') },
      $and: [
        { invoice_supplier_origin_id: { $ne: '' } },
        { invoice_supplier_origin_id: { $nin: MIHvnos.map(item => item.MIHvnos) } },
      ]
    }
  })
  const { docs: products } = await ProductModel.getProductBy(connection, {
    match: {
      branch_id,
      product_origin_id: { $in: invoice_supplier_list_syncs.map(item => item.product_origin_id) },
    }
  })
  const { docs: suppliers } = await SupplierModel.getSupplierBy(connection, {
    match: {
      branch_id,
      supplier_origin_id: { $in: invoice_supplier_syncs.map(item => item.supplier_origin_id) },
    }
  })

  for (const invoice_supplier_delete of invoice_supplier_deletes) {
    await syncDeleteInvoiceSupplier(connection, invoice_supplier_delete)
  }

  const invs_adds = []
  const invs_updates = []

  for (const invoice_supplier_sync of invoice_supplier_syncs) {
    const invoice_supplier_lists = invoice_supplier_list_syncs.filter(val => val.invoice_supplier_origin_id === invoice_supplier_sync.invoice_supplier_origin_id)
    const supplier = suppliers.find(val => val.supplier_origin_id === invoice_supplier_sync.supplier_origin_id)

    invoice_supplier_lists.forEach(invoice_supplier_list => {
      const product = products.find(val => val.product_origin_id === invoice_supplier_list.product_origin_id)

      if (product) {
        invoice_supplier_list.product_id = product.product_id
        invoice_supplier_list.invoice_supplier_list_name = product.product_name
      } else {
        invoice_supplier_list.product_id = ''
        invoice_supplier_list.invoice_supplier_list_name = ''
      }

      invoice_supplier_sync.invoice_supplier_weight += invoice_supplier_list.invoice_supplier_list_qty ?? 0
    })

    if (supplier) {
      invoice_supplier_sync.supplier_id = supplier.supplier_id
      invoice_supplier_sync.invoice_supplier_name = supplier.supplier_name
      invoice_supplier_sync.invoice_supplier_vate_type = supplier.supplier_vate_type
      invoice_supplier_sync.invoice_supplier_vate_rate = supplier.supplier_vate_rate
    }

    const invoice_supplier_old = await InvoiceSupplierModel.getInvoiceSupplierBy(connection, {
      match: {
        branch_id,
        invoice_supplier_origin_id: invoice_supplier_sync.invoice_supplier_origin_id,
      }
    }).then(res => res.docs[0])

    if (invoice_supplier_old) {
      const { invoice_supplier, is_changed, } = await syncUpdateInvoiceSupplier(connection, {
        invoice_supplier_old,
        invoice_supplier_sync,
        invoice_supplier_lists,
      })

      if (is_changed) invs_updates.push({ invoice_supplier, invoice_supplier_lists, })

      continue
    }

    const invoice_supplier = await syncAddInvoiceSupplier(connection, {
      invoice_supplier_sync,
      invoice_supplier_lists,
    })

    invs_adds.push({ invoice_supplier, invoice_supplier_lists, })
  }

  const today = formatDate(new Date(), 'yyyy-MM-dd')

  const sync_invs_adds = invs_adds.filter(val => val.invoice_supplier.invoice_supplier_date === today)
  const sync_invs_updates = invs_updates.filter(val => val.invoice_supplier.invoice_supplier_date === today)

  await Mailer.createMail(connection, `sync-data:add-invoice`, sync_invs_adds)
  await Mailer.createMail(connection, `sync-data:update-invoice`, sync_invs_updates)

  await Notify.send(connection, `sync-data:add-invoice`, sync_invs_adds)
  await Notify.send(connection, `sync-data:update-invoice`, sync_invs_updates)
}

const syncUpdateInvoiceSupplier = async (connection, data) => {
  const {
    invoice_supplier_old,
    invoice_supplier_sync,
    invoice_supplier_lists = [],
  } = data

  invoice_supplier_sync.invoice_supplier_id = invoice_supplier_old.invoice_supplier_id

  const {
    invoice_supplier_id,
    branch_id,
    supplier_id,
    invoice_supplier_name,
    invoice_supplier_account,
    invoice_supplier_license_plate,
    invoice_supplier_date,
    invoice_supplier_weight,
    invoice_supplier_price,
    invoice_supplier_vat_type,
    invoice_supplier_vat_rate,
    invoice_supplier_vat_price,
    invoice_supplier_net_price,
    invoice_supplier_key_by,
    invoice_supplier_key_date,
    invoice_supplier_paid_type,
    invoice_supplier_remark,
    invoice_supplier_status,
  } = invoice_supplier_sync

  const data_sync = {
    supplier_id,
    invoice_supplier_name,
    invoice_supplier_account,
    invoice_supplier_license_plate,
    invoice_supplier_date,
    invoice_supplier_weight,
    invoice_supplier_price,
    invoice_supplier_vat_type,
    invoice_supplier_vat_rate,
    invoice_supplier_vat_price,
    invoice_supplier_net_price,
    invoice_supplier_key_by,
    invoice_supplier_key_date,
    invoice_supplier_paid_type,
    invoice_supplier_remark,
    invoice_supplier_status,
  }

  const { docs: invoice_supplier_list_olds } = await InvoiceSupplierListModel.getInvoiceSupplierListBy(connection, {
    match: { invoice_supplier_id, },
  })

  const change_cases = [
    () => invoice_supplier_status === 'cancel' && invoice_supplier_old.invoice_supplier_status !== 'cancel',
    () => isChange(invoice_supplier_old, invoice_supplier_sync),
    () => invoice_supplier_list_olds.length !== invoice_supplier_lists.length,
    () => {
      for (const invoice_supplier_list of invoice_supplier_lists) {
        const invoice_supplier_list_old = invoice_supplier_list_olds.find(val => (
          val.product_id === invoice_supplier_list.product_id
          && toFloat(val.invoice_supplier_list_qty) === toFloat(invoice_supplier_list.invoice_supplier_list_qty)
          && toFloat(val.invoice_supplier_list_net_weight) === toFloat(invoice_supplier_list.invoice_supplier_list_net_weight)
          && toFloat(val.invoice_supplier_list_price) === toFloat(invoice_supplier_list.invoice_supplier_list_price)
        ))

        if (!invoice_supplier_list_old) return true
      }

      return false
    },
  ]

  const is_changed = change_cases.find(changed => changed()) ? true : false

  const payment_old = await PaymentModel.getPaymentBy(connection, { match: { invoice_supplier_id } }).then(res => res.docs[0])

  if (invoice_supplier_status === 'cancel') {
    if (payment_old) {
      await PaymentLogModel.deletePaymentLogBy(connection, { match: { payment_id: payment_old.payment_id } })
      await PaymentModel.deletePaymentBy(connection, { match: { payment_id: payment_old.payment_id } })
    }
  } else {
    if (invoice_supplier_old.invoice_supplier_status) {
      data_sync.invoice_supplier_status = invoice_supplier_old.invoice_supplier_status
    }

    if (invoice_supplier_paid_type === 'เงินโอน') {
      if (invoice_supplier_old.invoice_supplier_paid_type !== 'เงินโอน' || (payment_old && payment_old.payment_type !== 'เงินโอน')) {
        data_sync.invoice_supplier_status = ''
      } else if (is_changed || (payment_old && payment_old.payment_net_price !== invoice_supplier_net_price)) {
        data_sync.invoice_supplier_status = 'invalid'
      }
    }

    if (data_sync.invoice_supplier_status === invoice_supplier_old.invoice_supplier_status) {
      delete data_sync.invoice_supplier_status
    }

    if (payment_old) {
      await PaymentModel.updateSyncPaymentBy(connection, {
        payment_id: payment_old.payment_id,
        payment_type: invoice_supplier_paid_type,
        payment_price: invoice_supplier_price,
        payment_vat_price: invoice_supplier_vat_price,
        payment_net_price: invoice_supplier_net_price,
      })
    } else if (invoice_supplier_paid_type !== 'เงินโอน' && ['invalid', 'paid'].includes(data_sync.invoice_supplier_status)) {
      await PaymentModel.insertSyncPayment(connection, {
        invoice_supplier_id,
        branch_id,
        payment_type: invoice_supplier_paid_type,
        payment_date: new Date(),
        payment_price: invoice_supplier_price,
        payment_vat_price: invoice_supplier_vat_price,
        payment_net_price: invoice_supplier_net_price,
      })
    }
  }

  await InvoiceSupplierListModel.deleteInvoiceSupplierListBy(connection, { match: { invoice_supplier_id } })

  await InvoiceSupplierModel.setUpdateBy(connection, { set: data_sync, match: { invoice_supplier_id, }, })
  await InvoiceSupplierListModel.insertSyncInvoiceSupplierList(connection, {
    invoice_supplier_id,
    invoice_supplier_lists,
  })

  return { invoice_supplier: invoice_supplier_sync, is_changed }
}

const syncAddInvoiceSupplier = async (connection, data) => {
  const { invoice_supplier_sync, invoice_supplier_lists = [], } = data

  const {
    branch_id,
    supplier_id,
    invoice_supplier_date,
    invoice_supplier_price,
    invoice_supplier_vat_price,
    invoice_supplier_net_price,
    invoice_supplier_paid_type,
    invoice_supplier_status,
  } = invoice_supplier_sync

  if (invoice_supplier_status !== 'cancel' && invoice_supplier_paid_type === 'เงินโอน') {
    const { docs: invs_duplicates } = await InvoiceSupplierModel.getInvoiceSupplierBy(connection, {
      match: {
        branch_id,
        supplier_id,
        invoice_supplier_date,
        invoice_supplier_net_price,
        invoice_supplier_paid_type,
      }
    })

    if (invs_duplicates.length) invoice_supplier_sync.invoice_supplier_status = 'invalid'
  }

  invoice_supplier_sync.invoice_supplier_id = await InvoiceSupplierModel.generateInvoiceSupplierID(connection)

  await InvoiceSupplierModel.insertSyncInvoiceSupplier(connection, invoice_supplier_sync)
  await InvoiceSupplierListModel.insertSyncInvoiceSupplierList(connection, {
    invoice_supplier_id: invoice_supplier_sync.invoice_supplier_id,
    invoice_supplier_lists,
  })

  if (invoice_supplier_status !== 'cancel' && invoice_supplier_paid_type !== 'เงินโอน' && ['invalid', 'paid'].includes(invoice_supplier_sync.invoice_supplier_status)) {
    await PaymentModel.insertSyncPayment(connection, {
      invoice_supplier_id: invoice_supplier_sync.invoice_supplier_id,
      branch_id,
      payment_type: invoice_supplier_paid_type,
      payment_date: new Date(),
      payment_price: invoice_supplier_price,
      payment_vat_price: invoice_supplier_vat_price,
      payment_net_price: invoice_supplier_net_price,
    })
  }

  return invoice_supplier_sync
}

const syncDeleteInvoiceSupplier = async (connection, data) => {
  const { invoice_supplier_id, } = data

  const { docs: payments } = await PaymentModel.getPaymentBy(connection, { match: { invoice_supplier_id } })

  for (const payment of payments) {
    await PaymentLogModel.deletePaymentLogBy(connection, { match: { payment_id: payment.payment_id } })
    await PaymentModel.deletePaymentBy(connection, { match: { payment_id: payment.payment_id } })
  }

  await InvoiceSupplierListModel.deleteInvoiceSupplierListBy(connection, { match: { invoice_supplier_id } })
  await InvoiceSupplierModel.deleteInvoiceSupplierBy(connection, { match: { invoice_supplier_id } })
}

Task.getSyncDataBy = (connection, data) => SyncDataModel.getSyncDataBy(connection, data)

Task.registerToSync = async (connection, data) => {
  const {
    branch_id,
    company_id,
  } = data

  const sync_data = await SyncDataModel.getSyncDataBy(connection, {
    match: { branch_id, company_id, }
  }).then(res => res.docs[0])

  if (sync_data) {
    sync_data.del_sync_time = new Date(sync_data.last_sync_time);
    sync_data.del_sync_time.setDate(sync_data.del_sync_time.getDate() - 1);

    return sync_data
  }

  await BranchModel.getBranchByID(connection, { branch_id })
  await CompanyModel.getCompanyByID(connection, { company_id })

  const new_sync_data = {
    sync_data_id: await SyncDataModel.generateSyncDataID(connection),
    branch_id,
    company_id,
    sync_data_status: '',
    del_sync_time: new Date('2011-01-01 00:00:00'),
    last_sync_time: new Date('2011-01-01 00:00:00'),
  }

  await SyncDataModel.insertSyncData(connection, new_sync_data)

  return new_sync_data
}
Task.preSyncData = async (connection, data) => {
  const { sync_data_id, } = data

  const sync_data = await SyncDataModel.getSyncDataByID(connection, { sync_data_id, })

  if (sync_data.sync_data_status === 'queue') return

  await SyncDataModel.updateSyncDataStatusBy(connection, {
    sync_data_id,
    sync_data_status: 'queue',
  })

  data.branch_id = sync_data.branch_id
  data.company_id = sync_data.company_id

  queue['sync-data'].add({
    adddate: new Date(),
    payload: JSON.stringify(data),
  }, { lifo: true })
}
Task.syncData = async (connection, data) => {
  const {
    sync_data_id,
    current_sync_time,
  } = data

  await syncProduct(connection, data)
  await syncSupplier(connection, data)
  await syncInvoiceSupplier(connection, data)

  await SyncDataModel.updateSyncDataFinishBy(connection, {
    sync_data_id,
    last_sync_time: current_sync_time,
  })
}

module.exports = Task