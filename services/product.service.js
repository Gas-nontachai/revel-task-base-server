const Task = function (task) { this.task = task.task }

const { ProductModel } = require("@/models")

const mapMainProduct = async (connection, data) => {
  let { product_main_id } = data

  if (!product_main_id) return ''

  let break_point = 0
  while (break_point < 10) {
    const { docs: products } = await ProductModel.getProductBy(connection, {
      match: { product_id: product_main_id, }
    })

    if (!products.length) break

    product_main_id = products[0].product_id

    if (!products[0].product_main_id) break

    product_main_id = products[0].product_main_id

    break_point++
  }

  return product_main_id
}

Task.getProductBy = async (connection, data) => {
  const products = await ProductModel.getProductBy(connection, data)

  return products
}
Task.insertProduct = async (connection, data) => {
  if (!data.product_id) {
    data.product_id = await ProductModel.generateProductID(connection)
  }

  data.product_main_id = await mapMainProduct(connection, data)

  await ProductModel.insertProduct(connection, data)
}
Task.updateProductBy = async (connection, data) => {
  data.product_main_id = await mapMainProduct(connection, data)

  await ProductModel.updateProductBy(connection, data)

  if (data.product_main_id) {
    await ProductModel.setUpdateBy(connection, {
      set: { product_main_id: data.product_main_id },
      match: { product_main_id: { $eq: data.product_id } },
    })
  }
}
Task.updateSameProductBy = async (connection, data) => {
  const { product_main_id, product_ids } = data

  if (!product_ids.length) return

  await ProductModel.setUpdateBy(connection, {
    set: { product_main_id },
    match: { product_id: { $in: product_ids } },
  })

  await ProductModel.setUpdateBy(connection, {
    set: { product_main_id: '' },
    match: {
      $or: [
        { product_id: product_main_id },
        { product_main_id: { $in: product_ids.filter(val => val !== product_main_id) } }
      ]
    },
  })
}
Task.deleteProductBy = async (connection, data) => {
  const { product_id } = data

  const { docs: product_sames } = await ProductModel.getProductBy(connection, {
    match: { product_main_id: product_id, }
  })

  if (product_sames.length) {
    const product_same = product_sames[0]

    if (product_sames.length > 1) {
      await ProductModel.setUpdateBy(connection, {
        set: { product_main_id: product_same.product_id },
        match: { product_main_id: product_id },
      })
    }

    await ProductModel.setUpdateBy(connection, {
      set: { product_main_id: '' },
      match: { product_id: product_same.product_id },
    })
  }

  await ProductModel.deleteProductBy(connection, { match: { product_id } })
}

module.exports = Task