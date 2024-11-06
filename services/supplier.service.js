const Task = function (task) { this.task = task.task }

const { SupplierModel } = require("@/models")

const mapMainSupplier = async (connection, data) => {
  let { supplier_main_id } = data

  if (!supplier_main_id) return ''

  let break_point = 0
  while (break_point < 10) {
    const { docs: suppliers } = await SupplierModel.getSupplierBy(connection, {
      match: { supplier_id: supplier_main_id, }
    })

    if (!suppliers.length) break

    supplier_main_id = suppliers[0].supplier_id

    if (!suppliers[0].supplier_main_id) break

    supplier_main_id = suppliers[0].supplier_main_id

    break_point++
  }

  return supplier_main_id
}

Task.generateSupplierID = (connection) => SupplierModel.generateSupplierID(connection)
Task.getSupplierBy = (connection, data) => SupplierModel.getSupplierBy(connection, data)
Task.getSupplierByID = (connection, data) => SupplierModel.getSupplierByID(connection, data)

Task.insertSupplier = async (connection, data) => {
  if (!data.supplier_id) {
    data.supplier_id = await SupplierModel.generateSupplierID(connection)
  }

  data.supplier_main_id = await mapMainSupplier(connection, data)

  await SupplierModel.insertSupplier(connection, data)
}
Task.updateSupplierBy = async (connection, data) => {
  data.supplier_main_id = await mapMainSupplier(connection, data)

  await SupplierModel.updateSupplierBy(connection, data)

  if (data.supplier_main_id) {
    await SupplierModel.setUpdateBy(connection, {
      set: { supplier_main_id: data.supplier_main_id },
      match: { supplier_main_id: { $eq: data.supplier_id } },
    })
  }
}
Task.updateSameSupplierBy = async (connection, data) => {
  const { supplier_main_id, supplier_ids } = data

  if (!supplier_ids.length) return

  await SupplierModel.setUpdateBy(connection, {
    set: { supplier_main_id },
    match: { supplier_id: { $in: supplier_ids } },
  })

  await SupplierModel.setUpdateBy(connection, {
    set: { supplier_main_id: '' },
    match: {
      $or: [
        { supplier_id: supplier_main_id },
        { supplier_main_id: { $in: supplier_ids.filter(val => val !== supplier_main_id) } }
      ]
    },
  })
}
Task.deleteSupplierBy = async (connection, data) => {
  const { supplier_id } = data

  const { docs: supplier_sames } = await SupplierModel.getSupplierBy(connection, {
    match: { supplier_main_id: supplier_id, }
  })

  if (supplier_sames.length) {
    const supplier_same = supplier_sames[0]

    if (supplier_sames.length > 1) {
      await SupplierModel.setUpdateBy(connection, {
        set: { supplier_main_id: supplier_same.supplier_id },
        match: { supplier_main_id: supplier_id },
      })
    }

    await SupplierModel.setUpdateBy(connection, {
      set: { supplier_main_id: '' },
      match: { supplier_id: supplier_same.supplier_id },
    })
  }

  await SupplierModel.deleteSupplierBy(connection, { match: { supplier_id } })
}

module.exports = Task