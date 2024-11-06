const fs = require("fs");
const style = require("./assets/style.js");

const {
  InvoiceSupplierListModel,
  InvoiceSupplierModel,
  SupplierModel,
  UserModel,
} = require("@/models");

const { getUserNotifyActive } = require("@/utils/auth-helper");
const { formatDate } = require("@/utils/date-helper");
const { decimalFix } = require("@/utils/number-helper");

const invoiceSupplierDetailHtml = (data) => {
  const { invoice_supplier, supplier, invoice_supplier_lists } = data;

  const list_html = invoice_supplier_lists
    .map(
      (item, idx) => `
    <tr>
      <td class="text-center">${idx + 1}</td>
      <td class="align-middle">
        <div>${item.invoice_supplier_list_name}</div>
        <div>${item.invoice_supplier_list_remark}</div>
      </td>
      <td class="text-right">${decimalFix(
        item.invoice_supplier_list_net_weight
      )}</td>
      <td class="text-right">${decimalFix(
        item.invoice_supplier_list_unit_price
      )}</td>
      <td class="text-right">${decimalFix(
        item.invoice_supplier_list_price
      )}</td>
    </tr>
  `
    )
    .join("");

  return `
    <div class="d-flex justify-space-between">
      <table>
        <thead>
          <tr>
            <th style="width: 120px;"></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-right">รหัสบันทึกรับ :</td>
            <td class="text-muted">${invoice_supplier.invoice_supplier_id}</td>
          </tr>
          <tr>
            <td class="text-right">วันที่ :</td>
            <td class="text-muted">${formatDate(
              invoice_supplier.invoice_supplier_date
            )}</td>
          </tr>
          <tr>
            <td class="text-right">รหัสผู้ขาย :</td>
            <td class="text-muted">${supplier.supplier_origin_id ?? "-"}</td>
          </tr>
          <tr>
            <td class="text-right">ชื่อบริษัท/ผู้ขาย :</td>
            <td class="text-muted">${
              invoice_supplier.invoice_supplier_name ?? "-"
            }</td>
          </tr>
          <tr>
            <td class="text-right">ทะเบียนรถ :</td>
            <td class="text-muted">${
              invoice_supplier.invoice_supplier_license_plate ?? "-"
            }</td>
          </tr>
          <tr>
            <td class="text-right">ช่องทางติดต่อ :</td>
            <td class="text-muted">${
              invoice_supplier.invoice_supplier_contact ?? "-"
            }</td>
          </tr>
        </tbody>
      </table>
    </div>
    <table class="w-100">
      <thead>
        <tr>
          <th class="text-center" style="width: 48px;"> ลำดับ </th>
          <th class="text-center" scope="Description"> รายละเอียดสินค้า </th>
          <th class="text-center" style="width: 140px;" scope="Qty"> น้ำหนัก </th>
          <th class="text-center" style="width: 140px;" scope="Price"> ราคาต่อหน่วย/กก. </th>
          <th class="text-center" style="width: 140px;" scope="PriceTotal"> จำนวนเงิน </th>
        </tr>
      </thead>
      <tbody>
        ${list_html}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" rowspan="2">หมายเหตุ : ${
            invoice_supplier.invoice_supplier_remark ?? "-"
          }</td>
          <td class="text-right">น้ำหนักรวม</td>
          <td class="text-right">${decimalFix(
            invoice_supplier.invoice_supplier_weight
          )} กิโลกรัม</td></tr>
        </tr>
        <tr>
          <td class="text-right">ยอดรวม</td>
          <td class="text-right">${decimalFix(
            invoice_supplier.invoice_supplier_net_price
          )} บาท</td>
        </tr>
      </tfoot>
    </table>
  `;
};

