const Task = function (task) { this.task = task.task }

const {
  BookBankBranchModel,
  BookBankModel,
} = require("@/models")

Task.generateBookBankID = (connection) => BookBankModel.generateBookBankID(connection)
Task.getBookBankBy = (connection, data) => BookBankModel.getBookBankBy(connection, data)
Task.getBookBankByID = (connection, data) => BookBankModel.getBookBankByID(connection, data)
Task.getPaymentBookBankBy = async (connection, data) => BookBankModel.getPaymentBookBankBy(connection, data)

Task.insertBookBank = async (connection, data) => {
  const { book_bank, book_bank_branchs } = data

  await BookBankModel.insertBookBank(connection, data)
  await BookBankBranchModel.insertBookBankBranch(connection, {
    book_bank_id: book_bank.book_bank_id,
    book_bank_branchs,
  })
}
Task.updateBookBankBy = async (connection, data) => {
  const { book_bank, book_bank_branchs } = data

  await BookBankBranchModel.deleteBookBankBranchBy(connection, { match: { book_bank_id: book_bank.book_bank_id } })

  await BookBankModel.updateBookBankBy(connection, book_bank)
  await BookBankBranchModel.insertBookBankBranch(connection, {
    book_bank_id: book_bank.book_bank_id,
    book_bank_branchs,
  })
}
Task.deleteBookBankBy = async (connection, data) => {
  const { book_bank_id } = data

  await BookBankModel.deleteBookBankBy(connection, { match: { book_bank_id } })
  await BookBankBranchModel.deleteBookBankBranchBy(connection, { match: { book_bank_id } })
}

module.exports = Task