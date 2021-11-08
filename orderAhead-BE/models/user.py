from .postgres_db import PostgresDB

db = PostgresDB()

class User:
    med_id = 0
    def __init__(self, med_id = 0):
      self.med_id = med_id
      pass

    def get_customer_id(self):
      result = db.fetchone(f'SELECT "Customer ID" FROM "Customers" WHERE "Customer Med ID" = \'{self.med_id}\';')
      customer_id = result[0]
      return customer_id

    def get_all_receipts(self, customer_id):
      sql = f'SELECT "Transaction Date", "Receipt Total", "Employee Name", "Receipt ID" FROM "Sales_Daily" WHERE "Customer ID" = \'{customer_id}\';'
      print(sql)
      result = db.fetchall(sql)

      receipt_list = []
      for record in result:
        receipt_id = record[3]
        receipt = {
            'date': record[0],
            'total': record[1],
            'employee': record[2],
            'receipt_id': receipt_id,
        }
        receipt['items'] = self.get_items_by_receipt(receipt_id)

        receipt_list.append(receipt)

      print('done query')

      return receipt_list

    def get_items_by_receipt(self, receipt_id):
      sql = f'SELECT "Quantity Sold", "Product Name", "Category", "Price", "Tax in Dollars", "Receipt Total" FROM "Sales_by_item_Daily" WHERE "Receipt ID" = \'{receipt_id}\';'
      print(sql)
      result = db.fetchall(sql)

      item_list = []
      for record in result:
        item = {
            'qty': record[0],
            'name': record[1],
            'category': record[2],
            'price': record[3],
            'tax': record[4],
            'total': record[5],

        }
        item_list.append(item)

      return item_list

    def get_last_purchases_by_date(self):
      result = []
      try:
        db.connect()

        customer_id = self.get_customer_id()
        print('customer_id', customer_id)
        receipt_list = self.get_all_receipts(customer_id)


        # group1 = {
        #     'date': '8/27/2021',
        #     'total': 10,
        #     'employee': '<employee1>',
        #     'receipt_id': '<receipt_id1>',
        #     'items': [
        #         {
        #             'qty': 1,
        #             'name': '<item name>',
        #             'category': 'Northwoods Wellness',
        #             'price': 0,
        #             'tax': 0,
        #             'total': 0,
        #         },
        #         {
        #             'qty': 10,
        #             'name': '<item name2>',
        #             'category': 'Northwoods Wellness3',
        #             'price': 30,
        #             'tax': 40,
        #             'total': 20,
        #         },
        #     ],
        # }
        # }

        db.close()
      except Exception as e:
        print('Exception', e)


      return receipt_list