const paymentPaid = async (connection, data) => {
  const { invoice_supplier_id, user_id } = data;

  const invoice_supplier = await InvoiceSupplierModel.getInvoiceSupplierByID(
    connection,
    { invoice_supplier_id }
  );
  const supplier = await SupplierModel.getSupplierByID(connection, {
    supplier_id: invoice_supplier.supplier_id,
  });
  const user = await UserModel.getUserByID(connection, { user_id });

  const { docs: invoice_supplier_lists } =
    await InvoiceSupplierListModel.getInvoiceSupplierListBy(connection, {
      match: { invoice_supplier_id },
    });

  const users = await getUserNotifyActive(connection, {
    branch_id: invoice_supplier.branch_id,
    event_key: "payment",
    event_type: "mail",
  });

  const icon = fs.readFileSync(
    __dirname + "/assets/images/icon-success.png",
    "binary"
  );
  const item_url = `<a href="${process.env.WEB_CLIENT_URL}/invoice-supplier/detail?id=${invoice_supplier_id}">${invoice_supplier.invoice_supplier_origin_id}</a>`;

  return {
    mails: [
      {
        subject: `(revel-task) ${invoice_supplier.invoice_supplier_origin_id} - ${invoice_supplier.invoice_supplier_branch_name} มีการชำระแล้ว`,
        html: `
        <html>
          <head>
            <style>${style}</style>
          </head>
          <body>
            <div class="container">
              <img class="subject-icon" src="cid:subject-icon"/>
              <p>รายการรับ ${item_url}</p>
              <p>ได้รับการชำระแล้วเมื่อ ${formatDate(
                new Date(),
                "HH:mm dd/MM/yyyy"
              )}</p>
              <p>โดย ${user.user_fullname}</p>
              ${invoiceSupplierDetailHtml({
                invoice_supplier,
                supplier,
                invoice_supplier_lists,
              })}
            </div>
          </body>
        </html>
      `,
        attachments: [
          {
            path: `data:image/jpg;base64,${Buffer.from(icon, "binary").toString(
              "base64"
            )}`,
            cid: "subject-icon",
          },
        ],
      },
    ],
    emails: users.map((item) => item.user_email).filter((val) => val),
  };
};

const paymentInvalid = async (connection, data) => {
  const { invoice_supplier_id, user_id } = data;

  const invoice_supplier = await InvoiceSupplierModel.getInvoiceSupplierByID(
    connection,
    { invoice_supplier_id }
  );
  const supplier = await SupplierModel.getSupplierByID(connection, {
    supplier_id: invoice_supplier.supplier_id,
  });
  const user = await UserModel.getUserByID(connection, { user_id });

  const { docs: invoice_supplier_lists } =
    await InvoiceSupplierListModel.getInvoiceSupplierListBy(connection, {
      match: { invoice_supplier_id },
    });

  const users = await getUserNotifyActive(connection, {
    branch_id: invoice_supplier.branch_id,
    event_key: "payment",
    event_type: "mail",
  });

  const icon = fs.readFileSync(
    __dirname + "/assets/images/icon-danger.png",
    "binary"
  );
  const item_url = `<a href="${process.env.WEB_CLIENT_URL}/invoice-supplier/detail?id=${invoice_supplier_id}">${invoice_supplier.invoice_supplier_origin_id}</a>`;

  return {
    mails: [
      {
        subject: `(revel-task) ${invoice_supplier.invoice_supplier_origin_id} - ${invoice_supplier.invoice_supplier_branch_name} ยอดชำระไม่ถูกต้อง`,
        html: `
        <html>
          <head>
            <style>${style}</style>
          </head>
          <body>
            <div class="container">
              <img class="subject-icon" src="cid:subject-icon"/>
              <p>รายการรับ ${item_url}</p>
              <p>ทำรายการเมื่อ ${formatDate(new Date(), "HH:mm dd/MM/yyyy")}</p>
              <p>โดย ${user.user_fullname}</p>
              ${invoiceSupplierDetailHtml({
                invoice_supplier,
                supplier,
                invoice_supplier_lists,
              })}
            </div>
          </body>
        </html>
      `,
        attachments: [
          {
            path: `data:image/jpg;base64,${Buffer.from(icon, "binary").toString(
              "base64"
            )}`,
            cid: "subject-icon",
          },
        ],
      },
    ],
    emails: users.map((item) => item.user_email).filter((val) => val),
  };
};

module.exports = {
  "payment:paid": paymentPaid,
  "payment:invalid": paymentInvalid,
};
