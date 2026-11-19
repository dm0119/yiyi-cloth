const mysql = require('mysql2/promise');
const config = require('./config');

(async () => {
  const conn = await mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database
  });

  const [shops] = await conn.execute('SELECT id, name, return_address, shipping_address FROM shops');
  console.log('商家地址设置情况:');
  shops.forEach(s => {
    console.log(`  店铺: ${s.name}, 退货地址: ${s.return_address || '(未设置)'}, 发货地址: ${s.shipping_address || '(未设置)'}`);
  });

  await conn.end();
})();
