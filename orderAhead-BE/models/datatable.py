from .postgres_db import PostgresDB


class Datatable:

  def load_data(self):
    sql = self.build_sql()

    db = PostgresDB()
    db.connect()
    result = db.fetchall(sql, self.mapping)
    db.close()


    return result

  def mapping(self, record):
    obj = {}
    index = 0
    for field_name in self.field_names():
      obj[field_name] = str(record[index])
      index += 1
    return obj

  def build_sql(self):
    raise NotImplementedError("Please Implement this method")

    # sql = 'SELECT "Brand", COUNT("Receipt ID") AS "Sales", SUM("Quantity Sold") AS Units FROM "Sales_by_item_Daily" GROUP BY "Brand";'
    # return sql

  def field_names(self):
    raise NotImplementedError("Please Implement this method")