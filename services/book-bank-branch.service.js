const Task = function (task) { this.task = task.task }

const {
  BookBankBranchModel,
  BranchModel,
} = require("@/models")

Task.getBookBankBranchBy = async (connection, data) => {
  const { options = [] } = data

  const book_bank_branchs = await BookBankBranchModel.getBookBankBranchBy(connection, data)

  if (options.length) {
    for (const book_bank_branch of book_bank_branchs.docs) {
      if (options.includes('branch')) {
        book_bank_branch.branch = await BranchModel.getBranchBy(connection, {
          match: { branch_id: book_bank_branch.branch_id, }
        }).then(res => res.docs[0])
      }
    }
  }

  return book_bank_branchs
}

module.exports = Task