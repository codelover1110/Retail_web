import psycopg2

class PostgresDB:
  conn = None

  def connect(self):
    self.conn = psycopg2.connect(
      host="52.191.3.0",
      database="web_db",
      user="postgres",
      password="N^cfZkujmn3dIjMjVHd")

  def close(self):
    if self.conn is not None:
      self.conn.close()

  def fetchone(self, sql, mapping = None):
    cur = self.conn.cursor()
    cur.execute(sql)
    result = cur.fetchone()
    cur.close()

    return self.build_object(result, mapping)

  def iter_row(self, cursor, size=10):
    while True:
        rows = cursor.fetchmany(size)
        if not rows:
            break
        for row in rows:
            yield row

  def fetchall(self, sql, mapping = None):
    cur = self.conn.cursor()
    cur.execute(sql)

    result = []
    for row in self.iter_row(cur):
      obj = self.build_object(row, mapping)
      result.append(obj)

    cur.close()

    return result


  def build_object(self, row, mapping):
    if mapping == None:
      return row

    return mapping(row)

    # keys = mapping.keys()
    # values = mapping.values()